"""
Build Onboarding Features Dataset.
Output: data/processed/onboarding/onboarding_features.csv
"""

import sys
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import PROCESSED_DIR
from data.preprocessing.common_preprocessing import save_clean_csv

def build_onboarding_features() -> pd.DataFrame:
    print("[FEATURES] Building onboarding features...")
    onb_path = PROCESSED_DIR / "onboarding" / "onboarding_clean.csv"
    dev_path = PROCESSED_DIR / "onboarding" / "devices_clean.csv"

    df_onb = pd.read_csv(onb_path)
    df_dev = pd.read_csv(dev_path) if dev_path.exists() else pd.DataFrame()

    if not df_dev.empty and "device_id" in df_dev.columns:
        df_onb = df_onb.merge(df_dev[["device_id", "device_age_days"]], on="device_id", how="left", suffixes=("", "_dev"))
        if "device_age_days_dev" in df_onb.columns:
            df_onb["device_age_days"] = df_onb["device_age_days_dev"].fillna(df_onb.get("sim_age_days", 30))
    else:
        df_onb["device_age_days"] = 30

    cols = [
        "onboarding_id", "user_id", "account_id",
        "identity_trust_score", "face_match_score", "device_trust_score",
        "device_age_days", "sim_age_days", "sim_binding_ok", "sim_swap_flag",
        "multi_sim_flag", "vpn_flag", "hosting_flag", "proxy_flag", "tor_flag",
        "geo_mismatch_flag", "ip_risk_score", "typing_speed",
        "form_completion_time", "copy_paste_ratio", "otp_retry_count",
        "shared_device_count"
    ]

    existing_cols = [c for c in cols if c in df_onb.columns]
    df_feat = df_onb[existing_cols].copy()
    if "shared_device_count" in df_feat.columns:
        df_feat.rename(columns={"shared_device_count": "device_shared_count"}, inplace=True)

    out_path = PROCESSED_DIR / "onboarding" / "onboarding_features.csv"
    return save_clean_csv(df_feat, out_path, name="Onboarding Features")

if __name__ == "__main__":
    build_onboarding_features()
