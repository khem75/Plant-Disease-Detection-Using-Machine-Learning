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
