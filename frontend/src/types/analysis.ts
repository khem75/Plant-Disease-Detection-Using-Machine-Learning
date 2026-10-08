export type ConfidenceLevel = "high" | "moderate" | "medium" | "low" | "uncertain";

export interface AlternativePrediction {
  class_name: string;
  plant: string;
  disease: string;
  confidence: number;
  probability: number;
}

export interface DiseaseInfo {
  plant: string;
  disease: string;
  pathogen: string;
  description: string;
  symptoms: string[];
  prevention: string[];
}

export interface TelemetryData {
  inference_time_ms: number;
  gradcam_time_ms?: number;
  total_latency_ms: number;
  model_backbone: string;
  input_resolution?: string;
  target_layer?: string;
  dataset?: string;
  temperature?: number;
}

export interface SeverityInfo {
  label: string;
  score: number;
  is_estimated: boolean;
  method: string;
  description: string;
}

export interface PredictionResult {
  id?: number;
  analysisId?: string;
  filename?: string;
  image?: {
    filename: string;
    width: number;
    height: number;
    url?: string;
  };
  plant: string | { name: string; confidence: number };
  prediction?: {
    disease: string;
    scientific_name?: string;
    class_name?: string;
    confidence: number;
    confidence_level: ConfidenceLevel;
  };
  disease: string;
  pathogen?: string;
  confidence: number;
  confidence_level: ConfidenceLevel;
  class_name: string;
  image_url?: string;
  gradcam_image: string;
  heatmap_image?: string;
  alternatives?: AlternativePrediction[];
  severity?: SeverityInfo;
  status?: string;
  explanation?: string;
  gradcam?: {
    targetClass: string;
    targetClassIndex?: number;
    image: string;
    heatmap?: string;
  };
  recommendations?: string[];
  model?: {
    name: string;
    inputSize: string;
    inferenceTime: string;
  };
  disease_info?: DiseaseInfo;
  telemetry?: TelemetryData;
  debug?: {
    predicted_index: number;
    predicted_raw_class: string;
    raw_softmax_prob: number;
    top_5: [string, number][];
  };
  model_version?: string;
  analyzed_at?: string;
}

export interface HistoryItem {
  id: number;
  analysisId?: string;
  filename: string;
  plant: string;
  disease: string;
  confidence: number;
  confidence_level: ConfidenceLevel;
  timestamp: string;
  image_url?: string;
  gradcam_image?: string;
  heatmap_image?: string;
  class_name?: string;
  payload?: PredictionResult;
}

export interface ModelHealthStatus {
  status: string;
  model_available: boolean;
  classes: number;
  model_architecture?: string;
  input_dimensions?: number[];
  explainability?: string;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
  dimensions?: { width: number; height: number };
  brightnessScore?: number;
}
