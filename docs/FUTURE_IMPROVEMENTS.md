# Future Improvements

SafeTread has been stabilized and cleaned, but there are always opportunities to enhance the architecture and user experience. 

Below are optional, safe recommendations for future development. **None of these are required for the current version to function.**

## 1. Cloud Storage Integration (S3)
**Current State:** Images, heatmaps, and PDFs are saved to the local file system (`uploads/`, `outputs/`, `backend/reports/`).  
**Improvement:** Integrate AWS S3 or Google Cloud Storage.  
**Why:** If the backend is deployed to ephemeral containers (like Docker or Heroku), local files are lost on restart. Cloud storage ensures persistence and faster CDN delivery of images to the frontend.

## 2. Asynchronous Task Queue (Celery/Redis)
**Current State:** PDF generation and ML inference happen synchronously during the request. Emailing happens via a basic Python `threading.Thread`.  
**Improvement:** Implement Celery + Redis for background job processing.  
**Why:** ML inference and PDF generation can take a few seconds. Moving these to a background queue will make the API respond instantly, improving perceived performance on the frontend and preventing HTTP timeout errors under heavy load.

## 3. Automated Test Suite
**Current State:** No automated tests (unit or integration) exist for the backend logic or ML pipeline.  
**Improvement:** Add `pytest` for the backend and `Jest` for the frontend.  
**Why:** As the application grows, automated tests are the only way to ensure new features don't break the existing ML pipeline or authentication flows.

## 4. Dockerization
**Current State:** Developers must manually configure Python environments, Node.js, and MongoDB.  
**Improvement:** Create a `docker-compose.yml` that spins up the backend, frontend, and a local MongoDB instance.  
**Why:** Guarantees a "works on my machine" experience for every developer and vastly simplifies CI/CD deployment pipelines.

## 5. Model Registry & Versioning
**Current State:** Models are dumped into `ml/models/` and tracked manually by file name (e.g., `best_model_FINAL_95PERCENT.keras`).  
**Improvement:** Use MLflow or Weights & Biases for model versioning.  
**Why:** Allows for seamless A/B testing of new models, rollback of bad models, and centralizes model storage instead of requiring developers to manually download heavy `.keras` files.
