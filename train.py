from __future__ import annotations

import json
import os
import random
from pathlib import Path
from typing import Dict, List, Tuple

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

SEED = 42
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20
BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "plant_disease_model.keras"
CLASS_MAP_PATH = MODEL_DIR / "class_names.json"
KAGGLE_DATASET = "abdallahalidev/plantvillage-dataset"


def is_dataset_root(path: Path) -> bool:
    """Return whether a directory contains multiple image-bearing class folders."""
    if not path.is_dir():
        return False
    class_dirs = [child for child in path.iterdir() if child.is_dir() and not child.name.startswith(".")]
    return sum(bool(collect_image_paths(class_dir)) for class_dir in class_dirs) >= 2


def find_dataset_root(base_dir: Path) -> Path:
    """Prefer local dataset if available, otherwise use Kaggle dataset."""
    try:
        return find_local_dataset_root(base_dir)
    except FileNotFoundError:
        return download_kaggle_dataset()


def find_local_dataset_root(base_dir: Path) -> Path:
    """Locate a PlantVillage dataset root within the project folder."""
    candidate_dirs = [
        base_dir / "dataset",
        base_dir / "dataset" / "PlantVillage",
        base_dir / "dataset" / "plantvillage",
        base_dir / "dataset" / "plantvillage dataset" / "color",
        base_dir / "PlantVillage",
        base_dir / "plantvillage",
    ]
    for candidate in candidate_dirs:
        if is_dataset_root(candidate):
            return candidate

    found = [p for p in base_dir.rglob("*") if is_dataset_root(p)]
    if found:
        return found[0]

    raise FileNotFoundError(
        "No local PlantVillage dataset was found. Remove USE_LOCAL_DATASET to use the KaggleHub dataset."
    )


def download_kaggle_dataset() -> Path:
    """Download the configured Kaggle dataset and locate its class-folder root."""
    try:
        import kagglehub
    except ImportError as exc:
        raise ImportError(
            "kagglehub is required to download the dataset. Run 'pip install -r requirements.txt'."
        ) from exc

    print(f"Downloading or reusing Kaggle dataset: {KAGGLE_DATASET}")
    download_path = Path(kagglehub.dataset_download(KAGGLE_DATASET))
    if is_dataset_root(download_path):
        return download_path

    found = [path for path in download_path.rglob("*") if is_dataset_root(path)]
    if found:
        return found[0]

    raise FileNotFoundError(
        f"The Kaggle download at {download_path} does not contain PlantVillage class folders."
    )


def discover_class_dirs(dataset_root: Path) -> List[Path]:
    class_dirs = sorted(
        [p for p in dataset_root.iterdir() if p.is_dir() and not p.name.startswith(".")],
        key=lambda path: path.name.lower(),
    )
    if not class_dirs:
        raise ValueError(f"No class folders were found inside {dataset_root}. Check the dataset structure.")
    return [class_dir for class_dir in class_dirs if collect_image_paths(class_dir)]


def collect_image_paths(class_dir: Path) -> List[Path]:
    valid_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    return [
        item for item in class_dir.iterdir()
        if item.is_file() and item.suffix.lower() in valid_extensions
    ]


def build_class_splits(class_dirs: List[Path], seed: int = SEED) -> Tuple[Dict[str, List[str]], Dict[str, List[str]], Dict[str, List[str]], List[str]]:
    rng = random.Random(seed)
    train_paths: Dict[str, List[str]] = {}
    val_paths: Dict[str, List[str]] = {}
    test_paths: Dict[str, List[str]] = {}
    class_names: List[str] = []

    for class_dir in class_dirs:
        class_name = class_dir.name
        class_names.append(class_name)
        files = collect_image_paths(class_dir)
        if not files:
            continue

        rng.shuffle(files)
        total = len(files)
        train_size = max(1, int(total * 0.8))
        val_size = max(1, int(total * 0.1))
        test_size = total - train_size - val_size

        if total == 1:
            train_paths[class_name] = [str(files[0])]
            val_paths[class_name] = []
            test_paths[class_name] = []
            continue

        if total == 2:
            train_size = 1
            val_size = 1
            test_size = 0
        elif total == 3:
            train_size = 2
            val_size = 1
            test_size = 0
        elif total <= 5:
            val_size = max(1, total // 4)
            train_size = total - val_size
            test_size = 0

        if test_size < 0:
            test_size = 0
        if val_size + train_size + test_size > total:
            val_size = max(1, min(val_size, total - train_size - test_size))

        train_paths[class_name] = [str(path) for path in files[:train_size]]
        val_paths[class_name] = [str(path) for path in files[train_size:train_size + val_size]]
        test_paths[class_name] = [str(path) for path in files[train_size + val_size:train_size + val_size + test_size]]

    return train_paths, val_paths, test_paths, class_names


def preprocess_image(image_path: tf.Tensor) -> tf.Tensor:
    image = tf.io.read_file(image_path)
    image = tf.io.decode_image(image, channels=3, expand_animations=False)
    image = tf.image.resize(image, IMAGE_SIZE)
    image = tf.cast(image, tf.float32)
    image = tf.keras.applications.efficientnet.preprocess_input(image)
    return image


def build_dataset(paths_by_class: Dict[str, List[str]], class_to_index: Dict[str, int], shuffle: bool, num_classes: int, batch_size: int = BATCH_SIZE) -> tf.data.Dataset:
    all_paths = []
    all_labels = []

    for class_name, paths in paths_by_class.items():
        for path in paths:
            all_paths.append(path)
            all_labels.append(class_to_index[class_name])

    if not all_paths:
        raise ValueError("No images were found. Please verify the dataset structure.")

    path_tensor = tf.constant(all_paths)
    label_tensor = tf.constant(all_labels, dtype=tf.int32)
    dataset = tf.data.Dataset.from_tensor_slices((path_tensor, label_tensor))

    # Shuffle lightweight path/label pairs before decoding. Shuffling after the
    # image map would retain thousands of 224x224 tensors in memory.
    if shuffle:
        dataset = dataset.shuffle(buffer_size=min(2048, len(all_paths)), seed=SEED)

    def map_fn(path: tf.Tensor, label: tf.Tensor) -> Tuple[tf.Tensor, tf.Tensor]:
        image = preprocess_image(path)
        encoded = tf.one_hot(label, depth=num_classes)
        return image, encoded

    dataset = dataset.map(map_fn, num_parallel_calls=tf.data.AUTOTUNE)
    dataset = dataset.batch(batch_size)
    dataset = dataset.prefetch(tf.data.AUTOTUNE)
    return dataset


def build_model(num_classes: int) -> tf.keras.Model:
    base_model = tf.keras.applications.EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(224, 224, 3),
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(224, 224, 3), name="leaf_image")
    x = base_model(inputs, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = tf.keras.Model(inputs, outputs, name="plant_disease_model")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=[
            tf.keras.metrics.CategoricalAccuracy(name="accuracy"),
            tf.keras.metrics.Precision(name="precision"),
            tf.keras.metrics.Recall(name="recall"),
        ],
    )
    return model


