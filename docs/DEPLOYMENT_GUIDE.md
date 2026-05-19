# Deployment Guide

Deploying SafeTread requires hosting both the React frontend and the Flask backend, along with the machine learning models.

## 1. Prerequisites for Production

Before deploying to production, ensure you have:
1. Replaced the `development` MongoDB URI with a `production` Atlas cluster URI.
2. Changed the `JWT_SECRET` to a strong, cryptographically secure 256-bit string.
3. Updated the frontend API URLs from `localhost:5000` to your actual backend domain.
4. Set `DEBUG=False` in your Flask run configuration.

## 2. Deploying the Frontend (React)

The frontend is a static bundle and can be deployed cheaply on any CDN-based hosting provider.

**Recommended Hosts:** Vercel, Netlify, or AWS S3 + CloudFront.

**Steps:**
1. Navigate to the `frontend/` directory.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to create the optimized production bundle in the `build/` directory.
4. Upload the contents of the `build/` directory to your hosting provider.
5. Set up your host to redirect all 404s to `index.html` (necessary for React Router to handle client-side routing).

## 3. Deploying the Backend (Flask + ML)

The backend requires a server capable of running Python 3.10+ and holding the machine learning models in memory (minimum 2GB RAM recommended, 4GB preferred).

**Recommended Hosts:** Heroku, Render, AWS EC2, or DigitalOcean Droplets.

**Steps:**
1. Provision your server/container.
2. Clone the repository and configure the `.env` variables securely in the host's environment settings.
3. Manually upload your ML model files to the `ml/models/` directory on the server (since they are gitignored).
4. Install dependencies via `pip install -r requirements.txt`.
5. Start the application using a production WSGI server like `gunicorn`, not the built-in Flask dev server.
   
```bash
# Example Gunicorn startup command
gunicorn --bind 0.0.0.0:8000 app:app --workers 2 --threads 4 --timeout 120
```
*Note: The `--timeout 120` is important because AI inference and PDF generation can take a few seconds.*

## 4. Handling Storage in Production

SafeTread currently saves user uploads, heatmaps, and PDF reports to local folders (`uploads/`, `outputs/`, `backend/reports/`). 

In a production environment (especially if using ephemeral containers like Heroku/Docker), these files will be lost on restart. For a true production deployment, you should:
- Integrate AWS S3 (or similar cloud storage) using the `boto3` library.
- Modify the `_save_image` function in `prediction_routes.py` to upload files to S3 and save the S3 URL in MongoDB, rather than a local file path.
