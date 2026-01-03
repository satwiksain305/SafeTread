#!/bin/bash
# SafeTread Frontend Startup Script

cd frontend

echo "🚀 Starting SafeTread Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the React app
echo "✅ Starting React dev server on http://localhost:3000"
npm start
