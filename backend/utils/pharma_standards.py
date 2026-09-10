"""
Pharmaceutical Regulatory & Technical Quality Standards Module
References:
- US FDA 21 CFR 211.198 (Complaint Files) & 21 CFR Part 11 (Electronic Records)
- ICH Q9 (Quality Risk Management)
- ICH Q3C(R8) (Impurities: Guideline for Residual Solvents)
- GAMP 5 & ALCOA+ Principles (Attributable, Legible, Contemporaneous, Original, Accurate)
"""

import re
from datetime import datetime
from typing import Dict, Any, Tuple

# ICH Q3C Class 1, 2, and 3 Residual Solvents Thresholds in Active Pharmaceutical Ingredients (API)
ICH_Q3C_SOLVENT_LIMITS_PPM = {
    # Class 1: Solvents to be avoided (known carcinogens/toxicants)
    "benzene": 2.0,
    "carbon tetrachloride": 4.0,
    "1,2-dichloroethane": 5.0,
    # Class 2: Solvents to be limited (nongenotoxic animal carcinogens / irreversible toxicity)
    "methanol": 3000.0,
    "acetonitrile": 410.0,
    "toluene": 890.0,
    "dichloromethane": 600.0,
    "n-hexane": 290.0,
    "tetrahydrofuran": 720.0,
    # Class 3: Solvents with low toxic potential
    "acetone": 5000.0,
    "ethanol": 5000.0,
    "ethyl acetate": 5000.0,
    "isopropanol": 5000.0
}


def validate_batch_traceability(batch_number: str) -> Dict[str, Any]:
    """
    Validates batch number conformance against common pharmaceutical manufacturing
    traceability schemes (e.g. B24019, LOT-X912, ATV-2024-001, BN-98421).
    """
    if not batch_number or batch_number.strip() in ["", "Awaiting AI extraction..."]:
        return {
            "valid": False,
            "reason": "Missing Batch/Lot Number. Mandatory under 21 CFR 211.198(e)(2)."
        }

    clean_batch = batch_number.strip()
    is_standard = bool(re.match(r'^(B\d{4,8}|LOT-[A-Z0-9\-]+|BN-[A-Z0-9\-]+|[A-Z]{2,5}-\d{4}-\d{3,5}|\d{6,10})$', clean_batch, re.IGNORECASE))

    return {
        "valid": True,
        "clean_batch": clean_batch,
        "is_standard_gmp_pattern": is_standard,
        "traceability_status": "Traceable to Batch Manufacturing Record (BMR)" if is_standard else "Custom Lot Format - Requires Verification"
    }


def evaluate_shelf_life_status(mfg_date_str: str, exp_date_str: str, complaint_date_str: str = None) -> Dict[str, Any]:
    """
    Evaluates whether the complaint occurred within the validated shelf life.
    Differentiates between in-stability failure and post-expiry misuse.
    """
    date_formats = ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"]
    
    def parse_d(val):
        if not val or not isinstance(val, str):
            return None
        for fmt in date_formats:
            try:
                return datetime.strptime(val.strip(), fmt)
            except ValueError:
                continue
        return None

    mfg = parse_d(mfg_date_str)
    exp = parse_d(exp_date_str)
    comp = parse_d(complaint_date_str) or datetime.utcnow()

    if not exp:
        return {
            "shelf_life_valid": True,
            "status": "Unknown Expiry - Review Product Dossier",
            "is_expired": False
        }

    if comp > exp:
        days_expired = (comp - exp).days
        return {
            "shelf_life_valid": False,
            "status": f"Expired Product ({days_expired} days post-expiry)",
            "is_expired": True,
            "regulatory_note": "Complaint filed on expired unit. Assess storage conditions & patient alert."
        }

    remaining_days = (exp - comp).days
    return {
        "shelf_life_valid": True,
        "status": f"Within Validated Shelf-Life ({remaining_days} days remaining)",
        "is_expired": False,
        "regulatory_note": "Defect occurred within licensed shelf-life. Investigation of stability retain samples mandatory."
    }

