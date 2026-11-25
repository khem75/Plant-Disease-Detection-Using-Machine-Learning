from __future__ import annotations

import io
from pathlib import Path
from typing import Tuple, Union

import cv2
import numpy as np
import tensorflow as tf
from PIL import Image

TARGET_SIZE: Tuple[int, int] = (224, 224)


def assess_image_quality(rgb_array: np.ndarray) -> Tuple[bool, str]:
    """
    Check input image quality:
    - Minimum dimensions
    - Excessive darkness or brightness
    - Severe blurriness via Laplacian variance
    """
    h, w = rgb_array.shape[:2]
    if h < 64 or w < 64:
        return False, "Image resolution is too low (< 64x64 pixels). Please upload a higher resolution leaf image."

    gray = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2GRAY)
    mean_val = float(np.mean(gray))

    if mean_val < 15.0:
        return False, "The image is too dark. Please take a clearer photo with proper ambient daylight."
    if mean_val > 245.0:
        return False, "The image is overexposed. Please upload an image with balanced natural lighting."

    # Blur detection via Laplacian variance
    lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if lap_var < 8.0:
        return False, "The leaf photo appears excessively blurry. Please capture a sharply focused leaf image."

    return True, "Quality check passed"


def verify_plant_leaf(rgb_array: np.ndarray) -> Tuple[bool, str, dict]:
    """
    Botanical leaf verification:
    Detects whether the uploaded image is a real botanical leaf versus
    a document, screenshot, text table, or non-plant object.
    
    Checks:
    1. Neutral / Grayscale / Document ratio (documents have >80% neutral pixels)
    2. Botanical foliar hue spectrum (chlorophyll greens, chlorotic yellows, necrotic browns)
    3. Chrominance energy in LAB color space
    """
    h, w = rgb_array.shape[:2]
    total_pixels = h * w
    if total_pixels == 0:
        return False, "Empty image provided.", {}

    hsv = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2HSV)
    lab = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2LAB)

    hue = hsv[:, :, 0]
    sat = hsv[:, :, 1]
    val = hsv[:, :, 2]

    # 1. Neutral / Monochrome / Document pixels
    # Grayscale text, white paper, and dark table backgrounds have near-zero saturation
    is_neutral = (sat < 22) | ((val > 238) & (sat < 35)) | (val < 15)
    neutral_ratio = float(np.sum(is_neutral)) / total_pixels

    # 2. Foliar botanical color spectrum:
    # In OpenCV HSV (Hue 0-180):
    # - Green chlorophyll: Hue 30-88
    # - Yellow / amber / chlorosis: Hue 15-35
    # - Brown / rust necrosis: Hue 8-20 with moderate saturation
    # Full botanical foliar range: Hue 8 to 90 with Saturation >= 20 and Value >= 20
    is_foliar = (hue >= 8) & (hue <= 90) & (sat >= 20) & (val >= 20)
    foliar_ratio = float(np.sum(is_foliar)) / total_pixels

    # 3. LAB Chromaticity
    a = lab[:, :, 1].astype(float) - 128.0
    b = lab[:, :, 2].astype(float) - 128.0
    chroma = np.sqrt(a**2 + b**2)
    mean_chroma = float(np.mean(chroma))

    metrics = {
        "neutral_ratio": round(neutral_ratio, 3),
        "foliar_ratio": round(foliar_ratio, 3),
        "mean_chroma": round(mean_chroma, 2),
    }

    # Document, text screenshot, or paper table check
    if neutral_ratio > 0.80 and foliar_ratio < 0.14:
        return (
            False,
            "Document or non-leaf image detected: The uploaded image appears to be a document, text graphic, or table rather than a plant leaf. Please upload a clear photo of a plant leaf.",
            metrics,
        )

    # Non-plant object / severe lack of foliage check
    if foliar_ratio < 0.12 and mean_chroma < 8.0:
        return (
            False,
            "Non-plant image detected: The image does not contain sufficient leaf or plant foliage. Please upload a clear close-up photograph of a plant leaf.",
            metrics,
        )

    return True, "Plant leaf verification passed.", metrics


def load_and_preprocess_image(
    image_input: Union[str, Path, bytes, Image.Image],
    target_size: Tuple[int, int] = TARGET_SIZE,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Centralized canonical preprocessing pipeline:
    1. Read input as RGB PIL Image.
    2. Keep original native RGB array for visualization overlay.
    3. Bilinear resize to target_size (224, 224).
    4. Cast to float32.
    5. Apply EfficientNetB0 standard normalization (tf.keras.applications.efficientnet.preprocess_input).
    6. Return (batch_array [1, 224, 224, 3], original_rgb [H, W, 3]).
    """
    if isinstance(image_input, (str, Path)):
        pil_image = Image.open(str(image_input)).convert("RGB")
    elif isinstance(image_input, bytes):
        pil_image = Image.open(io.BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, Image.Image):
        pil_image = image_input.convert("RGB")
    else:
        raise ValueError(f"Unsupported image_input type: {type(image_input)}")

    original_rgb = np.array(pil_image, dtype=np.uint8)

    # Standard bilinear resize
    resized_pil = pil_image.resize(target_size, Image.Resampling.BILINEAR)
    resized_array = np.array(resized_pil, dtype=np.float32)

    # Standard EfficientNet preprocessing
    preprocessed = tf.keras.applications.efficientnet.preprocess_input(resized_array)
    batch_array = np.expand_dims(preprocessed, axis=0)

    return batch_array, original_rgb
