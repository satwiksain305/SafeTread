import os
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import datetime
import bcrypt
import jwt
from dotenv import load_dotenv
from routes.prediction_routes import create_prediction_blueprint

# ===== Register GetItem custom layer BEFORE importing any models =====
try:
    import tensorflow as tf
    
    # Enable unsafe deserialization for Lambda layers (safe for our own trained models)
    tf.keras.config.enable_unsafe_deserialization()
    
    class GetItem(tf.keras.layers.Layer):
        """Custom layer to handle indexing operations during model deserialization"""
        def __init__(self, index=None, **kwargs):
            super().__init__(**kwargs)
            self.index = index
        
        def call(self, inputs):
            if self.index is not None:
                return inputs[self.index]
            return inputs
        
        def get_config(self):
            config = super().get_config()
            config.update({'index': self.index})
            return config
    
    # Register custom object globally
    tf.keras.utils.get_custom_objects()['GetItem'] = GetItem
    print("[OK] Registered GetItem custom layer")
    print("[OK] Enabled Lambda layer deserialization")
except ImportError:
    print("[WARN] TensorFlow not available")

# Load TensorFlow model
USE_REAL_MODEL = False
USE_MOBILENETV2 = False
model = None

try:
    import tensorflow as tf
    MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml", "models")
    model_candidates = [
        os.path.join(MODEL_DIR, "best_model_FINAL_95PERCENT.keras"),  # NEW: 95% accuracy model
        os.path.join(MODEL_DIR, "best_model_REAL_95PERCENT.keras"),   # Backup
        os.path.join(MODEL_DIR, "best_model_finetuned.h5"),
        os.path.join(MODEL_DIR, "best_mobilenetv2.h5"),
        os.path.join(MODEL_DIR, "best_model.h5"),
    ]

    MODEL_PATH = next((p for p in model_candidates if os.path.exists(p)), None)
    if MODEL_PATH:
        try:
            # Load the model (no special handling needed for .keras format)
            model = tf.keras.models.load_model(MODEL_PATH, compile=False, safe_mode=False)
            USE_REAL_MODEL = True
            USE_MOBILENETV2 = os.path.basename(MODEL_PATH) == "best_mobilenetv2.h5"
            print(f"[OK] TensorFlow Model Loaded: {MODEL_PATH}")
            print(f"  Model type: {type(model).__name__}")
            print(f"  Input shape: {model.input_shape}")
            print(f"  Output shape: {model.output_shape}")
        except Exception as e:
            print(f"[WARN] Failed to load TensorFlow model: {e}")
            print("[WARN] Using mock predictions")
    else:
        print("[WARN] No model file found in ml/models")
except Exception as e:
    print(f"[WARN] TensorFlow error: {e}")
    print("[WARN] Using mock predictions")

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_PATH = os.path.join(LOG_DIR, "safetread.log")

logger = logging.getLogger("safetread")
if not logger.handlers:
    logger.setLevel(logging.INFO)
    formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")

    file_handler = logging.FileHandler(LOG_PATH, encoding="utf-8")
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://safetread_user:Safetread123@safetread.io1oksf.mongodb.net/?appName=SafeTread")
MONGODB_DB = os.getenv("MONGODB_DB", "SafeTreadDB")

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print(f"[OK] MongoDB Connected: {MONGODB_DB}")
except Exception as e:
    print(f"[ERROR] MongoDB Connection Failed: {e}")
    try:
        client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=3000)
        print("[WARN] Using local MongoDB fallback")
    except:
        print("[ERROR] No database connection available")

db = client[MONGODB_DB]
users_collection = db["users"]

JWT_SECRET = os.getenv("JWT_SECRET", "your_super_secret_key")
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 86400 # 24 hours

prediction_bp = create_prediction_blueprint(
    db=db,
    model=model,
    use_real_model=USE_REAL_MODEL,
    use_mobilenetv2=USE_MOBILENETV2,
    jwt_secret=JWT_SECRET,
    jwt_algorithm=JWT_ALGORITHM,
)
app.register_blueprint(prediction_bp)

