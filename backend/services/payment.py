import os
import stripe
from fastapi import HTTPException, status
from decimal import Decimal

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

def create_payment_intent(amount: Decimal, currency: str = "usd", metadata: dict = None) -> stripe.PaymentIntent:
    """Create a Stripe PaymentIntent."""
    try:
        # Stripe expects amounts in cents (smallest currency unit)
        amount_in_cents = int(amount * 100)
        
        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency=currency,
            metadata=metadata or {},
        )
        return intent
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

def construct_webhook_event(payload: bytes, sig_header: str) -> stripe.Event:
    """Verify the signature and construct the Stripe webhook event."""
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
        return event
    except ValueError:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")
