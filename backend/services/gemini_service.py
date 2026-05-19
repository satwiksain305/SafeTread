import os
import logging

logger = logging.getLogger("safetread")

_client = None


def _get_client():
    global _client
    if _client is None:
        from google import genai
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        _client = genai.Client(api_key=api_key)
    return _client


def generate_tire_insight(
    wear_level: float,
    status: str,
    risk_level: str,
    remaining_life: float,
    confidence: float,
) -> str:
    """
    Use Gemini to generate a personalised AI safety insight for the tyre result.
    Returns an empty string if the API call fails, so it is always non-blocking.
    """
    try:
        client = _get_client()

        prompt = (
            "You are a tyre safety expert. Based on the tyre analysis below, "
            "write 2-3 concise, practical sentences of safety advice for the vehicle owner. "
            "Be direct, friendly, and non-technical.\n\n"
            f"Tyre Analysis:\n"
            f"- Condition: {status}\n"
            f"- Wear Level: {wear_level:.1f}%\n"
            f"- Remaining Tread Life: {remaining_life:.1f}%\n"
            f"- Risk Level: {risk_level}\n"
            f"- Detection Confidence: {confidence * 100:.1f}%"
        )

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return response.text.strip()

    except Exception as exc:
        logger.warning("Gemini AI insight generation failed: %s", str(exc))
        return ""
