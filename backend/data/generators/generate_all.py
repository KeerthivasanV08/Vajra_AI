"""
Generator adapter script for data/generators/generate_all.py
"""

import sys
import argparse
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.generate_all import run_all_generators

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate VAJRA raw datasets.")
    parser.add_argument("--rows", type=int, default=30000, help="Row count for primary datasets")
    parser.add_argument("--seed", type=int, default=42, help="Deterministic random seed")
    parser.add_argument("--output-dir", type=str, default=None, help="Output directory")
    args = parser.parse_args()
    
    run_all_generators(rows=args.rows, seed=args.seed)
