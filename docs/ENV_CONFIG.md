# Environment Configuration Guide

SafeTread uses environment variables to securely store sensitive information like database credentials, API keys, and application secrets. 

**Never commit your `.env` file to version control.** It is already included in our `.gitignore` file.

## Setup Instructions

1. Create a new file named `.env` in the root directory of the project (the same folder as `app.py`).
2. Copy the template below and replace the placeholder values with your actual credentials.

---

## `.env` Template

```env
# ---------------------------------------------------------
# MongoDB Configuration
# ---------------------------------------------------------
# Your MongoDB Atlas connection string. 
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
# The name of the database to use (e.g., SafeTreadDB)
MONGODB_DB=SafeTreadDB

# ---------------------------------------------------------
# Security & Authentication
# ---------------------------------------------------------
# Secret key used for signing JWT tokens. Use a long, random string.
JWT_SECRET=your_super_secret_jwt_key_here

# ---------------------------------------------------------
# Email Service (SMTP)
# ---------------------------------------------------------
# Required for sending PDF reports to users.
# If using Gmail, you must generate an "App Password" (do not use your real password).
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_16_digit_app_password
SMTP_FROM=your_email@gmail.com

# ---------------------------------------------------------
# External APIs
# ---------------------------------------------------------
# Google Gemini API key used for generating personalized AI insights.
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## How to Obtain Credentials

### MongoDB Atlas
1. Create a free cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas).
2. Under "Database Access", create a user and copy the password.
3. Under "Network Access", ensure your IP address is whitelisted (or use `0.0.0.0/0` for development).
4. Click "Connect" -> "Connect your application" and copy the connection string.

### Gmail SMTP App Password
1. Go to your Google Account -> Security.
2. Enable 2-Step Verification.
3. Search for "App passwords" in the settings search bar.
4. Create a new app password and paste the 16-character string into `SMTP_PASSWORD`.

### Google Gemini API Key
1. Go to Google AI Studio ([aistudio.google.com](https://aistudio.google.com/)).
2. Click "Get API key".
3. Create a new key and paste it into `GEMINI_API_KEY`.
