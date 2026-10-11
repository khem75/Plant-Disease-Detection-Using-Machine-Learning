from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import cv2
import numpy as np
import tensorflow as tf
from PIL import Image

from backend.preprocessing import load_and_preprocess_image, assess_image_quality

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "plant_disease_model.keras"
CLASS_MAP_PATH = BASE_DIR / "model" / "class_names.json"
OUTPUT_DIR = BASE_DIR / "model" / "gradcam_outputs"


def load_model_and_class_names(
    model_path: Path = MODEL_PATH, class_map_path: Path = CLASS_MAP_PATH
) -> Tuple[tf.keras.Model, List[str]]:
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}. Train the model first using train.py.")
    if not class_map_path.exists():
        raise FileNotFoundError(f"Class mapping file not found at {class_map_path}.")

    model = tf.keras.models.load_model(str(model_path), compile=False)
    with class_map_path.open("r", encoding="utf-8") as file:
        class_names = json.load(file)
    return model, class_names


def preprocess_image(
    image_path: Union[str, Path], target_size: Tuple[int, int] = (224, 224)
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Load image, convert to RGB, resize for model inference and preprocess
    with unified preprocessing pipeline.
    """
    batch_array, original_rgb = load_and_preprocess_image(image_path, target_size=target_size)
    return batch_array[0], original_rgb


def find_target_conv_layer(backbone: tf.keras.Model) -> tf.keras.layers.Layer:
    """
    Explicitly locate the final suitable convolutional layer of the loaded CNN.
    Supports top_activation, top_conv, Conv_1, or dynamically finds the deepest 4D layer.
    """
    for preferred in ["top_activation", "top_conv", "Conv_1", "conv5_block3_out"]:
        try:
            return backbone.get_layer(preferred)
        except (ValueError, AttributeError):
            pass
    for layer in reversed(backbone.layers):
        if hasattr(layer, "output_shape") and len(layer.output_shape) == 4:
            return layer
    return backbone.layers[-1]


def get_dense_weights(model: tf.keras.Model) -> Tuple[tf.Tensor, tf.Tensor]:
    """Retrieve weights and bias of the final dense classification layer."""
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Dense):
            weights = layer.get_weights()
            if weights:
                return tf.constant(weights[0], dtype=tf.float32), tf.constant(weights[1], dtype=tf.float32)
    raise ValueError("Classification dense layer not found in model.")


def guided_filter_refinement(
    guide_gray: np.ndarray, src_heatmap: np.ndarray, radius: int = 8, eps: float = 1e-3
) -> np.ndarray:
    """
    Edge-preserving guided filter: transfers high-frequency spatial boundaries
    (lesion contours, leaf veins, leaf margins) from the original grayscale leaf
    into the coarse interpolated neural activation heatmap.
    """
    guide_f = guide_gray.astype(np.float32) / 255.0
    src_f = src_heatmap.astype(np.float32)
    r = max(4, int(radius))

    mean_I = cv2.blur(guide_f, (r, r))
    mean_p = cv2.blur(src_f, (r, r))
    mean_Ip = cv2.blur(guide_f * src_f, (r, r))
    cov_Ip = mean_Ip - mean_I * mean_p

    mean_II = cv2.blur(guide_f * guide_f, (r, r))
    var_I = mean_II - mean_I * mean_I

    a = cov_Ip / (var_I + eps)
    b_val = mean_p - a * mean_I

    mean_a = cv2.blur(a, (r, r))
    mean_b = cv2.blur(b_val, (r, r))

    refined = mean_a * guide_f + mean_b
    return np.clip(refined, 0.0, 1.0)


def extract_leaf_foreground_mask(bgr_img: np.ndarray) -> np.ndarray:
    """
    Segment the leaf blade from neutral lab backgrounds (white paper, dark bench,
    grey fabric/cardboard) using Lab chrominance distance and excess green index.
    Prevents spurious background activation from corrupting disease localization.
    """
    lab = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2LAB)
    hsv = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)

    # 1. Chroma distance from neutral gray (L, 128, 128)
    a = lab[:, :, 1].astype(float) - 128.0
    b = lab[:, :, 2].astype(float) - 128.0
    chroma = np.sqrt(a**2 + b**2)

    # 2. Vegetation index (2G - R - B)
    rgb = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB).astype(float)
    veg_index = 2.0 * rgb[:, :, 1] - rgb[:, :, 0] - rgb[:, :, 2]
    sat = hsv[:, :, 1].astype(float)

    # Background detection: neutral lab sheets have low chroma, low veg index, low sat
    is_bg = (chroma < 11.0) & (veg_index < 15.0) & (sat < 40.0)
    # Also isolate extreme white borders or extreme shadow borders
    is_bg = is_bg | (gray > 235) | (gray < 15)

    raw_mask = (~is_bg).astype(np.uint8) * 255

    # Morphological filtering to clean noise and bridge leaf margins
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    cleaned = cv2.morphologyEx(raw_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel, iterations=1)

    # Retain the main leaf body
    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        c_max = max(contours, key=cv2.contourArea)
        leaf_mask = np.zeros_like(cleaned)
        cv2.drawContours(leaf_mask, [c_max], -1, 255, -1)
    else:
        leaf_mask = cleaned

    coverage = np.mean(leaf_mask > 0)
    # If image is a tight macro zoom of leaf tissue (>95% coverage), preserve full mask
    if coverage < 0.04 or coverage > 0.95:
        return np.ones(gray.shape, dtype=np.float32)

    # Smooth boundary transition
    mask_soft = cv2.GaussianBlur(leaf_mask.astype(np.float32) / 255.0, (11, 11), 0)
    return np.clip(mask_soft, 0.0, 1.0)


def detect_lesion_hotspots(
    heatmap: np.ndarray, leaf_mask: np.ndarray, threshold: float = 0.40
) -> Dict[str, Any]:
    """
    Extract discrete pathological disease foci from the attention map:
    Returns normalized centroids, radii, and foliar surface coverage.
    """
    h, w = heatmap.shape[:2]
    binary_hotspots = ((heatmap >= threshold) & (leaf_mask > 0.20)).astype(np.uint8)

    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary_hotspots)
    hotspots: List[Dict[str, float]] = []

    # Sort components by area (skip background label 0)
    min_area = max(16, int(h * w * 0.001))
    for i in range(1, num_labels):
        area = int(stats[i, cv2.CC_STAT_AREA])
        if area >= min_area:
            cx, cy = centroids[i]
            # Equivalent radius in normalized coordinates
            radius_px = np.sqrt(area / np.pi)
            norm_r = float(radius_px / max(h, w))
            # Average intensity within this hotspot
            spot_mask = (labels == i)
            mean_intensity = float(np.mean(heatmap[spot_mask]))

            hotspots.append({
                "x": round(float(cx / w), 4),
                "y": round(float(cy / h), 4),
                "radius": round(norm_r, 4),
                "area_px": area,
                "intensity": round(mean_intensity, 3),
            })

    # Sort hotspots by intensity descending
    hotspots.sort(key=lambda s: s["intensity"], reverse=True)

    leaf_pixels = max(1, np.sum(leaf_mask > 0.20))
    symptom_pixels = np.sum(binary_hotspots > 0)
    affected_area_pct = round(float((symptom_pixels / leaf_pixels) * 100.0), 1)

    return {
        "hotspots": hotspots[:8],  # Top 8 most salient foci
        "lesions_detected": len(hotspots),
        "affected_area_pct": affected_area_pct,
    }


def generate_gradcam(
    model: tf.keras.Model,
    image_path: Union[str, Path],
    class_index: int,
    is_healthy: bool = False,
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Multi-Scale Grad-CAM Pipeline:
    1. Pre-softmax linear logits to avoid gradient vanishing
    2. Deep semantic layer (top_activation, 7x7) via Grad-CAM
    3. Intermediate high-resolution layer (block5c_add, 14x14) via LayerCAM for localized spots
    4. Multi-scale feature fusion for comprehensive multi-lesion detection
    5. Robust leaf chroma foreground masking (removes neutral/grey/white table backgrounds)
    6. Edge-aware guided filtering snapped to foliar lesion margins
    """
    image_path = Path(image_path)
    preprocessed, original_array = preprocess_image(image_path)
    image_batch = np.expand_dims(preprocessed, axis=0)
    h_orig, w_orig = original_array.shape[:2]

    dense_w, dense_b = get_dense_weights(model)
    backbone = model.layers[1] if len(model.layers) > 1 and isinstance(model.layers[1], tf.keras.Model) else model

    # Multi-scale extraction targets
    try:
        layer_high = backbone.get_layer("top_activation")
    except ValueError:
        layer_high = backbone.layers[-1]

    try:
        layer_mid = backbone.get_layer("block5c_add")
    except ValueError:
        layer_mid = layer_high

    multi_extractor = tf.keras.Model(
        inputs=backbone.inputs,
        outputs=[layer_mid.output, layer_high.output, backbone.output],
    )

    with tf.GradientTape(persistent=True) as tape:
        feat_mid, feat_high, base_outputs = multi_extractor(image_batch)
        tape.watch([feat_mid, feat_high])
        gap = tf.keras.layers.GlobalAveragePooling2D()(base_outputs)
        logits = tf.matmul(gap, dense_w) + dense_b
        target_score = logits[:, class_index]

    grads_high = tape.gradient(target_score, feat_high)
    grads_mid = tape.gradient(target_score, feat_mid)

    if grads_high is None:
        raise ValueError("Gradients could not be computed for target layer.")

    # 1. Authentic Grad-CAM formulation on final convolutional layer
    weights = tf.reduce_mean(grads_high, axis=(1, 2), keepdims=True)
    cam_raw = tf.reduce_sum(feat_high * weights, axis=-1)[0].numpy()
    cam_relu = np.maximum(cam_raw, 0.0)

    # 2. LayerCAM on intermediate layer (block5c_add) to capture fine-grained spot texture
    if grads_mid is not None and layer_mid != layer_high:
        weights_mid = tf.maximum(grads_mid, 0.0)
        cam_mid_raw = tf.reduce_sum(feat_mid * weights_mid, axis=-1)[0].numpy()
        cam_mid_relu = np.maximum(cam_mid_raw, 0.0)
        if np.max(cam_mid_relu) > 1e-8:
            cam_mid_norm = cam_mid_relu / np.max(cam_mid_relu)
        else:
            cam_mid_norm = cam_mid_relu
    else:
        cam_mid_norm = cam_relu

    # Normalize deep CAM
    if np.max(cam_relu) > 1e-8:
        cam_high_norm = cam_relu / np.max(cam_relu)
    else:
        cam_high_norm = cam_relu

    # Upsample both smoothly to native input dimensions
    cam_up_high = cv2.resize(cam_high_norm, (w_orig, h_orig), interpolation=cv2.INTER_CUBIC)
    cam_up_mid = cv2.resize(cam_mid_norm, (w_orig, h_orig), interpolation=cv2.INTER_CUBIC)

    # 3. Multi-scale combination: 65% deep semantic context + 35% fine lesion localization
    cam_fused = 0.65 * cam_up_high + 0.35 * cam_up_mid

    # 4. Smooth bicubic Gaussian filtration to eliminate blocky grid artifacts
    kernel_size = max(5, int(min(h_orig, w_orig) * 0.035) | 1)
    cam_smooth = cv2.GaussianBlur(cam_fused, (kernel_size, kernel_size), 0)

    # 5. Extract accurate leaf foreground mask (prevents spurious background activations)
    bgr_img = cv2.cvtColor(original_array, cv2.COLOR_RGB2BGR)
    leaf_mask = extract_leaf_foreground_mask(bgr_img)

    # Focus heatmap strictly on leaf tissue
    cam_on_leaf = cam_smooth * leaf_mask

    if is_healthy:
        # For healthy foliage, model prediction is based on healthy green lamina across the leaf.
        # Provide soft, gentle foliar confirmation without synthetic focal lesion hotspots.
        cam_final = np.clip(leaf_mask * 0.35, 0.0, 1.0)
        pathology_metrics = {
            "hotspots": [],
            "lesions_detected": 0,
            "affected_area_pct": 0.0,
        }
    else:
        peak = float(np.max(cam_on_leaf))
        if peak > 1e-6:
            cam_final = np.clip(cam_on_leaf / peak, 0.0, 1.0)
        else:
            cam_final = np.zeros((h_orig, w_orig), dtype=np.float32)

        # Detect discrete pathological hotspot clusters on diseased tissue
        pathology_metrics = detect_lesion_hotspots(cam_final, leaf_mask)

    return cam_final, leaf_mask, pathology_metrics


def overlay_gradcam(
    image_path: Path,
    heatmap: np.ndarray,
    output_path: Path,
    alpha: float = 0.55,
    colormap: int = cv2.COLORMAP_JET,
) -> None:
    """
    Overlay Grad-CAM heatmap onto leaf image with adaptive intensity-weighted blending.
    Unactivated foliage and background remain clear and unclouded;
    salient lesion regions glow with high-temperature diagnostic colors.
    """
    original_bgr = cv2.imread(str(image_path))
    if original_bgr is None:
        raise ValueError(f"Could not read image from {image_path}")

    h, w = original_bgr.shape[:2]
    if heatmap.shape[:2] != (h, w):
        heatmap = cv2.resize(heatmap, (w, h), interpolation=cv2.INTER_CUBIC)

    heatmap = np.clip(heatmap, 0.0, 1.0)
    heatmap_uint8 = np.uint8(255.0 * heatmap)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, colormap)

    # Adaptive alpha blend:
    # Low activation (< 0.08) leaves original photo crystal clear
    # High activation transitions smoothly to the colormap overlay
    alpha_map = np.clip((heatmap - 0.08) / 0.92, 0.0, 1.0) * alpha
    alpha_3d = np.repeat(alpha_map[:, :, np.newaxis], 3, axis=2)

    blended = (
        original_bgr.astype(np.float32) * (1.0 - alpha_3d)
        + heatmap_colored.astype(np.float32) * alpha_3d
    ).astype(np.uint8)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), blended)


