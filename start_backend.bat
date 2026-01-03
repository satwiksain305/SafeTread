@echo off
REM SafeTread Backend Startup Script for Windows

echo Starting SafeTread Backend...

REM Check if virtual environment exists
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet

REM Run the Flask app
echo Starting Flask server on http://127.0.0.1:5000
python app.py
