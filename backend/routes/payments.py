"""
Payments Router
───────────────
POST /payments/create-intent → Generate Stripe PaymentIntent for an order.
POST /payments/webhook       → Stripe Webhook receiver to automatically update order status on success.
"""

import uuid
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Request, status, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models.order import Order, OrderStatus
from models.user import User
from services.auth import get_current_user
from services.payment import create_payment_intent, construct_webhook_event

router = APIRouter(prefix="/payments", tags=["payments"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class PaymentIntentRequest(BaseModel):
    order_id: uuid.UUID

class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str


# ── POST /payments/create-intent ──────────────────────────────────────────────

@router.post("/create-intent", response_model=PaymentIntentResponse)
async def create_intent(
    payload: PaymentIntentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Look up an order by ID, create a Stripe PaymentIntent for its total amount,
    and link the PaymentIntent ID to the Order in the database.
    Returns the client_secret required by the frontend Stripe Elements.
    """
    # 1. Fetch the order
    result = await db.execute(
        select(Order).where(Order.id == payload.order_id, Order.user_id == current_user.id)
    )
    order = result.scalars().first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot pay for an order in status: {order.status.name}"
        )

    # 2. If it already has an intent, we could just return it, but for simplicity
    # we'll let Stripe create a new one (or you could look up the existing one).
    intent = create_payment_intent(
        amount=order.total,
        metadata={"order_id": str(order.id), "user_id": str(current_user.id)}
    )

    # 3. Store the Stripe intent ID on our Order
    order.payment_intent_id = intent.id
    await db.commit()

    # 4. Return the client_secret to the frontend
    return PaymentIntentResponse(
        client_secret=intent.client_secret,
        payment_intent_id=intent.id
    )


# ── POST /payments/webhook ────────────────────────────────────────────────────

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Stripe Webhook Handler.
    Automatically transitions OrderStatus to PROCESSING upon successful payment.
    """
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    # Read raw body needed for signature verification
    payload_bytes = await request.body()

    # Verify signature
    event = construct_webhook_event(payload_bytes, stripe_signature)

    # Handle the event
    if event.type == "payment_intent.succeeded":
        payment_intent = event.data.object
        intent_id = payment_intent.id

        # Look up the order associated with this intent
        result = await db.execute(
            select(Order).where(Order.payment_intent_id == intent_id)
        )
        order = result.scalars().first()

        if order and order.status == OrderStatus.PENDING:
            # Payment successful, move order to PROCESSING
            order.status = OrderStatus.PROCESSING
            await db.commit()
            print(f"✅ Webhook: Order {order.id} marked as PROCESSING.")
    
    elif event.type == "payment_intent.payment_failed":
        payment_intent = event.data.object
        # Optionally log the failure or transition order to a FAILED state
        print(f"❌ Webhook: Payment failed for intent {payment_intent.id}")

    # Acknowledge receipt
    return {"status": "success"}