def serialize_doc(doc):
    """Convert MongoDB ObjectId to string and format dates"""
    doc["_id"] = str(doc["_id"])
    if "created_at" in doc and doc["created_at"]:
        doc["created_at"] = doc["created_at"].isoformat()
    if "password" in doc:
        del doc["password"]
    return doc

def token_required(f):
    """Decorator to protect routes with JWT"""
    from functools import wraps
    def decorator(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        try:
            token = token.split(" ")[1]  # Expect "Bearer <token>"
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_email = payload["email"]
            user = db.users.find_one({"email": user_email})
            if not user:
                return jsonify({"message": "User not found"}), 404
            request.user = user
        except Exception as e:
            return jsonify({"message": "Invalid token", "error": str(e)}), 401
        return f(*args, **kwargs)
    return wraps(f)(decorator)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to SafeTread API 🚗", "status": "running"}), 200


@app.route("/outputs/<path:filename>", methods=["GET"])
def serve_outputs(filename):
    outputs_dir = os.path.join(os.path.dirname(__file__), "outputs")
    return send_from_directory(outputs_dir, filename)

@app.route("/health", methods=["GET"])
def health():
    try:
        client.admin.command('ping')
        db_status = "connected"
    except:
        db_status = "disconnected"
    
    return jsonify({
        "status": "ok",
        "database": db_status,
        "collections": db.list_collection_names() if db_status == "connected" else []
    }), 200

@app.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    if db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 409

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    user = {
        "name": data.get("name"),
        "email": email,
        "password": hashed_pw,
        "created_at": datetime.datetime.utcnow(),
    }
    db.users.insert_one(user)
    return jsonify({"message": "✅ User registered successfully!"}), 201

@app.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = db.users.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found. Please register first."}), 404

    stored_password = user["password"]
    if isinstance(stored_password, str):
        stored_password = stored_password.encode("utf-8")

    if bcrypt.checkpw(password.encode("utf-8"), stored_password):
        payload = {
            "email": user["email"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXP_DELTA_SECONDS)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return jsonify({
            "message": "✅ Login successful",
            "token": token,
            "user": serialize_doc(user)
        }), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401

@app.route("/profile", methods=["GET"])
@token_required
def get_profile():
    user = request.user
    return jsonify({"message": "Profile fetched successfully", "user": serialize_doc(user)}), 200

@app.route("/users", methods=["GET"])
@token_required
def get_users():
    """List registered users — requires a valid JWT token."""
    users = users_collection.find({})
    users_list = []
    for user in users:
        user_data = {
            "id": str(user.get("_id", "")),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "created_at": user.get("created_at").isoformat() if user.get("created_at") else None
        }
        users_list.append(user_data)
    return jsonify(users_list)

@app.route("/upload", methods=["POST"])
@token_required
def upload_tire_data():
    data = request.get_json()
    tire_info = {
        "user_email": request.user["email"],
        "tire_condition": data.get("condition"),
        "image_url": data.get("image_url", "N/A"),
        "uploaded_at": datetime.datetime.utcnow(),
    }
    db.tire_data.insert_one(tire_info)
    return jsonify({"message": "✅ Tire data saved successfully!"}), 201

@app.route("/analyze-tire", methods=["POST"])
def analyze_tire():
    """
    DEPRECATED: This endpoint has been removed.
    Use POST /api/predict-demo (guest) or POST /api/predict-user (authenticated)
    which include full tyre detection, explainability, PDF reports and email.
    """
    return jsonify({
        "error": "This endpoint is deprecated and no longer available.",
        "message": "Please use /api/predict-user (authenticated) or /api/predict-demo (guest trial)."
    }), 410

@app.route("/tire-history", methods=["GET"])
@token_required
def get_tire_history():
    """Retrieve user's prediction history from database"""
    user_email = request.user["email"]
    predictions = list(db.tire_predictions.find({"user_email": user_email}).sort("analyzed_at", -1).limit(50))
    return jsonify([serialize_doc(p) for p in predictions]), 200

@app.route("/data", methods=["GET"])
@token_required
def get_all_tire_data():
    user_email = request.user["email"]
    tire_data = list(db.tire_data.find({"user_email": user_email}))
    return jsonify([serialize_doc(d) for d in tire_data]), 200

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=False)
