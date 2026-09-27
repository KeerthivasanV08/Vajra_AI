# backend/app/services/sim_binding_service.py

import pandas as pd

from pathlib import Path

from app.core import storage_paths

SIM_REGISTRY = storage_paths.PROCESSED_DIR / "sim_registry.csv"



class SimBindingService:

    def __init__(self):

        try:

            self.df = pd.read_csv(
                SIM_REGISTRY
            )

        except:

            self.df = pd.DataFrame()

    def verify_binding(
        self,
        user_id,
        current_imsi
    ):

        if self.df.empty:
            return False

        user_row = self.df[
            self.df["user_id"] == user_id
        ]

        if user_row.empty:
            return False

        registered_imsi = (
            user_row.iloc[0]
            ["registered_imsi"]
        )

        return (
            registered_imsi ==
            current_imsi
        )