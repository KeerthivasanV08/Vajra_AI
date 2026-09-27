"""
Build Geo Trajectory Features Dataset.
Output: data/processed/spatial/geo_trajectory_features.csv
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import PROCESSED_DIR
from data.preprocessing.common_preprocessing import save_clean_csv

def build_geo_trajectory_features() -> pd.DataFrame:
    print("[FEATURES] Building geo trajectory features...")
    ip_path = PROCESSED_DIR / "spatial" / "ip_geo_sessions_clean.csv"
    df = pd.read_csv(ip_path)

    df["session_timestamp_dt"] = pd.to_datetime(df["session_timestamp"])

    grouped = df.groupby("account_id")

    rows = []
    for account_id, group in grouped:
        group = group.sort_values(by="session_timestamp_dt")
        
        sess_count = len(group)
        first_ts = group["session_timestamp"].iloc[0]
        last_ts = group["session_timestamp"].iloc[-1]
        
        u_countries = group["country"].nunique()
        u_cities = group["city"].nunique()
        
        tot_dist = group["distance_from_previous_km"].sum()
        avg_dist = group["distance_from_previous_km"].mean()
        max_dist = group["distance_from_previous_km"].max()
        
        # Calculate speed km/h
        time_diffs_hr = group["time_since_previous_session_sec"] / 3600.0
        speeds = np.where(time_diffs_hr > 0, group["distance_from_previous_km"] / time_diffs_hr, 0.0)
        avg_speed = float(np.nanmean(speeds)) if len(speeds) > 0 else 0.0
        max_speed = float(np.nanmax(speeds)) if len(speeds) > 0 else 0.0
        
        # Direction change count (> 30 deg)
        dir_changes = (group["movement_direction_deg"].diff().abs() > 30).sum()
        
        foreign_ratio = float((group["is_foreign_session"] == 1).mean())
        vpn_ratio = float((group["vpn_flag"] == 1).mean())
        domestic_ratio = float(1.0 - foreign_ratio)
        
        last_lat = float(group["geo_lat"].iloc[-1])
        last_lon = float(group["geo_lon"].iloc[-1])
        
        rows.append({
            "account_id": account_id,
            "session_count": sess_count,
            "first_session_timestamp": first_ts,
            "last_session_timestamp": last_ts,
            "unique_countries": u_countries,
            "unique_cities": u_cities,
            "total_distance_km": round(tot_dist, 2),
            "average_session_distance_km": round(avg_dist, 2),
            "max_session_distance_km": round(max_dist, 2),
            "average_speed_kmh": round(avg_speed, 2),
            "max_speed_kmh": round(max_speed, 2),
            "direction_change_count": int(dir_changes),
            "foreign_session_ratio": round(foreign_ratio, 4),
            "vpn_session_ratio": round(vpn_ratio, 4),
            "domestic_session_ratio": round(domestic_ratio, 4),
            "last_known_lat": last_lat,
            "last_known_lon": last_lon
        })

    df_feat = pd.DataFrame(rows)
    out_path = PROCESSED_DIR / "spatial" / "geo_trajectory_features.csv"
    return save_clean_csv(df_feat, out_path, name="Geo Trajectory Features")

if __name__ == "__main__":
    build_geo_trajectory_features()