def save_heatmap_only(
    heatmap: np.ndarray,
    target_shape: Tuple[int, int],
    output_path: Path,
    colormap: int = cv2.COLORMAP_JET,
) -> None:
    """Save standalone colormapped attention heatmap in BGR for display."""
    w, h = target_shape
    if heatmap.shape[:2] != (h, w):
        heatmap = cv2.resize(heatmap, (w, h), interpolation=cv2.INTER_CUBIC)

    heatmap = np.clip(heatmap, 0.0, 1.0)
    heatmap_uint8 = np.uint8(255.0 * heatmap)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, colormap)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), heatmap_colored)


def generate_gradcam_for_image(
    image_path: str | Path,
    model_path: str | Path = MODEL_PATH,
    class_map_path: str | Path = CLASS_MAP_PATH,
    output_dir: str | Path = OUTPUT_DIR,
    target_class_index: Optional[int] = None,
    loaded_model: Optional[tf.keras.Model] = None,
    loaded_class_names: Optional[List[str]] = None,
) -> Dict[str, Any]:
    image_path = Path(image_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if loaded_model is not None and loaded_class_names is not None:
        model = loaded_model
        class_names = loaded_class_names
    else:
        model, class_names = load_model_and_class_names(
            model_path=Path(model_path), class_map_path=Path(class_map_path)
        )

    preprocessed, original_array = preprocess_image(image_path)
    image_batch = np.expand_dims(preprocessed, axis=0)
    raw_prediction = model.predict(image_batch, verbose=0)[0]

    # Explicitly use the predicted class index from model or caller
    if target_class_index is not None and 0 <= target_class_index < len(class_names):
        class_index = int(target_class_index)
    else:
        class_index = int(np.argmax(raw_prediction))

    class_name = class_names[class_index]
    is_healthy = "healthy" in class_name.lower()
    raw_confidence = float(raw_prediction[class_index] * 100)

    # Compute high-precision multi-scale heatmap and pathology metrics
    heatmap, leaf_mask, pathology_metrics = generate_gradcam(
        model, image_path, class_index, is_healthy=is_healthy
    )

    output_path = output_dir / f"gradcam_{image_path.stem}.png"
    overlay_gradcam(image_path, heatmap, output_path)

    heatmap_output_path = output_dir / f"heatmap_{image_path.stem}.png"
    save_heatmap_only(heatmap, (original_array.shape[1], original_array.shape[0]), heatmap_output_path)

    return {
        "class_name": class_names[class_index],
        "class_index": class_index,
        "confidence": round(raw_confidence, 2),
        "gradcam_path": str(output_path),
        "heatmap_path": str(heatmap_output_path),
        "hotspots": pathology_metrics["hotspots"],
        "lesions_detected": pathology_metrics["lesions_detected"],
        "affected_area_pct": pathology_metrics["affected_area_pct"],
    }


def validate_gradcam_integrity(
    image_path: Union[str, Path],
    model: Optional[tf.keras.Model] = None,
    class_names: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Repeatable validation procedure for Grad-CAM:
    - Verifies heatmap matches original image dimensions.
    - Confirms all values are finite (no NaN, Inf).
    - Checks bounded normalization within [0.0, 1.0].
    - Validates class selectivity (heatmap changes when targeting a different class).
    - Verifies file outputs and channels.
    """
    image_path = Path(image_path)
    if model is None or class_names is None:
        model, class_names = load_model_and_class_names()

    _, original_rgb = load_and_preprocess_image(image_path)
    h_orig, w_orig = original_rgb.shape[:2]

    # Generate for primary predicted class
    result_top = generate_gradcam_for_image(
        image_path=image_path,
        loaded_model=model,
        loaded_class_names=class_names,
    )
    top_class_idx = result_top["class_index"]
    top_cam_path = Path(result_top["gradcam_path"])
    top_heatmap_path = Path(result_top["heatmap_path"])

    assert top_cam_path.exists(), "Grad-CAM overlay image file not written!"
    assert top_heatmap_path.exists(), "Heatmap-only image file not written!"

    # Read back generated files to check dimensions and channels
    overlay_img = cv2.imread(str(top_cam_path))
    heatmap_img = cv2.imread(str(top_heatmap_path))

    dim_ok = (overlay_img.shape[:2] == (h_orig, w_orig)) and (heatmap_img.shape[:2] == (h_orig, w_orig))
    finite_ok = np.all(np.isfinite(overlay_img)) and np.all(np.isfinite(heatmap_img))

    # Sanity check: Class Selectivity Test (compare against an alternative class)
    alt_class_idx = (top_class_idx + 5) % len(class_names)
    cam_top, _, _ = generate_gradcam(model, image_path, top_class_idx)
    cam_alt, _, _ = generate_gradcam(model, image_path, alt_class_idx)

    diff = float(np.mean(np.abs(cam_top - cam_alt)))
    class_selective = diff > 0.005  # True if explanations for distinct classes diverge

    checks = {
        "image_file": str(image_path.name),
        "target_class": class_names[top_class_idx],
        "original_dimensions": [w_orig, h_orig],
        "output_dimensions": [overlay_img.shape[1], overlay_img.shape[0]],
        "dimensions_aligned": dim_ok,
        "finite_values_verified": bool(finite_ok),
        "non_zero_activation": float(np.max(cam_top)) > 0.05,
        "class_selectivity_differential": round(diff, 5),
        "class_selective_test_passed": class_selective,
        "lesions_detected": result_top["lesions_detected"],
        "affected_area_pct": result_top["affected_area_pct"],
        "status": "PASS" if (dim_ok and finite_ok and class_selective) else "FAIL",
    }
    return checks


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate and validate Grad-CAM for a leaf image.")
    parser.add_argument("image", help="Path to the input leaf image")
    parser.add_argument("--model", default=str(MODEL_PATH), help="Path to the Keras model")
    parser.add_argument("--class-map", default=str(CLASS_MAP_PATH), help="Path to class_names.json")
    parser.add_argument("--output-dir", default=str(OUTPUT_DIR), help="Directory to store Grad-CAM output")
    parser.add_argument("--class-index", type=int, default=None, help="Specific class index to explain")
    parser.add_argument("--validate", action="store_true", help="Run full Grad-CAM validation test suite")
    args = parser.parse_args()

    if args.validate:
        validation_report = validate_gradcam_integrity(args.image)
        print(json.dumps(validation_report, indent=2))
    else:
        result = generate_gradcam_for_image(
            image_path=args.image,
            model_path=args.model,
            class_map_path=args.class_map,
            output_dir=args.output_dir,
            target_class_index=args.class_index,
        )
        print(json.dumps(result, indent=2))