def collect_dataset_arrays(dataset: tf.data.Dataset) -> Tuple[np.ndarray, np.ndarray]:
    all_images = []
    all_labels = []
    for images, labels in dataset.unbatch().batch(1024):
        all_images.append(images.numpy())
        all_labels.append(labels.numpy())
    if not all_images:
        return np.empty((0, 224, 224, 3), dtype=np.float32), np.empty((0, 0), dtype=np.float32)
    return np.concatenate(all_images), np.concatenate(all_labels)


def plot_confusion_matrix(cm: np.ndarray, labels: List[str], save_path: Path) -> None:
    plt.figure(figsize=(14, 12))
    sns.heatmap(cm, annot=False, cmap="Blues", xticklabels=labels, yticklabels=labels)
    plt.xticks(rotation=90)
    plt.yticks(rotation=0)
    plt.title("Confusion Matrix")
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    dataset_root = find_dataset_root(BASE_DIR)
    class_dirs = discover_class_dirs(dataset_root)
    if not class_dirs:
        raise ValueError(f"No class directories were found under {dataset_root}.")

    train_paths, val_paths, test_paths, class_names = build_class_splits(class_dirs)
    print(f"Found {len(class_names)} classes")

    total_train = sum(len(paths) for paths in train_paths.values())
    total_val = sum(len(paths) for paths in val_paths.values())
    total_test = sum(len(paths) for paths in test_paths.values())

    print(f"Training images: {total_train}")
    print(f"Validation images: {total_val}")
    print(f"Testing images: {total_test}")

    class_to_index = {class_name: index for index, class_name in enumerate(class_names)}
    train_ds = build_dataset(train_paths, class_to_index, shuffle=True, num_classes=len(class_names))
    val_ds = build_dataset(val_paths, class_to_index, shuffle=False, num_classes=len(class_names))
    test_ds = build_dataset(test_paths, class_to_index, shuffle=False, num_classes=len(class_names))

    model = build_model(len(class_names))
    model.summary(print_fn=lambda message: print(message))

    early_stop = tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=5,
        restore_best_weights=True,
        verbose=1,
    )
    reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.2,
        patience=2,
        min_lr=1e-6,
        verbose=1,
    )

    print("\nStarting training...\n")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[early_stop, reduce_lr],
        verbose=1,
    )

    # EarlyStopping has restored the best validation weights. Saving after fit
    # avoids a Keras 3 ModelCheckpoint options incompatibility with TensorFlow 2.13.
    model.save(str(MODEL_PATH))

    print("\nTraining Summary")
    print(f"Training accuracy: {history.history['accuracy'][-1]:.4f}")
    print(f"Validation accuracy: {history.history['val_accuracy'][-1]:.4f}")
    print(f"Training loss: {history.history['loss'][-1]:.4f}")
    print(f"Validation loss: {history.history['val_loss'][-1]:.4f}")

    test_loss, test_acc, test_precision, test_recall = model.evaluate(test_ds, verbose=1)
    print(f"Test accuracy: {test_acc:.4f}")
    print(f"Test precision: {test_precision:.4f}")
    print(f"Test recall: {test_recall:.4f}")

    test_images, test_labels = collect_dataset_arrays(test_ds)
    y_true = np.argmax(test_labels, axis=1) if test_labels.ndim > 1 else test_labels
    y_pred_prob = model.predict(test_images, verbose=1)
    y_pred = np.argmax(y_pred_prob, axis=1)

    test_f1 = 2 * test_precision * test_recall / (test_precision + test_recall)
    print(f"Test F1-score: {test_f1:.4f}")

    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(class_names))))
    plot_confusion_matrix(cm, class_names, MODEL_DIR / "confusion_matrix.png")
    print("\nClassification report:\n")
    print(classification_report(y_true, y_pred, target_names=class_names, digits=4))

    with CLASS_MAP_PATH.open("w", encoding="utf-8") as file:
        json.dump(class_names, file, ensure_ascii=False, indent=2)

    print(f"\nSaved model: {MODEL_PATH}")
    print(f"Saved class names: {CLASS_MAP_PATH}")


if __name__ == "__main__":
    main()
