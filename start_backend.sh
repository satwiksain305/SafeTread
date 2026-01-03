#!/bin/bash
# SafeTread Backend Startup Script

echo "🚀 Starting SafeTread Backend..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt --quiet

# Run the Flask app
echo "✅ Starting Flask server on http://127.0.0.1:5000"
python app.py
