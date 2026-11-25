from __future__ import annotations

import io
import json
import sqlite3
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import cv2
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image

from backend.disease_data import DISEASE_KNOWLEDGE_BASE, get_disease_metadata
from backend.preprocessing import assess_image_quality, load_and_preprocess_image, verify_plant_leaf
from gradcam import generate_gradcam_for_image

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "model" / "plant_disease_model.keras"
CLASS_MAP_PATH = BASE_DIR / "model" / "class_names.json"
STATIC_DIR = BASE_DIR / "backend" / "static"
UPLOADS_DIR = STATIC_DIR / "uploads"
GRADCAM_DIR = STATIC_DIR / "gradcam"
DB_PATH = BASE_DIR / "plant_disease_history.db"

app = FastAPI(
    title="Plant Disease Detection & Explainable AI API",
    description="Authentic deep learning plant leaf disease classification with Grad-CAM explainability.",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
GRADCAM_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

model: Optional[tf.keras.Model] = None
class_names: List[str] = []
model_modified_at: Optional[float] = None


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                analysis_id TEXT DEFAULT '',
                filename TEXT NOT NULL,
                plant TEXT NOT NULL,
                disease TEXT NOT NULL,
                confidence REAL NOT NULL,
                timestamp TEXT NOT NULL,
                image_url TEXT DEFAULT '',
                gradcam_image TEXT DEFAULT '',
                heatmap_image TEXT DEFAULT '',
                class_name TEXT DEFAULT '',
                payload_json TEXT DEFAULT ''
            )
            """
        )
        # Migrate columns if database existed before
        cursor = connection.execute("PRAGMA table_info(predictions)")
        columns = [row[1] for row in cursor.fetchall()]
        if "analysis_id" not in columns:
            connection.execute("ALTER TABLE predictions ADD COLUMN analysis_id TEXT DEFAULT ''")
        if "heatmap_image" not in columns:
            connection.execute("ALTER TABLE predictions ADD COLUMN heatmap_image TEXT DEFAULT ''")
        if "class_name" not in columns:
            connection.execute("ALTER TABLE predictions ADD COLUMN class_name TEXT DEFAULT ''")
        if "payload_json" not in columns:
            connection.execute("ALTER TABLE predictions ADD COLUMN payload_json TEXT DEFAULT ''")


def load_model_and_classes() -> None:
    global model, class_names, model_modified_at
    model = None
    class_names = []
    model_modified_at = None

    if not MODEL_PATH.exists():
        return

    try:
        model = tf.keras.models.load_model(str(MODEL_PATH), compile=False, safe_mode=False)
    except TypeError:
        # Older Keras versions don't support safe_mode
        try:
            model = tf.keras.models.load_model(str(MODEL_PATH), compile=False)
        except Exception as err:
            print(f"Error loading model from {MODEL_PATH}: {err}")
            model = None
            class_names = []
            return
    except Exception as err:
        print(f"Error loading model from {MODEL_PATH}: {err}")
        model = None
        class_names = []
        return

    if CLASS_MAP_PATH.exists():
        try:
            with CLASS_MAP_PATH.open("r", encoding="utf-8") as file:
                class_names = json.load(file)
        except Exception:
            class_names = []

    if MODEL_PATH.exists():
        model_modified_at = MODEL_PATH.stat().st_mtime

    # Warmup model for instant first inference
    if model is not None:
        try:
            dummy_input = np.zeros((1, 224, 224, 3), dtype=np.float32)
            model.predict(dummy_input, verbose=0)
        except Exception:
            pass


def ensure_model_loaded() -> None:
    if not MODEL_PATH.exists():
        return

    latest_modified_at = MODEL_PATH.stat().st_mtime
    if model is None or model_modified_at != latest_modified_at or not class_names:
        load_model_and_classes()


def parse_class_name(class_name: str) -> Dict[str, str]:
    if class_name in DISEASE_KNOWLEDGE_BASE:
        info = DISEASE_KNOWLEDGE_BASE[class_name]
        return {
            "plant": info.get("plant", "Unknown"),
            "disease": info.get("disease", "Unknown"),
        }

    class_name = class_name.strip()
    if "___" in class_name:
        plant, disease = class_name.split("___", 1)
    else:
        plant, disease = class_name, "healthy"

    plant_name = plant.replace("_", " ").title()
    disease_name = disease.replace("_", " ")
    disease_name = "Healthy Leaf" if disease_name.lower() == "healthy" else disease_name.title()
    return {"plant": plant_name, "disease": disease_name}


def get_confidence_level(confidence_pct: float) -> str:
    # Configurable thresholds per requirement 8:
    # >= 85.0%: High confidence
    # 65.0 - 84.9%: Moderate confidence
    # 50.0 - 64.9%: Low confidence
    # < 50.0%: Uncertain
    if confidence_pct >= 85.0:
        return "high"
    elif confidence_pct >= 65.0:
        return "moderate"
    elif confidence_pct >= 50.0:
        return "low"
    return "uncertain"


def estimate_severity(class_name: str, disease_name: str) -> Dict[str, Any]:
    lower_dis = disease_name.lower()
    if "healthy" in lower_dis:
        return {
            "label": "None",
            "score": 0.0,
            "is_estimated": True,
            "method": "Rule-based estimation from botanical pathology profile (healthy tissue)",
            "description": "No visible pathological damage detected on leaf blade.",
        }
    elif any(term in lower_dis for term in ["late blight", "black rot", "citrus greening", "yellow leaf curl", "mosaic"]):
        return {
            "label": "High",
            "score": 0.85,
            "is_estimated": True,
            "method": "Rule-based estimation from botanical pathology profile (aggressive/systemic)",
            "description": "High destructive potential. Rapid pathogen colonization requiring prompt intervention.",
        }
    else:
        return {
            "label": "Moderate",
            "score": 0.50,
            "is_estimated": True,
            "method": "Rule-based estimation from botanical pathology profile (localized fungal/bacterial)",
            "description": "Localized foliar infection. Monitor canopy closely to prevent secondary spore spread.",
        }


def save_prediction(
    analysis_id: str,
    filename: str,
    plant: str,
    disease: str,
    confidence: float,
    image_url: str,
    gradcam_image: str,
    heatmap_image: str,
    class_name: str,
    payload_json: str,
) -> int:
    with sqlite3.connect(DB_PATH) as connection:
        cursor = connection.execute(
            """
            INSERT INTO predictions (
                analysis_id, filename, plant, disease, confidence, timestamp,
                image_url, gradcam_image, heatmap_image, class_name, payload_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                analysis_id,
                filename,
                plant,
                disease,
                confidence,
                datetime.utcnow().isoformat(timespec="seconds"),
                image_url,
                gradcam_image,
                heatmap_image,
                class_name,
                payload_json,
            ),
        )
        return int(cursor.lastrowid or 0)


