"""
VAJRA Synthetic Data Generation Configuration
Central configuration for constants, hotspot clusters, and reference values.
"""

from pathlib import Path

# Paths
# After move: file lives at backend/data/generation/config.py
# parents[0] = backend/data/generation/
# parents[1] = backend/data/
# parents[2] = backend/           <- canonical anchor
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
REFERENCE_DIR = DATA_DIR / "reference"
MANIFEST_DIR = DATA_DIR / "manifests"

# Row Count Defaults
MIN_ROWS = 25000
DEFAULT_ROWS = 30000
TRANSACTION_ROWS = 100000
RANDOM_SEED = 42

# Geographic Hotspot Clusters (Synthetic coordinates & metadata)
HOTSPOT_CLUSTERS = [
    {"name": "Mewat_Nuh", "lat": 28.1023, "lon": 77.0018, "city": "Nuh", "district": "Nuh", "state": "Haryana", "pincode": "122107"},
    {"name": "Alwar", "lat": 27.5530, "lon": 76.6346, "city": "Alwar", "district": "Alwar", "state": "Rajasthan", "pincode": "301001"},
    {"name": "Bharatpur", "lat": 27.2170, "lon": 77.4895, "city": "Bharatpur", "district": "Bharatpur", "state": "Rajasthan", "pincode": "321001"},
    {"name": "Jamtara", "lat": 23.9620, "lon": 86.8000, "city": "Jamtara", "district": "Jamtara", "state": "Jharkhand", "pincode": "815351"},
    {"name": "Malda", "lat": 25.0108, "lon": 88.1411, "city": "English Bazar", "district": "Malda", "state": "West Bengal", "pincode": "732101"},
    {"name": "Dhanbad", "lat": 23.7957, "lon": 86.4304, "city": "Dhanbad", "district": "Dhanbad", "state": "Jharkhand", "pincode": "826001"},
    {"name": "Deoghar", "lat": 24.4826, "lon": 86.6968, "city": "Deoghar", "district": "Deoghar", "state": "Jharkhand", "pincode": "814112"},
    {"name": "Kashmir_Valley", "lat": 34.0837, "lon": 74.7973, "city": "Srinagar", "district": "Srinagar", "state": "Jammu and Kashmir", "pincode": "190001"},
    {"name": "Gurugram", "lat": 28.4595, "lon": 77.0266, "city": "Gurugram", "district": "Gurugram", "state": "Haryana", "pincode": "122001"},
    {"name": "Kolkata", "lat": 22.5726, "lon": 88.3639, "city": "Kolkata", "district": "Kolkata", "state": "West Bengal", "pincode": "700001"},
    {"name": "Patna", "lat": 25.5941, "lon": 85.1376, "city": "Patna", "district": "Patna", "state": "Bihar", "pincode": "800001"},
    {"name": "Jaipur", "lat": 26.9124, "lon": 75.7873, "city": "Jaipur", "district": "Jaipur", "state": "Rajasthan", "pincode": "302001"},
    {"name": "Delhi", "lat": 28.6139, "lon": 77.2090, "city": "Delhi", "district": "New Delhi", "state": "Delhi", "pincode": "110001"},
    {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777, "city": "Mumbai", "district": "Mumbai City", "state": "Maharashtra", "pincode": "400001"},
    {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946, "city": "Bengaluru", "district": "Bengaluru Urban", "state": "Karnataka", "pincode": "560001"},
    {"name": "Lucknow", "lat": 26.8467, "lon": 80.9462, "city": "Lucknow", "district": "Lucknow", "state": "Uttar Pradesh", "pincode": "226001"},
    {"name": "Bhubaneswar", "lat": 20.2961, "lon": 85.8245, "city": "Bhubaneswar", "district": "Khurda", "state": "Odisha", "pincode": "751001"},
    {"name": "Navi_Mumbai", "lat": 19.0330, "lon": 73.0297, "city": "Navi Mumbai", "district": "Thane", "state": "Maharashtra", "pincode": "400703"}
]

NODE_TYPES = ["ATM", "MICRO_ATM", "AEPS_CSP", "POS", "CDM"]

TRANSACTION_TYPES = ["CREDIT", "DEBIT", "TRANSFER", "REFUND", "CASH_WITHDRAWAL", "CASH_DEPOSIT"]

CHANNELS = ["BANK", "UPI", "IMPS", "NEFT", "RTGS", "AEPS", "ATM", "MICRO_ATM", "POS", "CSP"]

PAYMENT_MODES = ["UPI", "IMPS", "NEFT", "RTGS", "CARD", "AEPS", "CASH", "NET_BANKING"]

