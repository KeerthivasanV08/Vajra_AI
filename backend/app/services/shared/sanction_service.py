# backend/app/services/sanction_service.py

import pandas as pd

from pathlib import Path

from app.core import storage_paths

SANCTION_PATH = storage_paths.REFERENCE_DIR / "sanction_list.csv"



class SanctionService:

    def __init__(self):

        try:

            self.df = pd.read_csv(
                SANCTION_PATH
            )

        except:

            self.df = pd.DataFrame()

    def is_sanctioned(
        self,
        full_name
    ):

        if self.df.empty:
            return False

        return (
            full_name.upper()
            in
            self.df["entity_name"]
            .str.upper()
            .values
        )