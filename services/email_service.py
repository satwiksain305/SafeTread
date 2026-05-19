import os
import smtplib
import logging
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email import encoders

logger = logging.getLogger("safetread")


def _attach_file(message, file_path, attachment_name=None):
    if not file_path or not os.path.exists(file_path):
        return

    filename = attachment_name or os.path.basename(file_path)
    try:
        with open(file_path, "rb") as file_handle:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(file_handle.read())
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f'attachment; filename="{filename}"')
            message.attach(part)
            logger.info("Attached file: %s", filename)
    except Exception as e:
        logger.error("Failed to attach file %s: %s", filename, str(e))


def send_prediction_email(user_email, report_html, pdf_path=None, image_path=None, heatmap_path=None, prediction_result="Analysis Completed"):
    """Send prediction report email with HTML body and attachments."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USERNAME", os.getenv("SMTP_EMAIL", ""))
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    from_email = os.getenv("SMTP_FROM", smtp_user)

    logger.info("Preparing to send prediction email to %s", user_email)
    
    if not smtp_user or not smtp_password:
        logger.error("SMTP credentials missing: user=%s, has_password=%s", smtp_user, bool(smtp_password))
        raise ValueError("SMTP credentials are not configured")

    message = MIMEMultipart()
    message["From"] = from_email
    message["To"] = user_email
    message["Subject"] = f"SafeTread Tire Analysis: {prediction_result}"
    
    body = f"Hello,\n\nYour tyre analysis has been completed with the following result: {prediction_result}.\nPlease find the detailed inspection report and images attached.\n\nRegards,\nSafeTread AI System"
    message.attach(MIMEText(body, "plain"))

    if report_html:
        message.attach(MIMEText(report_html, "html"))

    # Attach PDF Report
    if pdf_path and os.path.exists(pdf_path):
        _attach_file(message, pdf_path, "SafeTread_Inspection_Report.pdf")
    
    # Attach Original Image
    if image_path and os.path.exists(image_path):
        _attach_file(message, image_path, "tire_image.jpg")
        
    # Attach Heatmap
    if heatmap_path and os.path.exists(heatmap_path):
        _attach_file(message, heatmap_path, "wear_heatmap.jpg")

    with smtplib.SMTP(smtp_host, smtp_port) as smtp_server:
        smtp_server.ehlo()
        smtp_server.starttls()
        smtp_server.login(smtp_user, smtp_password)
        smtp_server.sendmail(from_email, user_email, message.as_string())

    return {"sent": True, "recipient": user_email}
