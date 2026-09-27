"""
Audit module for image organization and quality verification in images/.
"""

import sys
import json
import shutil
from pathlib import Path
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import IMAGES_DIR, MODEL_IMAGE_DIRS, AUDIT_DIR

IMAGE_MAPPING = {
    # Model 1
    "model1_trajectory_metrics.png": "model1",
    "model1_trajectory_error_distribution.png": "model1",
    "model1_trajectory_confusion_matrix.png": "model1",
    # Model 2
    "model2_node_vulnerability_metrics.png": "model2",
    "model2_node_vulnerability_feature_importance.png": "model2",
    "model2_node_vulnerability_confusion_matrix.png": "model2",
    "model2_node_vulnerability_residuals.png": "model2",
    # Model 3
    "model3_spatial_region_metrics.png": "model3",
    "model3_spatial_region_confusion_matrix.png": "model3",
    "model3_spatial_region_feature_importance.png": "model3",
    # Model 4
    "model4_node_ranking_metrics.png": "model4",
    "model4_topk_accuracy.png": "model4",
    "model4_rank_distribution.png": "model4",
    "model4_node_ranker_feature_importance.png": "model4",
    # Model 5
    "model5_cross_border_metrics.png": "model5",
    "model5_cross_border_confusion_matrix.png": "model5",
    "model5_cross_border_roc_curve.png": "model5",
    "model5_cross_border_pr_curve.png": "model5",
    "model5_cross_border_feature_importance.png": "model5",
    # Model 6
    "model6_sop_fusion_metrics.png": "model6",
    "model6_calibration_before_after.png": "model6",
    "model6_reliability_curve.png": "model6",
    "model6_sop_distribution.png": "model6",
    # Model 7
    "model7_fairness_group_rates.png": "model7",
    "model7_fairness_dir.png": "model7",
    "model7_historical_density_vs_risk.png": "model7",
    # Model 8
    "model8_syndicate_similarity.png": "model8",
    "model8_precision_at_k.png": "model8",
    # Overall
    "all_models_performance_summary.png": "overall",
    "model_comparison_baselines.png": "overall"
}

def organize_images():
    """
    Ensure subdirectories exist and move loose or misplaced PNG files into their model-specific folders.
    """
    moves = []
    # Create subdirectories
    for key, subfolder_path in MODEL_IMAGE_DIRS.items():
        subfolder_path.mkdir(parents=True, exist_ok=True)

    # Search in IMAGES_DIR root and all subfolders (including overall) for misplaced images
    for img_name, target_model_key in IMAGE_MAPPING.items():
        target_folder = MODEL_IMAGE_DIRS[target_model_key]
        target_path = target_folder / img_name

        # Search where the file currently is
        current_location = None
        if (IMAGES_DIR / img_name).exists():
            current_location = IMAGES_DIR / img_name
        else:
            for folder in MODEL_IMAGE_DIRS.values():
                if (folder / img_name).exists():
                    current_location = folder / img_name
                    break

        if current_location and current_location != target_path:
            shutil.move(str(current_location), str(target_path))
            moves.append({"file": img_name, "from": str(current_location.relative_to(PROJECT_ROOT)), "to": str(target_folder.relative_to(PROJECT_ROOT))})

    return moves

def audit_images(auto_organize: bool = True):
    """
    Perform audit on image quality and organization.
    """
    if auto_organize:
        organize_images()

    report = {
        "images_dir": str(IMAGES_DIR),
        "subfolders_checked": {},
        "total_images_audited": 0,
        "valid_images": 0,
        "corrupted_images": 0,
        "loose_files_count": 0,
        "image_details": []
    }

    # Check loose files in root
    loose_files = [f.name for f in IMAGES_DIR.iterdir() if f.is_file() and f.suffix.lower() in [".png", ".jpg", ".jpeg"]]
    report["loose_files_count"] = len(loose_files)
    report["loose_files"] = loose_files

    # Audit images in model subdirectories
    for model_key, subfolder_path in MODEL_IMAGE_DIRS.items():
        report["subfolders_checked"][model_key] = {
            "folder_path": str(subfolder_path.relative_to(PROJECT_ROOT)),
            "image_count": 0
        }

        if not subfolder_path.exists():
            continue

        for img_path in subfolder_path.glob("*.*"):
            if img_path.is_file() and img_path.suffix.lower() in [".png", ".jpg", ".jpeg"]:
                report["total_images_audited"] += 1
                report["subfolders_checked"][model_key]["image_count"] += 1

                detail = {
                    "filename": img_path.name,
                    "subfolder": model_key,
                    "relative_path": str(img_path.relative_to(PROJECT_ROOT)),
                    "file_size_bytes": img_path.stat().st_size,
                    "valid": False,
                    "width": 0,
                    "height": 0,
                    "dpi": None
                }

                if img_path.stat().st_size > 0:
                    try:
                        with Image.open(img_path) as im:
                            detail["valid"] = True
                            detail["width"], detail["height"] = im.size
                            detail["dpi"] = im.info.get("dpi", None)
                            report["valid_images"] += 1
                    except Exception as e:
                        detail["valid"] = False
                        detail["error"] = str(e)
                        report["corrupted_images"] += 1
                else:
                    detail["valid"] = False
                    detail["error"] = "Zero byte file"
                    report["corrupted_images"] += 1

                report["image_details"].append(detail)

    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = AUDIT_DIR / "image_audit.json"
    with open(out_path, "w") as f:
        json.dump(report, f, indent=2)

    return report

if __name__ == "__main__":
    res = audit_images(auto_organize=True)
    print(json.dumps(res, indent=2))