def validate_uploaded_file(file: UploadFile) -> None:
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Please upload JPG, PNG, or WebP files."
        )

    current_pos = file.file.tell()
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(current_pos if current_pos >= 0 else 0)

    if file_size == 0:
        raise HTTPException(status_code=400, detail="The uploaded image file is empty.")
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image size exceeds the 10 MB limit. Please upload a smaller image."
        )


def preprocess_image_from_bytes(file_bytes: bytes) -> Tuple[np.ndarray, np.ndarray]:
    try:
        return load_and_preprocess_image(file_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Could not read the uploaded image. Please ensure it is a valid, uncorrupted picture."
        ) from exc


@app.on_event("startup")
def startup_event() -> None:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    GRADCAM_DIR.mkdir(parents=True, exist_ok=True)
    init_db()
    load_model_and_classes()


@app.get("/")
def read_root() -> Dict[str, str]:
    return {"message": "Plant Health AI Diagnostic API is operational.", "version": "2.1.0"}


@app.get("/health")
def health_check() -> Dict[str, Any]:
    ensure_model_loaded()
    is_ready = model is not None and bool(class_names)
    return {
        "status": "healthy" if is_ready else "initializing",
        "model_available": is_ready,
        "classes": len(class_names),
        "model_architecture": "EfficientNetB0",
        "input_dimensions": [224, 224, 3],
        "explainability": "Grad-CAM (top_conv layer)",
    }


