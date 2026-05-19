import logging

logger = logging.getLogger("safetread")

def get_tyre_decision(wear_level: float):
    """
    Converts a wear_level (0-100) into a consistent set of health metrics.
    
    Mapping:
    0–30: Healthy (Risk: Low, Recommendation: Good Condition)
    30–60: Moderate Wear (Risk: Medium, Recommendation: Monitor Regularly)
    60–80: Worn (Risk: High, Recommendation: Plan Replacement)
    80–100: Critical (Risk: Very High, Recommendation: Replace Immediately)
    """
    # Ensure wear_level is within 0-100
    wear_level = max(0.0, min(100.0, float(wear_level)))
    remaining_life = max(0.0, round(100.0 - wear_level, 2))
    
    if wear_level < 30:
        status = "Healthy"
        risk_level = "Low"
        recommendation = "Tyre is in good condition. Safe for now."
    elif wear_level < 60:
        status = "Moderate Wear"
        risk_level = "Medium"
        recommendation = "Tread is starting to wear. Monitor regularly."
    elif wear_level < 80:
        status = "Worn"
        risk_level = "High"
        recommendation = "Tyre is significantly worn. Plan for replacement soon."
    else:
        status = "Critical"
        risk_level = "Very High"
        recommendation = "Dangerous tread depth. Replace tyre immediately for safety."

    decision = {
        "status": status,
        "wear_level": round(wear_level, 2),
        "remaining_life": remaining_life,
        "risk_level": risk_level,
        "recommendation": recommendation
    }
    
    logger.info("Decision Mapping: wear_level=%.2f -> status=%s", wear_level, status)
    return decision
