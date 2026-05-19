# SafeTread 🛞

**AI-powered tire tread wear detection system**

SafeTread analyzes tire images using computer vision and deep learning to determine whether a tire is healthy or worn, helping you make proactive maintenance decisions to ensure vehicle safety.

---

## 🎯 Project Overview

SafeTread provides a robust, end-to-end pipeline for tire condition assessment:
1. **User Uploads Image**: Users can drag-and-drop an image of a tire via the React frontend.
2. **Analysis Pipeline**: The Flask backend processes the image through an AI detection (YOLOv8) and classification (ResNet50) pipeline.
3. **Report Generation**: Visual GradCAM heatmaps and detailed PDF reports are automatically generated.
4. **History Tracking**: All predictions and user data are securely saved in a MongoDB Atlas database.

### Core Technologies
- **Backend**: Python, Flask, PyTorch, Ultralytics YOLOv8, TensorFlow/Keras, JWT Auth
- **Frontend**: React, React Router, Tailwind CSS, Axios
- **Database**: MongoDB Atlas (Cloud)
- **Email/Reports**: FPDF, smtplib, Google GenAI (Gemini)

---

## 📚 Documentation Directory

We have organized all documentation into the `docs/` folder for easy onboarding and reference. Please refer to the following guides:

- **[Setup Guide](docs/SETUP_GUIDE.md)**: Step-by-step instructions for local installation.
- **[Environment Configuration](docs/ENV_CONFIG.md)**: Required environment variables and secrets.
- **[Folder Structure](docs/FOLDER_STRUCTURE.md)**: A complete map of the project repository.
- **[Architecture & Data Flow](docs/ARCHITECTURE.md)**: Detailed breakdown of the system design, auth flow, and frontend-backend communication.
- **[API Overview](docs/API_OVERVIEW.md)**: Documentation of all available REST endpoints.
- **[Feature Overview](docs/FEATURE_OVERVIEW.md)**: Core features and capabilities of the platform.
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**: Instructions for preparing and deploying the application.
- **[Future Improvements](docs/FUTURE_IMPROVEMENTS.md)**: A roadmap of optional future enhancements.

---

## 🚀 Quick Start

If you already have your environment variables configured, you can start the project locally:

### 1. Start the Backend
```bash
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
# source .venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run the Flask API
python app.py
```

### 2. Start the Frontend
```bash
cd frontend

# Install Node modules
npm install

# Start the React development server
npm start
```

---

## 📦 Model Storage Strategy

Due to file size constraints, large ML models (`.keras`, `.pt`) are excluded from version control via `.gitignore`. 

**Current Model Paths:**
- Wear Classifier: `ml/models/best_model_FINAL_95PERCENT.keras`
- YOLO Detector: `ml/models/tyre_detector.pt` (Fallback: `yolov8n.pt` in root)

To run the pipeline locally, ensure the appropriate model weights are placed inside the `ml/models/` directory.

---
*Created for the SafeTread AI detection project.*
