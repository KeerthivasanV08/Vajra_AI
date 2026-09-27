"""
Common Machine Learning & Spatial Utilities for VAJRA Platform.
"""

import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import MODELS_DIR, EVALUATION_DIR, IMAGES_DIR, MODEL_IMAGE_DIRS, DPI, SEED

def haversine_distance(lat1, lon1, lat2, lon2) -> np.ndarray:
    """Calculate Haversine distance in km between two sets of coordinates."""
    R = 6371.0 # Earth radius in km
    lat1_rad, lon1_rad = np.radians(lat1), np.radians(lon1)
    lat2_rad, lon2_rad = np.radians(lat2), np.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = np.sin(dlat / 2.0)**2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(dlon / 2.0)**2
    a = np.clip(a, 0.0, 1.0)
    c = 2.0 * np.arcsin(np.sqrt(a))
    return R * c

def calculate_bearing(lat1, lon1, lat2, lon2) -> np.ndarray:
    """Calculate compass bearing in degrees (0-360) between two coordinates."""
    lat1_rad, lon1_rad = np.radians(lat1), np.radians(lon1)
    lat2_rad, lon2_rad = np.radians(lat2), np.radians(lon2)

    dlon = lon2_rad - lon1_rad

    y = np.sin(dlon) * np.cos(lat2_rad)
    x = np.cos(lat1_rad) * np.sin(lat2_rad) - np.sin(lat1_rad) * np.cos(lat2_rad) * np.cos(dlon)

    initial_bearing = np.degrees(np.arctan2(y, x))
    compass_bearing = (initial_bearing + 360.0) % 360.0
    return compass_bearing

def calculate_speed(dist_km: np.ndarray, time_sec: np.ndarray) -> np.ndarray:
    """Calculate speed in km/h from distance in km and time in seconds."""
    hours = time_sec / 3600.0
    speeds = np.where(hours > 0, dist_km / hours, 0.0)
    return np.nan_to_num(speeds, nan=0.0, posinf=0.0, neginf=0.0)

def chronological_split(df: pd.DataFrame, time_col: str = None, train_ratio: float = 0.70, val_ratio: float = 0.15) -> tuple:
    """Perform strict chronological train / validation / test split."""
    df_sorted = df.copy()
    if time_col and time_col in df_sorted.columns:
        df_sorted[time_col] = pd.to_datetime(df_sorted[time_col])
        df_sorted = df_sorted.sort_values(by=time_col).reset_index(drop=True)
        
    n = len(df_sorted)
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))
    
    train_df = df_sorted.iloc[:train_end].copy()
    val_df = df_sorted.iloc[train_end:val_end].copy()
    test_df = df_sorted.iloc[val_end:].copy()
    
    return train_df, val_df, test_df

def save_model_artifact(model, filename: str) -> Path:
    """Save model artifact to backend/models/."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = MODELS_DIR / filename
    joblib.dump(model, out_path)
    print(f"[ARTIFACT] Saved model -> {out_path}")
    return out_path

def save_evaluation_metrics(metrics_dict: dict, filename: str) -> Path:
    """Save evaluation metrics to backend/evaluation/."""
    EVALUATION_DIR.mkdir(parents=True, exist_ok=True)
    out_path = EVALUATION_DIR / filename
    with open(out_path, "w") as f:
        json.dump(metrics_dict, f, indent=2)
    print(f"[METRICS] Saved evaluation metrics -> {out_path}")
    return out_path

def register_model_in_registry(model_info: dict, registry_path: Path = None):
    """Update backend/evaluation/model_registry.json with model metadata."""
    if registry_path is None:
        registry_path = EVALUATION_DIR / "model_registry.json"
        
    registry_path.parent.mkdir(parents=True, exist_ok=True)
    
    registry = []
    if registry_path.exists():
        try:
            with open(registry_path, "r") as f:
                registry = json.load(f)
        except Exception:
            registry = []
            
    existing_idx = next((i for i, m in enumerate(registry) if m.get("model_id") == model_info.get("model_id")), None)
    if existing_idx is not None:
        registry[existing_idx] = model_info
    else:
        registry.append(model_info)
        
    with open(registry_path, "w") as f:
        json.dump(registry, f, indent=2)
    print(f"[REGISTRY] Updated model registry -> {registry_path}")

def get_image_dir_for_filename(filename: str) -> Path:
    """Determine subfolder path based on filename prefix."""
    if filename.startswith("model1_"):
        return MODEL_IMAGE_DIRS["model1"]
    elif filename.startswith("model2_"):
        return MODEL_IMAGE_DIRS["model2"]
    elif filename.startswith("model3_"):
        return MODEL_IMAGE_DIRS["model3"]
    elif filename.startswith("model4_") or filename.startswith("model4_topk"):
        return MODEL_IMAGE_DIRS["model4"]
    elif filename.startswith("model5_"):
        return MODEL_IMAGE_DIRS["model5"]
    elif filename.startswith("model6_"):
        return MODEL_IMAGE_DIRS["model6"]
    elif filename.startswith("model7_"):
        return MODEL_IMAGE_DIRS["model7"]
    elif filename.startswith("model8_"):
        return MODEL_IMAGE_DIRS["model8"]
    else:
        return MODEL_IMAGE_DIRS["overall"]

def save_plot(fig, filename: str) -> Path:
    """Save plot PNG image to model-specific subfolder in images/ with tight layout and specified DPI."""
    target_dir = get_image_dir_for_filename(filename)
    target_dir.mkdir(parents=True, exist_ok=True)
    out_path = target_dir / filename
    fig.tight_layout()
    fig.savefig(out_path, dpi=DPI)
    plt.close(fig)
    print(f"[PLOT] Saved plot image -> {out_path}")
    return out_path
