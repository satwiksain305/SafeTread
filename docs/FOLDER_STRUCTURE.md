# Project Folder Structure

A clean, modular folder structure is critical for maintainability. The SafeTread project separates the backend logic, frontend assets, machine learning models, and documentation into distinct boundaries.

## Root Directory

```text
SafeTread/
├── app.py                  # Main Flask backend application entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (ignored by git)
├── .gitignore              # Files and folders ignored by git
├── README.md               # Main project overview
├── yolov8n.pt              # Fallback YOLOv8 base model weight
├── docs/                   # Project documentation
├── frontend/               # React frontend application
├── backend/                # Core ML pipeline logic
├── routes/                 # API routing endpoints
├── services/               # Business logic and external integrations
├── utils/                  # Helper utilities and standalone validators
├── ml/                     # Machine learning models and offline training scripts
├── logs/                   # Runtime backend logs
├── uploads/                # Temporarily stored user image uploads
└── outputs/                # Generated GradCAM heatmaps
```

---

## Backend Subdirectories

### `/backend`
Contains the core Machine Learning execution pipeline.
- `inference_pipeline.py`: Orchestrates the flow from detection -> crop -> classification.
- `tyre_detector.py`: YOLOv8 detection logic and fallback heuristics.
- `wear_classifier.py`: Wraps the ResNet classification models.
- `decision_logic.py`: Single source of truth mapping wear percentages to status labels ("Healthy", "Warning", "Critical").

### `/routes`
Contains Flask Blueprints to keep `app.py` clean.
- `prediction_routes.py`: Defines the `/api/predict-demo`, `/api/predict-user`, and `/api/prediction-history` endpoints.

### `/services`
Isolated business logic, making it easier to test and modify without impacting the core pipeline.
- `email_service.py`: SMTP email dispatch.
- `pdf_service.py`: Generates the PDF report using FPDF.
- `gemini_service.py`: Connects to Google GenAI for personalized insights.
- `history_service.py`: MongoDB interactions for tracking user history.
- `trial_service.py`: Manages guest-IP rate limits.
- `validation_service.py`: Ensures uploaded files are valid images.

### `/utils`
- `local_validator.py`: A MobileNetV2-based "gatekeeper" that prevents non-tire images from entering the heavy ML pipeline.

### `/ml`
- `models/`: Stores the `.keras`, `.h5`, and `.pt` weight files (ignored by git due to size).
- `scripts/`: Offline training and evaluation scripts (not used at runtime).

---

## Frontend Subdirectories

Located inside `frontend/src/`:

```text
src/
├── App.js                  # Main React component and Router configuration
├── index.js                # React DOM entry point
├── index.css               # Global Tailwind CSS imports
├── api/
│   └── axios.js            # Configured Axios instance for backend communication
├── components/             # Reusable UI components (Buttons, Cards, Badges, Navbar)
├── config/                 # Shared configuration (e.g., Theme colors)
├── context/                # React Context providers
│   └── AuthContext.js      # Global authentication state
└── pages/                  # Top-level page views (Landing, Dashboard, Upload, etc.)
```
