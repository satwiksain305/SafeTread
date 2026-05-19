import datetime
import logging
import os
import uuid
from threading import Thread
import io
from flask import Blueprint, jsonify, request, send_file
import jwt
from bson import ObjectId

from backend.inference_pipeline import NoTyreDetectedError, run_inference_pipeline
from backend.decision_logic import get_tyre_decision
from utils.local_validator import validate_tyre_locally

from services.validation_service import validate_uploaded_image, decode_base64_image
from services.trial_service import get_client_ip, get_trial_status, increment_trial_count
from services.explainability_service import generate_gradcam_heatmap
from services.email_service import send_prediction_email
from backend.services.pdf_service import generate_pdf_report as generate_detailed_pdf_report
from backend.services.gemini_service import generate_tire_insight
from services.history_service import save_prediction_history, get_user_prediction_history


logger = logging.getLogger("safetread")


def _build_report_data(user_email, prediction_output):
    now = datetime.datetime.utcnow()
    # Get unified decision
    decision = get_tyre_decision(prediction_output.get("wear_level", 0))
    confidence_val = prediction_output.get("confidence", 0)
    conf_pct = round(confidence_val * 100, 2)
    
    return {
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S UTC"),
        "user_email": user_email,
        "email": user_email,
        "prediction": decision["status"],
        "prediction_result": decision["status"],
        "confidence": conf_pct,
        "confidence_score": conf_pct,
        "health_score": int(100 - decision["wear_level"]),
        "wear_level": decision["wear_level"],
        "remaining_life": decision["remaining_life"],
        "risk_level": decision["risk_level"],
        "recommendation": decision["recommendation"],
        "conclusion": decision["recommendation"],
    }