@app.get("/history")
def get_history(limit: int = 50) -> List[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as connection:
        rows = connection.execute(
            """
            SELECT id, analysis_id, filename, plant, disease, confidence, timestamp, image_url, gradcam_image, heatmap_image, class_name, payload_json
            FROM predictions
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    history: List[Dict[str, Any]] = []
    for row in rows:
        payload = {}
        if row[11]:
            try:
                payload = json.loads(row[11])
            except Exception:
                payload = {}

        conf = round(float(row[5]), 2)
        item = {
            "id": row[0],
            "analysisId": row[1] or str(row[0]),
            "filename": row[2],
            "plant": row[3],
            "disease": row[4],
            "confidence": conf,
            "confidence_level": get_confidence_level(conf),
            "timestamp": row[6],
            "image_url": row[7] or "",
            "gradcam_image": row[8] or "",
            "heatmap_image": row[9] or "",
            "class_name": row[10] or "",
            "payload": payload,
        }
        history.append(item)
    return history


@app.delete("/history/{item_id}")
def delete_history_item(item_id: int) -> Dict[str, Any]:
    with sqlite3.connect(DB_PATH) as connection:
        cursor = connection.execute("DELETE FROM predictions WHERE id = ?", (item_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="History record not found.")
    return {"success": True, "deleted_id": item_id}


@app.delete("/history")
def clear_all_history() -> Dict[str, Any]:
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute("DELETE FROM predictions")
    return {"success": True, "message": "Analysis history cleared."}


@app.post("/predict")
async def predict_image(file: UploadFile = File(...)) -> Dict[str, Any]:
    validate_uploaded_file(file)
    ensure_model_loaded()

    if model is None or not class_names:
        raise HTTPException(
            status_code=503,
            detail="The classification model is not currently available. Please ensure model training has completed."
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="No image content was received.")

    # Unique analysis ID per upload for request consistency & anti-race conditions
    analysis_id = str(uuid.uuid4())
    file_id = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    clean_stem = Path(file.filename or "leaf").stem[:32]
    original_save_name = f"{file_id}_{clean_stem}.png"
    original_save_path = UPLOADS_DIR / original_save_name

    # Read original dimensions
    try:
        pil_img = Image.open(io.BytesIO(file_bytes))
        img_width, img_height = pil_img.size
        original_save_path.write_bytes(file_bytes)
        image_url = f"/static/uploads/{original_save_name}"
    except Exception:
        img_width, img_height = 256, 256
        image_url = ""

    t_start = time.perf_counter()
    try:
        image_batch, original_rgb = preprocess_image_from_bytes(file_bytes)
        is_quality_ok, quality_message = assess_image_quality(original_rgb)
        if not is_quality_ok:
            if original_save_path.exists():
                original_save_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail=quality_message)

        is_leaf, leaf_message, leaf_metrics = verify_plant_leaf(original_rgb)
        if not is_leaf:
            if original_save_path.exists():
                original_save_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail=leaf_message)

        raw_predictions = model.predict(image_batch, verbose=0)[0]
    except HTTPException:
        raise
    except Exception as exc:
        if original_save_path.exists():
            original_save_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail="Classification failed during tensor inference."
        ) from exc
    t_infer_end = time.perf_counter()
    inference_time_ms = round((t_infer_end - t_start) * 1000, 1)

    # 1. Predicted class index from argmax of actual model output
    predicted_index = int(np.argmax(raw_predictions))
    predicted_class = class_names[predicted_index]

    # 2. Genuine confidence: raw softmax probability * 100 (NEVER artificially calibrated)
    raw_confidence = float(raw_predictions[predicted_index] * 100)
    confidence = round(raw_confidence, 2)
    confidence_level = get_confidence_level(confidence)

    # Out-of-distribution guard: If model confidence is severely diffuse (< 30%) and foliar coverage is low (< 22%)
    if raw_confidence < 30.0 and leaf_metrics.get("foliar_ratio", 0) < 0.22:
        if original_save_path.exists():
            original_save_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail="Non-plant image detected: The model could not recognize this image as a valid plant leaf. Please upload a clear photo of a plant leaf."
        )

    # 3. Host plant & disease from model class mapping
    parsed = parse_class_name(predicted_class)
    plant_name = parsed["plant"]
    disease_name = parsed["disease"]
    disease_info = get_disease_metadata(predicted_class)
    scientific_name = disease_info.get("pathogen", "Botanical classification")

    # 4. Top-5 alternative candidates directly from softmax descending order
    top_5_indices = np.argsort(raw_predictions)[::-1][:5]
    alternatives = []
    for idx in top_5_indices:
        alt_class = class_names[idx]
        alt_parsed = parse_class_name(alt_class)
        alt_prob = float(raw_predictions[idx])
        alternatives.append(
            {
                "class_name": alt_class,
                "plant": alt_parsed["plant"],
                "disease": alt_parsed["disease"],
                "confidence": round(alt_prob * 100, 2),
                "probability": alt_prob,
            }
        )

    # 5. Severity estimation (clearly rule-based)
    severity_info = estimate_severity(predicted_class, disease_name)

    # 6. Status
    is_healthy = "healthy" in disease_name.lower()
    status_label = "Healthy Tissue" if is_healthy else "Active Infection"

    # 7. Dynamic Explanation based on predicted class and confidence
    if is_healthy:
        explanation_text = (
            f"The leaf shows healthy physiological characteristics with uniform chlorophyll and "
            f"no evidence of disease symptoms matching {plant_name} pathogens."
        )
    elif confidence_level in ["high", "moderate"]:
        explanation_text = (
            f"The leaf exhibits visible patterns characteristic of {disease_name} in {plant_name} foliage, "
            f"including distinct lesion formation and localized discoloration. Symptoms align with the model's learned characteristics."
        )
    else:
        explanation_text = (
            f"The model detected some patterns that could correspond to {disease_name} in {plant_name}, "
            f"but prediction confidence is low ({confidence}%). Lighting, background clutter, or non-foliar artifacts may affect certainty."
        )

    # 8. Dynamic Recommendations from knowledge base
    recommendations_list = disease_info.get("prevention", [
        "Isolate affected foliage to prevent potential spread.",
        "Ensure proper airflow and avoid overhead watering.",
        "Inspect neighboring plants for similar symptoms.",
        "Consult agricultural extension specialists if conditions worsen.",
    ])

    # 9. Grad-CAM targeting the EXACT predicted class
    t_gradcam_start = time.perf_counter()
    gradcam_image = "/static/gradcam/placeholder.png"
    heatmap_image = "/static/gradcam/placeholder.png"
    temp_input_path = BASE_DIR / f"temp_{file_id}.png"

    try:
        temp_input_path.write_bytes(file_bytes)
        gradcam_result = generate_gradcam_for_image(
            image_path=temp_input_path,
            output_dir=GRADCAM_DIR,
            target_class_index=predicted_index,
            loaded_model=model,
            loaded_class_names=class_names,
        )
        gradcam_image = f"/static/gradcam/{Path(gradcam_result['gradcam_path']).name}"
        if "heatmap_path" in gradcam_result:
            heatmap_image = f"/static/gradcam/{Path(gradcam_result['heatmap_path']).name}"
        else:
            heatmap_image = gradcam_image
    except Exception as g_err:
        print(f"Grad-CAM generation error: {g_err}")
        gradcam_image = "/static/gradcam/placeholder.png"
        heatmap_image = "/static/gradcam/placeholder.png"
    finally:
        if temp_input_path.exists():
            temp_input_path.unlink(missing_ok=True)

    t_gradcam_end = time.perf_counter()
    gradcam_time_ms = round((t_gradcam_end - t_gradcam_start) * 1000, 1)
    total_latency_ms = round((t_gradcam_end - t_start) * 1000, 1)

    client_filename = file.filename or "uploaded-leaf.jpg"

    # Single Source of Truth Object
    single_source_result: Dict[str, Any] = {
        "analysisId": analysis_id,
        "image": {
            "filename": client_filename,
            "width": img_width,
            "height": img_height,
            "url": image_url,
        },
        "plant": {
            "name": plant_name,
            "confidence": confidence,
        },
        "prediction": {
            "disease": disease_name,
            "scientific_name": scientific_name,
            "class_name": predicted_class,
            "confidence": confidence,
            "confidence_level": confidence_level,
        },
        "alternatives": alternatives,
        "severity": severity_info,
        "status": status_label,
        "explanation": explanation_text,
        "gradcam": {
            "targetClass": disease_name,
            "targetClassIndex": predicted_index,
            "image": gradcam_image,
            "heatmap": heatmap_image,
            "hotspots": gradcam_result.get("hotspots", []) if "gradcam_result" in locals() and isinstance(gradcam_result, dict) else [],
            "lesions_detected": gradcam_result.get("lesions_detected", 0) if "gradcam_result" in locals() and isinstance(gradcam_result, dict) else 0,
            "affected_area_pct": gradcam_result.get("affected_area_pct", 0.0) if "gradcam_result" in locals() and isinstance(gradcam_result, dict) else 0.0,
        },
        "recommendations": recommendations_list,
        "quality_warning": quality_message if not is_quality_ok else None,
        "is_out_of_distribution": confidence < 50.0,
        "model": {
            "name": "EfficientNet-B0",
            "inputSize": "224x224",
            "inferenceTime": f"{inference_time_ms} ms",
        },
        # Backwards compatible fields
        "id": 0,
        "plant_name": plant_name,
        "disease_name": disease_name,
        "disease": disease_name,
        "confidence": confidence,
        "confidence_level": confidence_level,
        "class_name": predicted_class,
        "image_url": image_url,
        "gradcam_image": gradcam_image,
        "heatmap_image": heatmap_image,
        "disease_info": disease_info,
        "telemetry": {
            "inference_time_ms": inference_time_ms,
            "gradcam_time_ms": gradcam_time_ms,
            "total_latency_ms": total_latency_ms,
            "model_backbone": "EfficientNet-B0",
            "input_resolution": "224x224x3",
            "target_layer": "top_conv",
            "dataset": "PlantVillage (38 Classes)",
        },
        "debug": {
            "predicted_index": predicted_index,
            "predicted_raw_class": predicted_class,
            "raw_softmax_prob": float(raw_predictions[predicted_index]),
            "top_5": [(class_names[i], float(raw_predictions[i])) for i in top_5_indices],
        },
        "analyzed_at": datetime.utcnow().strftime("%b %d, %Y, %H:%M"),
    }

    # Save to SQLite database
    record_id = save_prediction(
        analysis_id=analysis_id,
        filename=client_filename,
        plant=plant_name,
        disease=disease_name,
        confidence=confidence,
        image_url=image_url,
        gradcam_image=gradcam_image,
        heatmap_image=heatmap_image,
        class_name=predicted_class,
        payload_json=json.dumps(single_source_result),
    )
    single_source_result["id"] = record_id

    return single_source_result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
