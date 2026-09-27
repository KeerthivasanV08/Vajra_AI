# backend/app/services/device_intelligence_service.py

import pandas as pd

from pathlib import Path

from app.core import storage_paths

ONBOARDING_RESULTS = storage_paths.ONBOARDING_RISK_SNAPSHOT_PATH



class DeviceIntelligenceService:

    def __init__(self):

        try:

            self.df = pd.read_csv(
                ONBOARDING_RESULTS
            )

        except:

            self.df = pd.DataFrame()

    def is_device_mule_hub(
        self,
        device_id
    ):

        if self.df.empty:
            return False

        suspicious = self.df[
            self.df["risk_level"]
            .isin([
                "REJECT",
                "REVIEW"
            ])
        ]

        count = len(
            suspicious[
                suspicious["device_id"]
                == device_id
            ]
        )

        return count >= 3