def _build_email_html(user_name, report_data):
    display_name = user_name or "User"
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #111827;">
        <p>Hello {display_name},</p>
        <p>Your SafeTread tire inspection analysis has been completed.</p>
        <p><strong>Prediction Result:</strong> {report_data.get('prediction', '')}</p>
        <p><strong>Confidence:</strong> {report_data.get('confidence', 0)}%</p>
        <p><strong>Tire Health Score:</strong> {report_data.get('health_score', 0)}%</p>
        <p><strong>Recommendation:</strong><br>{report_data.get('recommendation', '')}</p>
        <p>Please find the detailed inspection report attached.</p>
        <p>Regards<br>SafeTread AI System</p>
      </body>
    </html>
    """


def get_current_user_email(jwt_secret, jwt_algorithm):
    token_header = request.headers.get("Authorization", "")
    if not token_header.startswith("Bearer "):
        return None, None, None, "Missing Authorization header", 401

    token = token_header.split(" ", 1)[1].strip()
    if not token:
        return None, None, None, "Token is missing", 401

    try:
        payload = jwt.decode(token, jwt_secret, algorithms=[jwt_algorithm])
        email = payload.get("email")
        if not email:
            return None, None, None, "Token payload missing email", 401
        logger.info("JWT verification success for email: %s", email)
        return email, payload.get("name"), payload, None, None
    except jwt.ExpiredSignatureError:
        logger.warning("JWT verification failed: token expired")
        return None, None, None, "Token has expired", 401
    except jwt.InvalidTokenError as exc:
        logger.warning("JWT verification failed: %s", str(exc))
        return None, None, None, "Invalid token", 401


def _load_validated_input_image():
    if "image" in request.files:
        validation = validate_uploaded_image(request.files["image"])
        if not validation.get("valid"):
            return None, None, jsonify({"status": "error", "message": validation.get("message")}), 400
        return validation["image"], validation["extension"], None, None

    image_base64 = request.form.get("image_base64")
    if not image_base64 and request.is_json:
        payload = request.get_json(silent=True) or {}
        image_base64 = payload.get("image_base64")

    if image_base64:
        decoded = decode_base64_image(image_base64)
        if not decoded.get("valid"):
            return None, None, jsonify({"status": "error", "message": decoded.get("message")}), 400
        return decoded["image"], decoded["extension"], None, None

    return None, None, jsonify({"status": "error", "message": "No image file provided"}), 400


def _save_image(image, directory, extension="jpg", prefix="img"):
    os.makedirs(directory, exist_ok=True)
    safe_ext = extension.lower()
    if safe_ext in {"jpeg", "jpg"}:
        save_ext = "jpg"
        save_format = "JPEG"
    elif safe_ext in {"png", "webp"}:
        save_ext = safe_ext
        save_format = safe_ext.upper()
    else:
        save_ext = "jpg"
        save_format = "JPEG"

    filename = f"{prefix}_{uuid.uuid4().hex[:12]}.{save_ext}"
    full_path = os.path.join(directory, filename)
    image.convert("RGB").save(full_path, format=save_format, quality=92)
    return full_path, filename


def _send_email_background(user_email, report_html, pdf_path, heatmap_path, image_path, prediction_result):
    try:
        send_prediction_email(
            user_email=user_email,
            report_html=report_html,
            pdf_path=pdf_path,
            image_path=image_path,
            heatmap_path=heatmap_path,
            prediction_result=prediction_result
        )
        logger.info("Email sent successfully for user: %s", user_email)
    except Exception as exc:
        logger.error("Email failure for user %s: %s", user_email, str(exc))


def create_prediction_blueprint(db, model, use_real_model, use_mobilenetv2, jwt_secret, jwt_algorithm):
    prediction_bp = Blueprint("prediction_bp", __name__)

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    outputs_dir = os.path.join(project_root, "outputs")
    uploads_dir = os.path.join(project_root, "uploads")
    os.makedirs(outputs_dir, exist_ok=True)
    os.makedirs(uploads_dir, exist_ok=True)

    @prediction_bp.route("/api/predict-demo", methods=["POST"])
    def predict_demo():
        stage_log = []
        client_ip = get_client_ip(request)
        logger.info("Prediction started for guest IP: %s", client_ip)

        trial_status = get_trial_status(db, client_ip)
        if not trial_status["allowed"]:
            logger.warning("Trial limit reached for guest IP: %s", client_ip)
            return (
                jsonify(
                    {
                        "status": "limit_reached",
                        "message": "Free trial limit reached. Please create an account to continue.",
                    }
                ),
                403,
            )

        try:
            stage_log.append("analyzing_tire_pattern")
            image, extension, error_response, status_code = _load_validated_input_image()
            if error_response:
                logger.warning("Invalid upload for guest IP %s", client_ip)
                return error_response, status_code

            # ── Local AI Tyre Validation ───────────────────────────────────────
            import io
            img_buf = io.BytesIO()
            image.convert("RGB").save(img_buf, format="JPEG", quality=85)
            if not validate_tyre_locally(img_buf.getvalue()):
                logger.info("Local AI rejected image for guest IP %s: no tyre detected", client_ip)
                return jsonify({
                    "status": "error",
                    "message": "No tyre detected in the image. Please upload a tyre image.",
                }), 400
            # ──────────────────────────────────────────────────────────────────

            pipeline_result = run_inference_pipeline(
                image,
                model=model,
                use_real_model=use_real_model,
                use_mobilenetv2=use_mobilenetv2,
            )

            bbox = pipeline_result.bbox
            prediction_output = pipeline_result.prediction
            cropped_image = image.crop((bbox[0], bbox[1], bbox[2], bbox[3])).convert("RGB")
            
            # 3. Decision Logic (Single Source of Truth)
            decision = get_tyre_decision(prediction_output.get("wear_level", 0))

            # 4. Gemini AI Insight (non-blocking)
            ai_insight = generate_tire_insight(
                wear_level=decision["wear_level"],
                status=decision["status"],
                risk_level=decision["risk_level"],
                remaining_life=decision["remaining_life"],
                confidence=prediction_output.get("confidence", 0),
            )

            logger.info(
                "Prediction completed for guest IP %s with bbox=%s status=%s",
                client_ip,
                bbox,
                decision["status"],
            )

            heatmap_url = ""
            try:
                heatmap_path, heatmap_filename = _save_image(cropped_image, outputs_dir, extension="jpg", prefix="heatmap")
                generate_gradcam_heatmap(model, cropped_image, output_path=heatmap_path)
                heatmap_url = f"/outputs/{heatmap_filename}"
            except Exception as exc:
                logger.warning("Heatmap generation skipped for guest prediction: %s", str(exc))

            count_after = increment_trial_count(db, client_ip)
            remaining = max(0, 2 - count_after)

            db.tire_predictions.insert_one(
                {
                    "user_email": "guest",
                    "detection_status": "tire_detected",
                    "prediction_result": decision["status"],
                    "wear_level": decision["wear_level"],
                    "confidence": prediction_output.get("confidence", 0),
                    "health_score": int(100 - decision["wear_level"]),
                    "recommendation": decision["recommendation"],
                    "status": decision["status"],
                    "risk_level": decision["risk_level"],
                    "analyzed_at": datetime.datetime.utcnow(),
                    "model_used": "CNN (TensorFlow)" if use_real_model else "Mock",
                }
            )

            return (
                jsonify(
                    {
                        "status": decision["status"],
                        "wear_level": decision["wear_level"],
                        "remaining_life": decision["remaining_life"],
                        "risk_level": decision["risk_level"],
                        "recommendation": decision["recommendation"],
                        "ai_insight": ai_insight,
                        "message": "Analysis completed successfully",
                        "tire_detected": True,
                        "confidence": prediction_output.get("confidence", 0),
                        "confidence_score": round(prediction_output.get("confidence", 0) * 100, 2),
                        "heatmap_url": heatmap_url,
                        "remaining_free_trials": remaining,
                        "email_report_sent": False,
                        "processing": {
                            "status": "completed",
                            "stages": stage_log,
                        },
                    }
                ),
                200,
            )
        except NoTyreDetectedError as exc:
            logger.info("Tyre not detected for guest IP %s: %s", client_ip, str(exc))
            return jsonify({"status": "error", "message": str(exc)}), 400
        except Exception as exc:
            logger.error("Internal Error in predict_demo for IP %s: %s", client_ip, str(exc), exc_info=True)
            return jsonify({"status": "error", "message": "Internal server error during analysis."}), 500

    @prediction_bp.route("/api/predict-user", methods=["POST"])
    def predict_user():
        stage_log = []
        user_email, user_name, _, auth_error, auth_status = get_current_user_email(jwt_secret, jwt_algorithm)
        if auth_error:
            logger.warning("JWT authentication failure: %s", auth_error)
            return jsonify({"status": "error", "message": auth_error}), auth_status

        logger.info("Prediction started for user: %s", user_email)

        try:
            stage_log.append("analyzing_tire_pattern")
            image, extension, error_response, status_code = _load_validated_input_image()
            if error_response:
                logger.warning("Invalid upload for user: %s", user_email)
                return error_response, status_code

            # ── Local AI Tyre Validation ───────────────────────────────────────
            import io as _io
            img_buf2 = _io.BytesIO()
            image.convert("RGB").save(img_buf2, format="JPEG", quality=85)
            if not validate_tyre_locally(img_buf2.getvalue()):
                logger.info("Local AI rejected image for user %s: no tyre detected", user_email)
                return jsonify({
                    "status": "error",
                    "message": "No tyre detected in the image. Please upload a tyre image.",
                }), 400
            # ──────────────────────────────────────────────────────────────────

            image_path, image_filename = _save_image(image, uploads_dir, extension=extension or "jpg", prefix="upload")
            image_rel_path = f"uploads/{image_filename}"

            pipeline_result = run_inference_pipeline(
                image,
                model=model,
                use_real_model=use_real_model,
                use_mobilenetv2=use_mobilenetv2,
            )

            bbox = pipeline_result.bbox
            prediction_output = pipeline_result.prediction
            cropped_image = image.crop((bbox[0], bbox[1], bbox[2], bbox[3])).convert("RGB")
            
            # 3. Decision Logic (Single Source of Truth)
            decision = get_tyre_decision(prediction_output.get("wear_level", 0))

            # 4. Gemini AI Insight (non-blocking)
            ai_insight = generate_tire_insight(
                wear_level=decision["wear_level"],
                status=decision["status"],
                risk_level=decision["risk_level"],
                remaining_life=decision["remaining_life"],
                confidence=prediction_output.get("confidence", 0),
            )

            logger.info(
                "Prediction completed for user: %s with bbox=%s status=%s",
                user_email,
                bbox,
                decision.get("status", "Unknown"),
            )

            heatmap_path = ""
            heatmap_url = ""
            heatmap_rel_path = ""
            try:
                heatmap_path, heatmap_filename = _save_image(cropped_image, outputs_dir, extension="jpg", prefix="heatmap")
                generate_gradcam_heatmap(model, cropped_image, output_path=heatmap_path)
                heatmap_url = f"/outputs/{heatmap_filename}"
                heatmap_rel_path = f"outputs/{heatmap_filename}"
            except Exception as exc:
                logger.warning("Heatmap generation skipped for user %s: %s", user_email, str(exc))

            prediction_id = None
            pdf_path = None
            report_data = None
            
            try:
                history_record = save_prediction_history(
                    db,
                    {
                        "user_email": user_email,
                        "image_path": image_rel_path,
                        "heatmap_path": heatmap_rel_path,
                        "prediction": decision["status"],
                        "wear_level": decision["wear_level"],
                        "remaining_life": decision["remaining_life"],
                        "risk_level": decision["risk_level"],
                        "confidence": prediction_output.get("confidence", 0),
                        "health_score": int(100 - decision["wear_level"]),
                        "recommendation": decision["recommendation"],
                        "created_at": datetime.datetime.utcnow(),
                    },
                )
                prediction_id = str(history_record["_id"])
            except Exception as exc:
                logger.error("Prediction history save failed for user %s: %s", user_email, str(exc))

            if prediction_id:
                try:
                    # Generate Persistent PDF Report
                    reports_dir = os.path.join(project_root, "backend", "reports")
                    os.makedirs(reports_dir, exist_ok=True)
                    pdf_path = os.path.join(reports_dir, f"report_{prediction_id}.pdf")
                    
                    report_data = _build_report_data(user_email, prediction_output)
                    generate_detailed_pdf_report(report_data, pdf_path)
                    
                    # Update history with PDF path
                    db["prediction_history"].update_one(
                        {"_id": history_record["_id"]},
                        {"$set": {"pdf_path": f"backend/reports/report_{prediction_id}.pdf"}}
                    )
                    logger.info("PDF report generated successfully for prediction: %s", prediction_id)
                except Exception as exc:
                    logger.error("PDF generation failed for user %s: %s", user_email, str(exc))

            report_html = _build_email_html(user_name, report_data) if (prediction_id and report_data) else ""
                
            email_thread = Thread(
                target=_send_email_background,
                args=(user_email, report_html, pdf_path, heatmap_path, image_path, decision["status"]),
                daemon=True,
            )
            email_thread.start()
            logger.info("Email queued for user: %s", user_email)

            return (
                jsonify(
                    {
                        "status": decision["status"],
                        "wear_level": decision["wear_level"],
                        "remaining_life": decision["remaining_life"],
                        "risk_level": decision["risk_level"],
                        "recommendation": decision["recommendation"],
                        "ai_insight": ai_insight,
                        "message": "Analysis completed successfully",
                        "tire_detected": True,
                        "confidence": prediction_output.get("confidence", 0),
                        "confidence_score": round(prediction_output.get("confidence", 0) * 100, 2),
                        "heatmap_url": heatmap_url,
                        "prediction_id": prediction_id,
                        "email_queued": True,
                        "processing": {
                            "status": "completed",
                            "stages": stage_log,
                        },
                    }
                ),
                200,
            )
        except NoTyreDetectedError as exc:
            logger.info("Tyre not detected for user %s: %s", user_email, str(exc))
            return jsonify({"status": "error", "message": str(exc)}), 400
        except Exception as exc:
            logger.error("Internal Error in predict_user for user %s: %s", user_email, str(exc), exc_info=True)
            return jsonify({"status": "error", "message": "Internal server error during analysis."}), 500

    @prediction_bp.route("/api/prediction-history", methods=["GET"])
    def prediction_history():
        user_email, _, _, auth_error, auth_status = get_current_user_email(jwt_secret, jwt_algorithm)
        if auth_error:
            logger.warning("JWT authentication failure on history endpoint: %s", auth_error)
            return jsonify({"status": "error", "message": auth_error}), auth_status

        try:
            history = get_user_prediction_history(db, user_email)
            return jsonify({"status": "success", "history": history}), 200
        except Exception as exc:
            logger.error("MongoDB history retrieval failure for user %s: %s", user_email, str(exc))
            return jsonify({"status": "error", "message": "Failed to fetch prediction history"}), 500

    @prediction_bp.route("/api/download-report/<prediction_id>", methods=["GET"])
    def download_report(prediction_id):
        try:
            # 1. Fetch prediction details from history
            try:
                prediction_oid = ObjectId(prediction_id)
            except Exception:
                return jsonify({"status": "error", "message": "Invalid prediction ID"}), 400

            prediction = db["prediction_history"].find_one({"_id": prediction_oid})
            if not prediction:
                # Fallback to checking by string if not ObjectId
                prediction = db["prediction_history"].find_one({"id": prediction_id})
            
            if not prediction:
                logger.warning("Prediction record not found for id: %s", prediction_id)
                return jsonify({"status": "error", "message": "Prediction record not found"}), 404

            user_email = prediction.get("user_email")
            created_at = prediction.get("created_at") or datetime.datetime.utcnow()
            
            # 2. Fetch user name
            user_name = "User"
            if user_email:
                user = db["users"].find_one({"email": user_email})
                if user and user.get("name"):
                    user_name = user.get("name")

            # 3. Format filename: Name_YYYY-MM-DD_HH-MM.pdf
            safe_name = "".join(x for x in user_name if x.isalnum() or x in " -_").strip().replace(" ", "_")
            timestamp_str = created_at.strftime("%Y-%m-%d_%H-%M")
            download_name = f"SafeTread_{safe_name}_{timestamp_str}.pdf"

            # 4. Locate and send file
            reports_dir = os.path.join(project_root, "backend", "reports")
            pdf_path = os.path.join(reports_dir, f"report_{prediction_id}.pdf")
            
            if not os.path.exists(pdf_path):
                logger.warning("Report PDF file not found at: %s", pdf_path)
                return jsonify({"status": "error", "message": "Report file not found"}), 404
                
            return send_file(
                pdf_path, 
                as_attachment=True, 
                download_name=download_name,
                mimetype="application/pdf"
            )
        except Exception as exc:
            logger.error("Report download failed for id %s: %s", prediction_id, str(exc))
            return jsonify({"status": "error", "message": "Download failed"}), 500

    return prediction_bp
