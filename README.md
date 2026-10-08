# Plant Disease Detection Using Deep Learning with Explainable AI

## Overview
This project is a local, end-to-end plant disease classification system built with TensorFlow, FastAPI, and Next.js. A user uploads an image of a plant leaf, the model predicts the disease, and a Grad-CAM heatmap explains the important image regions behind the prediction.

## Features
- Plant leaf image upload in the web interface
- EfficientNetB0 transfer learning model
- Automatic class discovery from the PlantVillage dataset
- Training, validation, and evaluation pipeline
- Confusion matrix and performance metrics
- Grad-CAM explanation overlay
- SQLite history storage
- FastAPI backend for predictions
- Responsive Next.js dashboard

## Architecture
- Data and model files: project root
- Backend: backend/main.py
- Frontend: frontend/
- Training: train.py
- Explainability: gradcam.py
- SQLite database: plant_disease_history.db

## Technologies
- Python
- TensorFlow / Keras
- FastAPI
- Next.js + TypeScript
- SQLite
- OpenCV
- NumPy
- PIL
- scikit-learn
- Matplotlib
- Seaborn

## Dataset
The training script uses the PlantVillage dataset from KaggleHub: `abdallahalidev/plantvillage-dataset`.
The script downloads it automatically into KaggleHub's cache on the first training run. To intentionally train on a local copy in the project `dataset` folder instead, set `USE_LOCAL_DATASET=1` before running the script.

Example structure:

```text
dataset/
  Apple___Apple_scab/
  Apple___Black_rot/
  Apple___healthy/
  Tomato___Late_blight/
  ...
```

Do not manually rename class folders. The script automatically detects the class names from the dataset directory.

## Machine Learning Approach
- EfficientNetB0 base model with ImageNet weights
- Input size: 224 x 224 x 3
- Transfer learning with a frozen base model
- Dense classification head with softmax activation
- Categorical cross-entropy, Adam optimizer
- Early stopping, checkpointing, and learning-rate reduction
- Grad-CAM generation for explainability

## Installation
Windows commands:

```powershell
cd d:\plant based disease
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Dataset Setup
Place the downloaded PlantVillage dataset under the project directory:

```powershell
cd d:\plant based disease
mkdir dataset
# Copy or extract the PlantVillage folders into dataset/
```

## Model Training
Run:

```powershell
python train.py
```

This will:
- download or reuse `abdallahalidev/plantvillage-dataset` through KaggleHub when needed
- detect class folders automatically
- split data into train, validation, and test sets
- train the model
- save the best model as model/plant_disease_model.keras
- save class labels to model/class_names.json

## Backend Setup
From the project root:

```powershell
uvicorn backend.main:app --reload
```

API endpoints:
- GET /
- GET /health
- GET /history
- POST /predict

## Frontend Setup
From the frontend folder:

```powershell
cd frontend
npm install
npm run dev
```

Then open the local Next.js page in the browser, usually at:

```text
http://localhost:3000
```

## API Endpoints
### GET /health
Returns service health status.

### POST /predict
Accepts multipart form-data with an image file.
Returns:
- plant
- disease
- confidence
- class_name
- gradcam_image
- disease_info

## Grad-CAM Explanation
Grad-CAM highlights the regions of the leaf that influenced the model’s decision. This helps users understand which regions contributed to the predicted class.

## Screenshots
Add screenshots to the README when the application is running locally:

```text
Screenshots here
```

## Future Improvements
- Add more disease metadata for each class
- Retrain with a larger and more balanced dataset
- Add confidence threshold handling and guided user messages
- Support more crops beyond the PlantVillage set
- Deploy the project to a cloud service

## Important Notes
- The project is designed for local development and demonstration.
- The actual prediction is produced by the trained TensorFlow model.
- The Grad-CAM output is generated from the trained model instead of a mock image.
- If the dataset is missing, the model training step will notify you clearly.
