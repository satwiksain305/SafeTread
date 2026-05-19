# SafeTread Setup Guide

Welcome to the SafeTread project! This guide will walk you through setting up the application on your local machine for development and testing.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.10+**: Required for the FastAPI/Flask backend and AI pipelines.
- **Node.js 18+ & npm**: Required for the React frontend.
- **Git**: For version control.
- **MongoDB Atlas Account**: Required for the cloud database.

---

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/SafeTread.git
cd SafeTread
```

---

## 2. Environment Configuration

The application requires specific environment variables to function correctly (e.g., database credentials, JWT secrets, email configuration). 

1. Create a file named `.env` in the root directory.
2. Refer to the [Environment Configuration Guide](ENV_CONFIG.md) for the exact keys and values required.

---

## 3. Backend Setup

The backend handles AI inference, routing, database interactions, and report generation.

### Create a Virtual Environment
It is highly recommended to isolate Python dependencies.

**Windows:**
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Mac/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Download ML Models
Ensure the required `.keras` and `.pt` model files are placed in the `ml/models/` directory. Without these, the application will fall back to using mock predictions.

### Start the Server
```bash
python app.py
```
The backend API will start on `http://localhost:5000`.

---

## 4. Frontend Setup

The frontend is a React application built with Create React App and Tailwind CSS.

### Install Node Modules
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```

### Start the Development Server
```bash
npm start
```
The React application will open automatically in your browser at `http://localhost:3000`.

---

## 5. Verifying the Installation

1. Navigate to `http://localhost:3000` in your browser.
2. Click **Try Demo** or **Login/Register**.
3. Upload a test image of a tire.
4. Verify that the analysis completes and the results page renders the health score and heatmap.

If you encounter any issues, check the terminal output for both the Python and Node.js servers. Backend logs are also saved in `logs/safetread.log`.
