@echo off
REM SafeTread Frontend Startup Script for Windows

cd frontend

echo Starting SafeTread Frontend...

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start the React app
echo Starting React dev server on http://localhost:3000
npm start
