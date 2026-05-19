# API Overview

This document outlines the core RESTful API endpoints exposed by the SafeTread Flask backend.

All backend routes are prefixed with the host (e.g., `http://localhost:5000`).

---

## Authentication & User Management

### `POST /register`
Creates a new user account.
- **Body:** `{ "name": "John Doe", "email": "john@example.com", "password": "securepass" }`
- **Returns:** `201 Created` on success, `409 Conflict` if email exists.

### `POST /login`
Authenticates a user and returns a JWT.
- **Body:** `{ "email": "john@example.com", "password": "securepass" }`
- **Returns:** `200 OK` with `{ "token": "...", "user": {...} }`

### `GET /profile`
Retrieves the current user's profile.
- **Headers:** `Authorization: Bearer <token>`
- **Returns:** `200 OK` with user details.

---

## Tire Analysis (Predictions)

### `POST /api/predict-demo`
Allows guest users to test the AI without an account. Limited to 2 trials per IP address.
- **Body:** `multipart/form-data` with an `image` file.
- **Returns:** `200 OK` with the prediction, health score, AI insight, heatmap URL, and remaining free trials. No email is sent, and history is not linked to an account.

### `POST /api/predict-user`
The primary analysis endpoint for authenticated users.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `multipart/form-data` with an `image` file.
- **Returns:** `200 OK` with prediction details.
- **Background Actions:** 
  1. Saves result to MongoDB user history.
  2. Generates a detailed PDF report.
  3. Dispatches the report via email asynchronously.

---

## History & Reports

### `GET /api/prediction-history`
Fetches a chronological list of all past tire analyses for the logged-in user.
- **Headers:** `Authorization: Bearer <token>`
- **Returns:** `200 OK` with an array of history objects.

### `GET /api/download-report/<prediction_id>`
Downloads the PDF report generated for a specific prediction.
- **Headers:** None required (accessible via direct URL from the frontend).
- **Returns:** `200 OK` with `application/pdf` file stream.

---

## System Health

### `GET /health`
Checks if the backend and database connections are active.
- **Returns:** `200 OK` with `{ "status": "ok", "database": "connected" }`.

### `GET /outputs/<filename>`
Serves statically generated GradCAM heatmap images.
- **Returns:** Image file stream.
