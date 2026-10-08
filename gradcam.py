from __future__ import annotations

import json
from pathlib import Path
from typing import List, Optional, Tuple

import cv2
import numpy as np
import tensorflow as tf
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "plant_disease_model.keras"
CLASS_MAP_PATH = BASE_DIR / "model" / "class_names.json"
OUTPUT_DIR = BASE_DIR / "model" / "gradcam_outputs"


def load_model_and_class_names(model_path: Path = MODEL_PATH, class_map_path: Path = CLASS_MAP_PATH):
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}. Train the model first using train.py.")
    if not class_map_path.exists():
        raise FileNotFoundError(f"Class mapping file not found at {class_map_path}.")

    model = tf.keras.models.load_model(str(model_path), compile=False)
    with class_map_path.open("r", encoding="utf-8") as file:
        class_names = json.load(file)
    return model, class_names


def preprocess_image(image_path: Path, target_size=(224, 224)) -> Tuple[np.ndarray, np.ndarray]:
    image = Image.open(image_path).convert("RGB")
    original_array = np.array(image)
    resized = image.resize(target_size)
    resized_array = np.array(resized, dtype=np.float32)
    preprocessed = tf.keras.applications.efficientnet.preprocess_input(resized_array)
    return preprocessed, original_array


def find_last_conv_layer(model: tf.keras.Model) -> Tuple[tf.keras.layers.Layer, tf.keras.Model | None]:
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer, None
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.Model):
            for sub_layer in reversed(layer.layers):
                if isinstance(sub_layer, tf.keras.layers.Conv2D):
                    return sub_layer, layer
    raise ValueError("No convolutional layer was found in the model.")


def generate_gradcam(model: tf.keras.Model, image_path: Path, class_index: int) -> np.ndarray:
    preprocessed, _ = preprocess_image(image_path)
    image_batch = np.expand_dims(preprocessed, axis=0)

    last_conv_layer, sub_model = find_last_conv_layer(model)

    if sub_model is not None:
        sub_base = tf.keras.Model(
            inputs=sub_model.inputs,
            outputs=[last_conv_layer.output, sub_model.output],
        )
        sub_model_idx = model.layers.index(sub_model)
        top_layers = model.layers[sub_model_idx + 1:]

        with tf.GradientTape() as tape:
            conv_outputs, base_outputs = sub_base(image_batch)
            tape.watch(conv_outputs)
            h = base_outputs
            for layer in top_layers:
                h = layer(h)
            score = h[:, class_index]

        grads = tape.gradient(score, conv_outputs)
    else:
        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[last_conv_layer.output, model.output],
        )
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(image_batch)
            score = predictions[:, class_index]
        grads = tape.gradient(score, conv_outputs)

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap = tf.reduce_sum(tf.cast(conv_outputs, tf.float32) * pooled_grads, axis=-1)
    heatmap = tf.maximum(heatmap, 0)
    heatmap = heatmap / (tf.reduce_max(heatmap) + 1e-8)
    return heatmap[0].numpy()


def overlay_gradcam(image_path: Path, heatmap: np.ndarray, output_path: Path) -> None:
    original = np.array(Image.open(image_path).convert("RGB"), dtype=np.uint8)
    heatmap_resized = cv2.resize(heatmap, (original.shape[1], original.shape[0]))
    heatmap_resized = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
    blended = cv2.addWeighted(original, 0.5, heatmap_colored, 0.5, 0)
    cv2.imwrite(str(output_path), cv2.cvtColor(blended, cv2.COLOR_RGB2BGR))


def save_heatmap_only(heatmap: np.ndarray, target_shape: Tuple[int, int], output_path: Path) -> None:
    heatmap_resized = cv2.resize(heatmap, target_shape)
    heatmap_resized = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
    cv2.imwrite(str(output_path), heatmap_colored)


def generate_gradcam_for_image(
    image_path: str | Path,
    model_path: str | Path = MODEL_PATH,
    class_map_path: str | Path = CLASS_MAP_PATH,
    output_dir: str | Path = OUTPUT_DIR,
    target_class_index: Optional[int] = None,
    loaded_model: Optional[tf.keras.Model] = None,
    loaded_class_names: Optional[List[str]] = None,
):
    image_path = Path(image_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if loaded_model is not None and loaded_class_names is not None:
        model = loaded_model
        class_names = loaded_class_names
    else:
        model, class_names = load_model_and_class_names(model_path=Path(model_path), class_map_path=Path(class_map_path))

    preprocessed, original_array = preprocess_image(image_path)
    image_batch = np.expand_dims(preprocessed, axis=0)
    raw_prediction = model.predict(image_batch, verbose=0)[0]

    # Explicitly use the predicted class index from model or caller
    if target_class_index is not None and 0 <= target_class_index < len(class_names):
        class_index = int(target_class_index)
    else:
        class_index = int(np.argmax(raw_prediction))

    # Actual model confidence directly from softmax
    raw_confidence = float(raw_prediction[class_index] * 100)

    # Compute heatmap specifically for the target class
    heatmap = generate_gradcam(model, image_path, class_index)

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
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate Grad-CAM for a leaf image.")
    parser.add_argument("image", help="Path to the input leaf image")
    parser.add_argument("--model", default=str(MODEL_PATH), help="Path to the Keras model")
    parser.add_argument("--class-map", default=str(CLASS_MAP_PATH), help="Path to class_names.json")
    parser.add_argument("--output-dir", default=str(OUTPUT_DIR), help="Directory to store Grad-CAM output")
    parser.add_argument("--class-index", type=int, default=None, help="Specific class index to explain")
    args = parser.parse_args()

    result = generate_gradcam_for_image(
        image_path=args.image,
        model_path=args.model,
        class_map_path=args.class_map,
        output_dir=args.output_dir,
        target_class_index=args.class_index,
    )
    print(json.dumps(result, indent=2))
