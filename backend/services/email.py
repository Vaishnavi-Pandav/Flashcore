import asyncio
import os
import aiosmtplib
from email.message import EmailMessage
import logging

logger = logging.getLogger(__name__)

async def send_order_confirmation_email(email: str, order_id: str):
    """
    Sends an order confirmation email to the user.
    Uses aiosmtplib if SMTP credentials are provided, otherwise logs a mock send.
    """
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")

    if not all([smtp_host, smtp_port, smtp_user, smtp_pass]):
        # Mock sending if no credentials
        logger.warning("SMTP credentials not fully configured. Mocking order confirmation email.")
        await asyncio.sleep(2)  # Simulate network delay
        logger.info(f"MOCK EMAIL SENT to {email} for order {order_id}")
        return

    try:
        message = EmailMessage()
        message["From"] = f"Flashcore Store <{smtp_user}>"
        message["To"] = email
        message["Subject"] = f"Order Confirmation - {order_id}"
        message.set_content(
            f"Thank you for your order!\n\n"
            f"Your order ID is: {order_id}.\n"
            f"We will notify you once it ships."
        )

        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=int(smtp_port),
            username=smtp_user,
            password=smtp_pass,
            use_tls=True,
        )
        logger.info(f"Order confirmation email sent to {email} for order {order_id}")
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
