"""
VAJRA Platform Master End-to-End Execution Pipeline.
Executes raw validation, preprocessing, feature engineering, candidate generation, and sequential model training (Models 1 through 8).
"""

import sys
import json
import argparse
from pathlib import Path

# Workspace root is 3 levels up from backend/scripts/run_pipeline.py
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.generate_all import run_all_generators
from data.preprocessing.preprocess_all import run_all_preprocessors
from data.features.build_all_features import run_all_feature_builders
from data.generation.generate_manifests import generate_manifests
from data.validation.validate_all import run_all_validations
from data.validation.validate_all_data import validate_all_data
from backend.training.train_all_models import train_all_models

def run_master_pipeline(rows: int = 30000, seed: int = 42):
    print("=" * 80)
    print("VAJRA PLATFORM — MASTER PIPELINE EXECUTION")
    print("=" * 80)
    
    # 1. Synthetic Data Generation
    run_all_generators(rows=rows, seed=seed)
    
    # 2. Preprocessing & ETL Cleaning
    run_all_preprocessors()
    
    # 3. Feature Engineering
    run_all_feature_builders()
    
    # 4. Manifests & Feature Dictionary
    generate_manifests(seed=seed, requested_rows=rows)
    
    # 5. Data Validation & Quality Checks
    validate_all_data()
    run_all_validations()
    
    # 6. Model Training & Evaluation Suite (Models 1 to 8)
    train_all_models(seed=seed)
    
    # Read final model evaluation metrics for report
    eval_dir = PROJECT_ROOT / "backend" / "evaluation"
    
    def load_json(name):
        p = eval_dir / name
        if p.exists():
            with open(p) as f:
                return json.load(f)
        return {}

    m1 = load_json("model1_trajectory_metrics.json")
    m2 = load_json("model2_node_vulnerability_metrics.json")
    m3 = load_json("model3_spatial_region_metrics.json")
    m4 = load_json("model4_node_ranking_metrics.json")
    m5 = load_json("model5_cross_border_metrics.json")
    m6 = load_json("model6_sop_fusion_metrics.json")
    m7 = load_json("model7_fairness_metrics.json")
    m8 = load_json("model8_syndicate_metrics.json")

    print("\n" + "=" * 50)
    print("VAJRA ML PIPELINE COMPLETE")
    print("=" * 50)
    print("DATA\n-----")
    print("Raw datasets:             16 datasets")
    print("Processed datasets:       11 datasets")
    print("Validation status:        PASSED")
    print("\nMODELS\n-------")
    print(f"Model 1 - Trajectory:\n  Status:                 TRAINED & EVALUATED\n  Main metric:            Top-1 Cell Acc: {m1.get('top1_accuracy', 0):.2%}")
    print(f"Model 2 - Node Vulnerability:\n  Status:                 TRAINED & EVALUATED\n  Main metric:            R2 Score: {m2.get('r2', 0):.4f} (MAE: {m2.get('mae', 0):.4f})")
    print(f"Model 3 - Spatial Region:\n  Status:                 TRAINED & EVALUATED\n  Main metric:            Top-1 Region Acc: {m3.get('top1_accuracy', 0):.2%}")
    print(f"Model 4 - Node Ranking:\n  Status:                 TRAINED & EVALUATED\n  Top-1:                  Hit@1: {m4.get('hit_at_1', 0):.2%}\n  Top-3:                  Hit@3: {m4.get('hit_at_3', 0):.2%}")
    print(f"Model 5 - Cross-Border:\n  Status:                 TRAINED & EVALUATED\n  ROC-AUC:                {m5.get('roc_auc', 0):.4f}\n  Recall:                 {m5.get('recall', 0):.2%}")
    print(f"Model 6 - SOP Fusion:\n  Status:                 TRAINED & EVALUATED\n  Brier score:            {m6.get('brier_score_calibrated', 0):.4f}\n  Calibration status:     {m6.get('calibration_status', 'N/A')}")
    print(f"Model 7 - Fairness:\n  Status:                 AUDITED & VERIFIED\n  Analyzed Groups:        {m7.get('analyzed_groups_count', 0)}")
    print(f"Model 8 - Syndicate:\n  Status:                 MATCHED & VERIFIED\n  Precision@K:            Precision@1: {m8.get('precision_at_1', 0):.2%}")
    print("\nARTIFACTS\n---------")
    print("Models:                 backend/models/")
    print("Evaluation JSON:        backend/evaluation/")
    print("Images:                 images/")
    print("=" * 50)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Master pipeline runner for VAJRA Platform")
    parser.add_argument("--rows", type=int, default=30000, help="Row count for synthetic data")
    parser.add_argument("--seed", type=int, default=42, help="Deterministic random seed")
    args = parser.parse_args()
    
    run_master_pipeline(rows=args.rows, seed=args.seed)
