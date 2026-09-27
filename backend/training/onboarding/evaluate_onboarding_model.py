# training/onboarding/evaluate_onboarding_model.py

import joblib

from pathlib import Path

from onboarding_feature_pipeline import (
    prepare_onboarding_training_data
)

# parents[3] = repo root, parents[2] = backend/ ← canonical anchor
BACKEND_DIR = Path(__file__).resolve().parents[2]

MODEL_DIR = BACKEND_DIR / "app" / "models" / "onboarding"

# Data now lives inside backend/data/ (self-contained deployment)
DATASET_PATH = (
    BACKEND_DIR
    / "data"
    / "processed"
    / "onboarding_final_dataset.csv"
)


def evaluate():

    X, y = prepare_onboarding_training_data()

    model = joblib.load(
        MODEL_DIR / "onboarding_lightgbm.pkl"
    )

    scaler = joblib.load(
        MODEL_DIR / "onboarding_scaler.pkl"
    )

    X = scaler.transform(X)

    score = model.score(
        scaler.transform(X),
        y
    )

    print(
        f"Accuracy: {score}"
    )


if __name__ == "__main__":
    evaluate()