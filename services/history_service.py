import datetime


def save_prediction_history(db, data):
    collection = db["prediction_history"]
    document = {
        "user_email": data.get("user_email"),
        "image_path": data.get("image_path"),
        "heatmap_path": data.get("heatmap_path"),
        "pdf_path": data.get("pdf_path"),
        "prediction": data.get("prediction"),
        "wear_level": data.get("wear_level"),
        "remaining_life": data.get("remaining_life"),
        "risk_level": data.get("risk_level"),
        "confidence": data.get("confidence"),
        "health_score": data.get("health_score"),
        "recommendation": data.get("recommendation"),
        "created_at": data.get("created_at") or datetime.datetime.utcnow(),
    }
    result = collection.insert_one(document)
    document["_id"] = result.inserted_id
    return document


def get_user_prediction_history(db, user_email):
    collection = db["prediction_history"]
    cursor = collection.find({"user_email": user_email}).sort("created_at", -1)

    history = []
    for item in cursor:
        created_at = item.get("created_at")
        history.append(
            {
                "id": str(item.get("_id")),
                # Return both a formatted date AND the full ISO timestamp
                "date": created_at.strftime("%Y-%m-%d") if created_at else "",
                "created_at": created_at.isoformat() + "Z" if created_at else "",
                "prediction": item.get("prediction", ""),
                "status": item.get("prediction", item.get("status", "")),
                "wear_level": item.get("wear_level"),
                "confidence": item.get("confidence", 0),
                "health_score": item.get("health_score", 0),
                "recommendation": item.get("recommendation", ""),
                "risk_level": item.get("risk_level", ""),
                "image_path": item.get("image_path", ""),
                "heatmap_path": item.get("heatmap_path", ""),
                "pdf_path": item.get("pdf_path", ""),
            }
        )
    return history
