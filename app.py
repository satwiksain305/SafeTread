import json
import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import datetime
import bcrypt
import jwt
from dotenv import load_dotenv
from PIL import Image
import io
import random

USE_REAL_MODEL = False
model = None
print("⚠ Using mock predictions (TensorFlow model conversion pending)")

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://safetread_user:Safetread123@safetread.io1oksf.mongodb.net/?appName=SafeTread")
MONGODB_DB = os.getenv("MONGODB_DB", "SafeTreadDB")

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print(f"✓ MongoDB Connected: {MONGODB_DB}")
except Exception as e:
    print(f"✗ MongoDB Connection Failed: {e}")
    try:
        client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=3000)
        print("⚠ Using local MongoDB fallback")
    except:
        print("✗ No database connection available")

db = client[MONGODB_DB]
users_collection = db["users"]

JWT_SECRET = os.getenv("JWT_SECRET", "your_super_secret_key")
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 3600

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
        return jsonify({"message": "Invalid email or password"}), 401

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
def get_users():
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
    """Analyze tire image and return wear analysis with mock/real predictions"""
    user_email = "guest"
    token = request.headers.get("Authorization")
    if token and token.startswith("Bearer "):
        try:
            payload = jwt.decode(token.split(" ")[1], JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_email = payload.get("email", "guest")
        except Exception:
            pass

    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    try:
        # Read and preprocess image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize((224, 224))
        
        if USE_REAL_MODEL:
            # Real ML prediction
            img_array = np.array(image) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            prediction = model.predict(img_array, verbose=0)
            
            # Model outputs [healthy_prob, critical_prob]
            healthy_prob = float(prediction[0][0])
            critical_prob = float(prediction[0][1])
            
            # Determine status based on probabilities
            if critical_prob > 0.75:
                status = "Critical"
                recommendation = "Immediate replacement required. Tyre safety is compromised."
                wear_percentage = int(critical_prob * 100)
            elif critical_prob > 0.50:
                status = "Warning"
                recommendation = "Schedule replacement soon. Tread depth is below optimal level."
                wear_percentage = int(critical_prob * 100)
            else:
                status = "Healthy"
                recommendation = "Tyre is in excellent condition. Continue regular monitoring."
                wear_percentage = int(critical_prob * 100)
            
            confidence = max(healthy_prob, critical_prob) * 100
            
        else:
            # Mock prediction (fallback)
            wear_percentage = random.randint(10, 90)
            if wear_percentage >= 75:
                status = "Critical"
                recommendation = "Immediate replacement required."
            elif wear_percentage >= 50:
                status = "Warning"
                recommendation = "Schedule replacement soon."
            else:
                status = "Healthy"
                recommendation = "Tyre is in excellent condition."
            confidence = random.uniform(75, 95)
        
        # Save prediction to database
        prediction_record = {
            "user_email": user_email,
            "wear_percentage": wear_percentage,
            "status": status,
            "recommendation": recommendation,
            "confidence": round(confidence, 2),
            "analyzed_at": datetime.datetime.utcnow(),
            "model_used": "CNN (TensorFlow)" if USE_REAL_MODEL else "Mock"
        }
        db.tire_predictions.insert_one(prediction_record)
        
        return jsonify({
            "message": "Analysis completed successfully",
            "wear_percentage": wear_percentage,
            "status": status,
            "recommendation": recommendation,
            "confidence": round(confidence, 2),
            "model_type": "Real ML Model" if USE_REAL_MODEL else "Mock Predictions",
            "is_mock_prediction": not USE_REAL_MODEL
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

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
