"""
VAJRA Backend Configuration
Central configuration for model training, dataset paths, evaluation outputs, and parameters.
"""

import sys
from pathlib import Path

# Paths
# This file lives at backend/config/config.py
# parents[0] = backend/config/
# parents[1] = backend/           <- BACKEND_DIR (canonical anchor)
# parents[2] = Vajra_AI/          <- REPO_ROOT  (for shared assets like images)
REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = Path(__file__).resolve().parents[1]
BASE_DIR = BACKEND_DIR  # legacy alias

# Data lives inside backend/ (moved from repo root for self-contained deployment)
DATA_DIR = BACKEND_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
REFERENCE_DIR = DATA_DIR / "reference"
MODELS_DIR = BACKEND_DIR / "models"
EVALUATION_DIR = BACKEND_DIR / "evaluation"
AUDIT_DIR = BACKEND_DIR / "audit"
IMAGES_DIR = REPO_ROOT / "images"

# Model Image Subdirectories
MODEL_IMAGE_DIRS = {
    "model1": IMAGES_DIR / "model1_trajectory",
    "model2": IMAGES_DIR / "model2_node_vulnerability",
    "model3": IMAGES_DIR / "model3_spatial_region",
    "model4": IMAGES_DIR / "model4_node_ranking",
    "model5": IMAGES_DIR / "model5_cross_border",
    "model6": IMAGES_DIR / "model6_sop_fusion",
    "model7": IMAGES_DIR / "model7_fairness",
    "model8": IMAGES_DIR / "model8_syndicate",
    "overall": IMAGES_DIR / "overall"
}

# Global Constants & Seeds
SEED = 42
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

# SOP Fusion Weights (0.45 Digital + 0.35 Physical + 0.20 Context)
W_DIGITAL = 0.45
W_PHYSICAL = 0.35
W_CONTEXT = 0.20

# Prototype SOP Thresholds
SOP_THRESHOLDS = {
    "MONITOR": 0.50,
    "SOFT_ALERT": 0.70,
    "RECOMMEND_HOLD": 0.85
}

# Image Quality
DPI = 150