COUNTRIES = [
    {"code": "IN", "name": "India", "region": "South Asia", "is_domestic": 1},
    {"code": "AE", "name": "UAE", "region": "Middle East", "is_domestic": 0},
    {"code": "HK", "name": "Hong Kong", "region": "East Asia", "is_domestic": 0},
    {"code": "TH", "name": "Thailand", "region": "Southeast Asia", "is_domestic": 0},
    {"code": "SG", "name": "Singapore", "region": "Southeast Asia", "is_domestic": 0},
    {"code": "RU", "name": "Russia", "region": "Eastern Europe", "is_domestic": 0},
    {"code": "GB", "name": "United Kingdom", "region": "Western Europe", "is_domestic": 0},
    {"code": "US", "name": "United States", "region": "North America", "is_domestic": 0}
]

BANKS = [
    {"id": "BNK001", "name": "State Bank of Synthetic India", "type": "PUBLIC"},
    {"id": "BNK002", "name": "HDFC Synthetic Bank", "type": "PRIVATE"},
    {"id": "BNK003", "name": "ICICI Synthetic Bank", "type": "PRIVATE"},
    {"id": "BNK004", "name": "Axis Synthetic Bank", "type": "PRIVATE"},
    {"id": "BNK005", "name": "Punjab National Synthetic Bank", "type": "PUBLIC"},
    {"id": "BNK006", "name": "Kotak Synthetic Bank", "type": "PRIVATE"},
    {"id": "BNK007", "name": "India Post Synthetic Bank", "type": "PAYMENTS"},
    {"id": "BNK008", "name": "Airtel Synthetic Payments Bank", "type": "PAYMENTS"},
    {"id": "BNK009", "name": "Fino Synthetic Payments Bank", "type": "PAYMENTS"},
    {"id": "BNK010", "name": "Paytm Synthetic Payments Bank", "type": "PAYMENTS"}
]

RISK_BANDS = [
    {"band": "ALLOW", "min_score": 0.0, "max_score": 0.30, "description": "Normal low-risk activity"},
    {"band": "MONITOR", "min_score": 0.30, "max_score": 0.60, "description": "Moderate risk requiring enhanced observation"},
    {"band": "REVIEW", "min_score": 0.60, "max_score": 0.85, "description": "High risk requiring analyst review"},
    {"band": "BLOCK", "min_score": 0.85, "max_score": 1.00, "description": "Critical risk requiring immediate automated hold"}
]

FRAUD_CATEGORIES = [
    "UPI_FRAUD",
    "PHISHING",
    "IMPERSONATION",
    "INVESTMENT_SCAM",
    "JOB_SCAM",
    "ROMANCE_SCAM",
    "DIGITAL_ARREST_SCAM",
    "CARD_FRAUD",
    "ACCOUNT_TAKEOVER",
    "OTHER"
]

SYNDICATE_PATTERNS = [
    "TERMINAL_CASHOUT_COLLECTOR",
    "RAPID_LAYERING_RING",
    "HIGH_FANOUT_MULE_PATTERN",
    "GURUGRAM_CORRIDOR_PATTERN",
    "RAPID_PASS_THROUGH",
    "COLLECTOR_FUNNEL",
    "MULTI_HOP_LAYERING"
]

CORRIDORS = [
    {"id": "CORR_001", "name": "NCR Cash-Out Highway", "hub_name": "Delhi-Gurugram Corridor", "city": "Gurugram", "state": "Haryana", "lat": 28.4595, "lon": 77.0266, "radius_km": 45.0, "description": "High velocity cashout hub between Delhi NCR and Mewat region"},
    {"id": "CORR_002", "name": "Eastern Layering Belt", "hub_name": "Jamtara-Dhanbad Corridor", "city": "Jamtara", "state": "Jharkhand", "lat": 23.9620, "lon": 86.8000, "radius_km": 60.0, "description": "Multi-hop layering corridor connecting Jamtara, Deoghar and Dhanbad"},
    {"id": "CORR_003", "name": "Border Gateway Corridor", "hub_name": "Malda International Transit", "city": "English Bazar", "state": "West Bengal", "lat": 25.0108, "lon": 88.1411, "radius_km": 35.0, "description": "Cross-border rapid transfer and CSP cashout hub"},
    {"id": "CORR_004", "name": "Western Metro Cash-Out Ring", "hub_name": "Mumbai-Navi Mumbai Hub", "city": "Navi Mumbai", "state": "Maharashtra", "lat": 19.0330, "lon": 73.0297, "radius_km": 50.0, "description": "Metro POS and ATM high-volume extraction corridor"},
    {"id": "CORR_005", "name": "Mewat Triangle Transit", "hub_name": "Nuh-Alwar-Bharatpur Hub", "city": "Nuh", "state": "Haryana", "lat": 28.1023, "lon": 77.0018, "radius_km": 75.0, "description": "Interstate Micro-ATM and AEPS distribution cluster"}
]

SYNTHETIC_PROFILE_TYPES = [
    "NORMAL",
    "NEW_CUSTOMER",
    "HIGH_ACTIVITY",
    "POTENTIAL_MULE",
    "MULE_LIKE",
    "BUSINESS",
    "STUDENT",
    "RETAIL",
    "MICRO_BUSINESS"
]
