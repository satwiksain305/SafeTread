import datetime
from pymongo import ReturnDocument


TRIAL_LIMIT = 2


def get_client_ip(flask_request):
    forwarded_for = flask_request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return flask_request.remote_addr or "unknown"


def get_trial_status(db, client_ip):
    trials_collection = db["guest_trials"]
    record = trials_collection.find_one({"_id": client_ip})
    current_count = int(record.get("count", 0)) if record else 0
    remaining = max(0, TRIAL_LIMIT - current_count)
    return {
        "count": current_count,
        "remaining": remaining,
        "allowed": current_count < TRIAL_LIMIT,
    }


def increment_trial_count(db, client_ip):
    trials_collection = db["guest_trials"]
    updated = trials_collection.find_one_and_update(
        {"_id": client_ip},
        {
            "$inc": {"count": 1},
            "$set": {"updated_at": datetime.datetime.utcnow()},
            "$setOnInsert": {"created_at": datetime.datetime.utcnow()},
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(updated.get("count", 0))
