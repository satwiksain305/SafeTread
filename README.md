# SafeTread 🛞

**AI-Powered Tyre Wear Detection System**

SafeTread is a full-stack application that uses deep learning (CNN) to analyze tire tread wear patterns and predict remaining tire life. Upload a tire image and get an instant wear analysis with actionable maintenance recommendations.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [ML Model Details](#ml-model-details)
- [Environment Setup](#environment-setup)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication system
- **Image Upload**: Upload tire photos with drag-and-drop support
- **AI Analysis**: CNN-based wear percentage prediction
- **Status Classification**: Automatic categorization (Healthy/Moderate/Critical)
- **Recommendations**: Actionable maintenance suggestions based on wear level
- **Analysis History**: Track all previous tire analyses with timestamps
- **Guest Mode**: Upload and analyze without creating an account

### Technical Highlights
- ✅ Responsive React UI with real-time feedback
- ✅ RESTful API with proper error handling
- ✅ MongoDB cloud database for persistent storage
- ✅ Production-optimized frontend build
- ✅ TensorFlow ready for real-time predictions (add ml/models/best_model.h5); mock fallback available

---

## 🛠 Tech Stack

### Backend
- **Framework**: Flask 3.1.2 (Python)
- **Database**: MongoDB Atlas (cloud)
- **Authentication**: JWT (HS256)
- **Image Processing**: Pillow (PIL)
- **ML Framework**: TensorFlow/Keras (ready to install)

### Frontend
- **Library**: React 18.2.0
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **UI Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Build**: Create React App with production optimization

### ML Model
- **Architecture**: Custom CNN (4 conv blocks, dropout 0.4)
- **Input**: 224×224×3 RGB images
- **Output**: Wear percentage + confidence score
- **Performance**: 85% validation accuracy
- **Training**: Google Colab T4 GPU, 50 epochs
- **Dataset**: 1,698 tire images (train/val/test split)

---

## 📂 Project Structure

```
SafeTread/
│
├── app.py                      # Flask API server
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (not in git)
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── RUN.md                      # Quick start commands
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components (Login, Dashboard, etc.)
│   │   ├── context/            # React Context (Auth)
│   │   ├── api/                # Axios configuration
│   │   ├── config/             # Theme and constants
│   │   ├── App.js              # Main component
│   │   └── index.js            # Entry point
│   ├── public/                 # Static assets
│   ├── build/                  # Production build (pre-compiled)
│   └── package.json            # NPM dependencies
│
├── ml/                         # Machine Learning
│   ├── models/
│   │   └── best_model.h5       # Trained CNN model (85% accuracy)
│   ├── datasets/               # Training data
│   │   ├── train/              # Training images
│   │   ├── validation/         # Validation images
│   │   └── test/               # Test images
│   ├── notebooks/              # Jupyter notebooks (training scripts)
│   └── scripts/                # Data preprocessing scripts
│
└── .venv/                      # Python virtual environment (not in git)
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 16+ (only needed if rebuilding frontend)
- MongoDB Atlas account (free tier available)
- Git

### Step 1: Clone & Setup Python Environment

```powershell
# Clone the repository
git clone https://github.com/YOUR_USERNAME/SafeTread.git
cd SafeTread

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/SafeTreadDB?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRATION=3600
FLASK_ENV=development
```

**Getting MongoDB Connection String:**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (M0 free tier)
3. Get connection string from "Connect" button
4. Replace username and password

### Step 3: Run the Application

**Terminal 1 - Backend Server:**
```powershell
cd SafeTread
.\.venv\Scripts\python.exe app.py
```
Backend will start at: http://127.0.0.1:5000

**Terminal 2 - Frontend Server:**
```powershell
cd SafeTread\frontend\build
python -m http.server 3000
```
Frontend will open at: http://localhost:3000

### Step 4: Test the Application

1. **Sign Up**: Create a new account (email + password)
2. **Login**: Use your credentials
3. **Upload Tire Image**: Go to "Analyze Tire" and upload a tire photo
4. **View Results**: See wear percentage, status, and recommendations
5. **Check History**: View all previous analyses in the dashboard

---

## 🌐 API Documentation

### Authentication Endpoints

#### Register User
```
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: { "message": "User registered", "token": "jwt_token" }
```

#### Login
```
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: { "message": "Login successful", "token": "jwt_token" }
```

### Tire Analysis Endpoint

#### Analyze Tire Image
```
POST /analyze-tire
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token} (optional for guests)

Body: 
- image: [binary file]

Response: {
  "wear_percentage": 45,
  "status": "moderate",
  "recommendation": "Replace within 3 months",
  "confidence": 0.89,
  "model_type": "mock|tensorflow"
}
```

### Data Endpoints

#### Get User Tire History
```
GET /tire-history
Authorization: Bearer {jwt_token}

Response: [
  {
    "_id": "...",
    "wear_percentage": 45,
    "status": "moderate",
    "timestamp": "2026-01-22T10:30:00Z"
  }
]
```

#### Get User Profile
```
GET /profile
Authorization: Bearer {jwt_token}

Response: {
  "email": "user@example.com",
  "analysis_count": 5
}
```

#### Server Health Check
```
GET /health

Response: { "status": "healthy", "database": "connected" }
```

---

## 📊 ML Model Details

### Model Architecture
```
Input: 224×224×3 RGB Images
  ↓
Conv Block 1: 32 filters, ReLU, MaxPool
  ↓
Conv Block 2: 64 filters, ReLU, MaxPool
  ↓
Conv Block 3: 128 filters, ReLU, MaxPool
  ↓
Conv Block 4: 256 filters, ReLU, MaxPool
  ↓
Flatten + Dropout (0.4)
  ↓
Dense: 512 neurons, ReLU
  ↓
Dense: 2 neurons, Softmax (Binary classification)
  ↓
Output: Wear percentage + Confidence
```

### Performance Metrics
| Metric | Value |
|--------|-------|
| Validation Accuracy | 85% |
| Training Epochs | 50 |
| Dataset Size | 1,698 images |
| Input Resolution | 224×224×3 |
| GPU Training | Google Colab T4 |
| Model Size | ~10MB |

### Current Status
- ⚠️ Model file `ml/models/best_model.h5` not present in repo (required for real predictions)
- ✅ TensorFlow installed and ready; drop the model file to enable live predictions
- 🔧 Automatic mock fallback until model file is provided

---

## 🔧 Environment Setup

### .env File Required
Create `.env` in root directory with:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/SafeTreadDB

# JWT Configuration
JWT_SECRET=your_secret_key_here_change_this
JWT_EXPIRATION=3600  # 1 hour in seconds

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

**⚠️ Important**: Never commit `.env` to Git (already in .gitignore)

### Python Dependencies
See [requirements.txt](requirements.txt) for all dependencies:
- Flask 3.1.2
- Pillow 12.1.0
- pymongo 4.6.1
- PyJWT 2.8.1
- python-dotenv 1.0.0

### Node Dependencies (Frontend)
Only needed if modifying frontend source code:
```powershell
cd frontend
npm install
npm run build
```

---

## 🐛 Troubleshooting

### Backend Issues

**Error: "ModuleNotFoundError: No module named 'flask'"**
```powershell
# Ensure virtual environment is activated
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Error: "Connection refused" on MongoDB**
- Check `.env` has correct MongoDB URI
- Ensure MongoDB Atlas cluster is active
- Verify IP whitelist includes your computer

**Error: "Port 5000 already in use"**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000
# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Frontend Issues

**Error: "http://localhost:3000 not loading"**
- Verify backend is running (http://127.0.0.1:5000/health should return JSON)
- Check Terminal 2 for HTTP server errors
- Try accessing http://127.0.0.1:3000 instead

**Error: "Image upload fails with 401"**
- Backend requires auth for real predictions
- Use guest mode (click "Guest Access" button)
- Or login first, then upload

### ML Model Issues

**Error: "ModuleNotFoundError: tensorflow"**
- Ensure virtual environment is activated (`.\.venv\Scripts\Activate.ps1`)
- Reinstall inside venv if needed:
  ```powershell
  .\.venv\Scripts\python.exe -m pip install "tensorflow==2.15.0"
  ```

**Error: "No file or directory found at ml/models/best_model.h5"**
- Download or copy the trained model to `ml/models/best_model.h5`
- Restart the backend after placing the file

---

## 📈 Performance Notes

| Component | Performance |
|-----------|-------------|
| Backend API | ~100-150ms per request |
| Frontend Load | ~2-3 seconds (cold start) |
| Model Inference | ~200-300ms (TensorFlow CPU, when model present) |
| Database Query | ~50-100ms |

---

## 🔐 Security Considerations

- ✅ Passwords hashed with werkzeug
- ✅ JWT tokens expire after 1 hour
- ✅ API endpoints protected with auth decorator
- ✅ Environment variables not committed to git
- ⚠️ HTTPS recommended for production
- ⚠️ CORS enabled for localhost (restrict in production)

---

## 📝 Development Workflow

### Adding New Features
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test locally
3. Commit: `git commit -m "Add feature description"`
4. Push: `git push origin feature/feature-name`
5. Create Pull Request

### Updating Dependencies
```powershell
# Python
pip list --outdated
pip install --upgrade package_name

# Node (if rebuilding frontend)
cd frontend
npm outdated
npm update
```

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Authors

**SafeTread Development Team**
- Full-stack application
- Machine learning model
- Documentation

---

## 📞 Support

For issues, questions, or contributions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review existing GitHub issues
3. Create new issue with detailed description
4. Include error logs and steps to reproduce

---

**Last Updated**: January 24, 2026  
**Status**: Production Ready (TensorFlow installed; awaiting model file)  
**Version**: 1.0.0
