# SafeTread 🛞
**AI-powered tire tread wear detection system**

SafeTread analyzes tire images using computer vision and deep learning to determine whether a tire is healthy or worn, helping you make proactive maintenance decisions.

---

## 🎯 Project Overview
SafeTread provides a robust end-to-end pipeline:
1. **User Uploads Image**: Drag-and-drop an image of a tire.
2. **Analysis Pipeline**: The backend runs the image through an AI detection and classification pipeline.
3. **Report Generation**: Visual GradCAM heatmaps and detailed PDF reports are generated.
4. **History Tracking**: All predictions are securely saved in a cloud MongoDB database.

### Architecture Diagram
```mermaid
graph TD;
    Client[React Frontend] -->|Upload Image| API[FastAPI Backend];
    API --> YOLO[YOLOv8 Tire Detection];
    YOLO -->|Confidence ≥ 0.5| Crop[Bounding Box Crop];
    YOLO -.->|No Detection| Heuristic[Heuristic Fallback];
    Crop --> CNN[CNN ResNet Wear Classifier];
    Heuristic --> CNN;
    CNN -->|Healthy/Worn, Health Score| Response[Prediction Response];
    Response --> Heatmap[Generate GradCAM Heatmap];
    Response --> PDF[Generate PDF & Email Report];
    Response --> DB[(MongoDB Atlas History)];
    Response --> Client;
```

---

## 🚀 Detection Pipeline Flow

1. **Image Upload & Validation:** Accepts base64 or file uploads, rejects non-image formats.
2. **YOLO Tire Detection:** Queries the custom YOLO model (`models/tire_detector.pt`) to locate the tire with >50% confidence, ensuring realistic minimum sizes and aspect ratios.
3. **Fallback Heuristic:** If YOLO fails, uses classic object detection/heuristics to attempt a crop.
4. **CNN Classifier:** The cropped tire is passed into a trained model to determine wear percentage.
5. **Output Generation:** Structured JSON containing confidence scores, health grades, and heatmaps.

---

## 🛠 Tech Stack
- **Backend**: FastAPI, Python, PyTorch, Ultralytics YOLOv8, JWT Auth
- **Frontend**: React, React Router, Tailwind CSS, Axios
- **Database**: MongoDB Atlas (Cloud)
- **Email/Reports**: FPDF, smtplib

---

## ⚙️ Installation Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- Active MongoDB Atlas Cluster
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/SafeTread.git
cd SafeTread
```

### 2. Backend Setup
Navigate to the root project folder:
```bash
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the backend server (runs on port 5000)
python app.py
```

### 3. Frontend Setup
Open a second terminal window and navigate to `frontend/`:
```bash
cd frontend

# Install Node modules
npm install

# Start the development server (runs on port 3000)
npm start
```

---

## 🔑 Environment Variables
Create a `.env` file in the project **root** directory and populate it with your credentials:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/SafeTreadDB

# JWT Configuration
JWT_SECRET=your_super_secret_key
JWT_EXPIRATION=3600

# Backend Flask/FastAPI
FLASK_ENV=development

# Email Configuration (for user reports)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_APP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com
```
*Note: `.env` is ignored by Git to protect your secrets.*

---

## 📦 Model Storage Strategy
The machine learning models used by this project (`.pt`, `.h5`, `.pth`) are **too large** to be pushed directly to GitHub. 
Therefore, they are excluded via `.gitignore`. 

**To set up the models for your local environment, choose one of the following methods:**

### Option 1: GitHub Release Assets (Recommended)
You can upload the trained `tire_detector.pt` and CNN models to the "Releases" page of your GitHub repository. Other developers can download them and place them manually into `ml/models/`.

### Option 2: Cloud Storage
Host the models in an AWS S3 Bucket, Google Drive, or Google Cloud Storage. Create a simple python script `download_models.py` in the repo to automatically fetch the latest weights on `npm install`.

**Current YOLO Path expectation:** `ml/models/tire_detector.pt` (Fallback: `yolov8n.pt`)

---

## 📡 API Endpoints

### `GET /health`
Checks if the backend and database connection is active.
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### `POST /api/predict-demo`
Allows guest users to upload an image and receive a fast prediction. Tracked by IP address to limit free usage.
**Body:** `multipart/form-data` with `image` file.
**Response:**
```json
{
  "status": "success",
  "message": "Prediction completed",
  "tire_detected": true,
  "prediction": "Healthy",
  "confidence_score": 94.5,
  "health_score": 88,
  "recommendation": "Tread looks good, continue monitoring.",
  "heatmap_url": "/outputs/heatmap_1a2b3c.jpg",
  "remaining_free_trials": 1
}
```

### `POST /api/predict-user`
For authenticated users. Generates heatmaps, saves complete prediction history to MongoDB, and emails a PDF report.
**Headers:** `Authorization: Bearer <token>`
**Body:** `multipart/form-data` with `image` file.
**Response:**
```json
{
  "status": "success",
  "prediction_result": "Worn",
  "confidence_score": 91.2,
  "heatmap_url": "/outputs/heatmap_xyz123.jpg",
  "email_queued": true
}
```

### `GET /api/prediction-history`
Fetches all past tire analyses for the currently logged-in user.
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "status": "success",
  "history": [
    {
      "prediction": "Healthy",
      "confidence": 0.94,
      "health_score": 88,
      "created_at": "2026-03-08T10:15:30Z"
    }
  ]
}
```

---
*Created for the SafeTread AI detection project.*
