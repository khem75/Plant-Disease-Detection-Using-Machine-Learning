from __future__ import annotations

import json
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support

from train import (
    BASE_DIR,
    IMAGE_SIZE,
    BATCH_SIZE,
    SEED,
    MODEL_PATH,
    CLASS_MAP_PATH,
    MODEL_DIR,
    find_dataset_root,
    discover_class_dirs,
    build_class_splits,
    build_dataset,
)

def evaluate_model():
    print("=" * 60)
    print("SCIENTIFIC EVALUATION ON HELD-OUT TEST SET")
    print("=" * 60)

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    if not CLASS_MAP_PATH.exists():
        raise FileNotFoundError(f"Class names file not found at {CLASS_MAP_PATH}")

    with CLASS_MAP_PATH.open("r", encoding="utf-8") as f:
        class_names = json.load(f)

    dataset_root = find_dataset_root(BASE_DIR)
    class_dirs = discover_class_dirs(dataset_root)
    _, _, test_paths, split_class_names = build_class_splits(class_dirs, seed=SEED)

    assert class_names == split_class_names, "Class order mismatch!"

    class_to_index = {c: i for i, c in enumerate(class_names)}
    total_test = sum(len(paths) for paths in test_paths.values())
    print(f"Total held-out test samples: {total_test} across {len(class_names)} classes")

    test_ds = build_dataset(test_paths, class_to_index, shuffle=False, num_classes=len(class_names), batch_size=BATCH_SIZE)

    print("Loading model...")
    model = tf.keras.models.load_model(str(MODEL_PATH), compile=False)
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.Precision(name="precision"), tf.keras.metrics.Recall(name="recall")]
    )

    print("Evaluating on test dataset batches...")
    test_loss, test_acc, test_prec, test_rec = model.evaluate(test_ds, verbose=1)

    print("Collecting predictions for confusion matrix & per-class metrics...")
    all_preds = []
    all_trues = []
    for imgs, labels in test_ds:
        preds = model.predict(imgs, verbose=0)
        all_preds.append(preds)
        all_trues.append(labels.numpy())

    y_pred_probs = np.concatenate(all_preds, axis=0)
    y_true_onehot = np.concatenate(all_trues, axis=0)
    y_pred = np.argmax(y_pred_probs, axis=1)
    y_true = np.argmax(y_true_onehot, axis=1)

    # Calculate metrics
    precision_macro, recall_macro, f1_macro, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    precision_weighted, recall_weighted, f1_weighted, _ = precision_recall_fscore_support(
        y_true, y_pred, average="weighted", zero_division=0
    )

    per_class_p, per_class_r, per_class_f1, per_class_support = precision_recall_fscore_support(
        y_true, y_pred, average=None, zero_division=0
    )

    report_dict = classification_report(y_true, y_pred, target_names=class_names, output_dict=True, digits=4, zero_division=0)
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(class_names))))

    # Save confusion matrix plot
    cm_path = MODEL_DIR / "confusion_matrix.png"
    plt.figure(figsize=(18, 16))
    sns.heatmap(
        cm,
        annot=False,
        cmap="Greens",
        xticklabels=[c.split("___")[-1] for c in class_names],
        yticklabels=[c.split("___")[-1] for c in class_names]
    )
    plt.xticks(rotation=90, fontsize=8)
    plt.yticks(rotation=0, fontsize=8)
    plt.title("Held-out Test Confusion Matrix (PlantVillage 38 Classes)", fontsize=14, pad=12)
    plt.xlabel("Predicted Class", fontsize=11)
    plt.ylabel("True Class", fontsize=11)
    plt.tight_layout()
    plt.savefig(cm_path, dpi=150)
    plt.close()
    print(f"Saved confusion matrix plot: {cm_path}")

    # Build evaluation summary
    results_summary = {
        "dataset": "PlantVillage (Color)",
        "num_classes": len(class_names),
        "total_test_samples": int(total_test),
        "test_loss": round(float(test_loss), 4),
        "test_accuracy": round(float(test_acc), 4),
        "macro_precision": round(float(precision_macro), 4),
        "macro_recall": round(float(recall_macro), 4),
        "macro_f1": round(float(f1_macro), 4),
        "weighted_precision": round(float(precision_weighted), 4),
        "weighted_recall": round(float(recall_weighted), 4),
        "weighted_f1": round(float(f1_weighted), 4),
        "per_class_metrics": {
            class_names[i]: {
                "precision": round(float(per_class_p[i]), 4),
                "recall": round(float(per_class_r[i]), 4),
                "f1_score": round(float(per_class_f1[i]), 4),
                "support": int(per_class_support[i]),
            }
            for i in range(len(class_names))
        },
        "classification_report": report_dict,
    }

    eval_json_path = MODEL_DIR / "test_evaluation_report.json"
    with eval_json_path.open("w", encoding="utf-8") as f:
        json.dump(results_summary, f, indent=2)
    print(f"Saved test evaluation report: {eval_json_path}")

    print("\n" + "=" * 60)
    print(f"TEST ACCURACY:       {test_acc * 100:.2f}%")
    print(f"MACRO PRECISION:     {precision_macro * 100:.2f}%")
    print(f"MACRO RECALL:        {recall_macro * 100:.2f}%")
    print(f"MACRO F1-SCORE:      {f1_macro * 100:.2f}%")
    print("=" * 60)

if __name__ == "__main__":
    evaluate_model()
