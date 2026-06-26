"""
Order Routes
─────────────
POST  /orders                    → checkout (cart → order, SELECT FOR UPDATE)
GET   /orders                    → paginated order history for current user
GET   /orders/{id}               → order detail with items + products
PATCH /orders/{id}/status        → admin: update order status
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from database import get_db
from models.order import Order, OrderItem, OrderStatus
from models.review import Review
from schemas.order import OrderResponse, ReviewCreate, ReviewResponse
from services.auth import get_current_user
from services.order import checkout
from services.email import send_order_confirmation_email
from models.user import User, UserRole

router = APIRouter(prefix="/orders", tags=["orders"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class PaginatedOrders(BaseModel):
    total: int
    skip: int
    limit: int
    items: list[OrderResponse]


# ── Helper ────────────────────────────────────────────────────────────────────

async def _get_order_for_user(
    db: AsyncSession, order_id: uuid.UUID, user_id: uuid.UUID
) -> Order:
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .where(Order.id == order_id, Order.user_id == user_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return order


# ── POST /orders → Checkout ───────────────────────────────────────────────────

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Convert the authenticated user's Redis cart into a confirmed Order.

    - Reads cart from Redis.
    - Acquires SELECT FOR UPDATE locks on all involved Product rows.
    - Validates stock for every item (raises 409 on shortfall).
    - Atomically decrements stock and inserts Order + OrderItems.
    - Clears the Redis cart on commit.
    """
    order = await checkout(db, current_user.id)
    background_tasks.add_task(send_order_confirmation_email, current_user.email, str(order.id))
    return order


# ── GET /orders → Order History ───────────────────────────────────────────────

@router.get("", response_model=PaginatedOrders)
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """Paginated order history for the logged-in user (newest first)."""
    count_result = await db.execute(
        select(func.count()).select_from(Order).where(Order.user_id == current_user.id)
    )
    total = count_result.scalar_one()

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    orders = result.scalars().all()
    return PaginatedOrders(total=total, skip=skip, limit=limit, items=orders)


# ── GET /orders/{id} → Order Detail ──────────────────────────────────────────

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a single order with all line items and their product snapshots."""
    return await _get_order_for_user(db, order_id, current_user.id)


# ── PATCH /orders/{id}/status → Admin Status Update ──────────────────────────

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: uuid.UUID,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin-only: Transition an order through its status lifecycle."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required.",
        )

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    # Guard: prevent transitioning a cancelled order
    if order.status == OrderStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot update status of a cancelled order.",
        )

    order.status = payload.status
    await db.commit()
    await db.refresh(order)
    return order


# ── Review sub-routes (kept here to avoid an extra router) ───────────────────

reviews_router = APIRouter(prefix="/products", tags=["reviews"])

@reviews_router.post(
    "/{product_id}/reviews", response_model=ReviewResponse, status_code=201
)
async def create_review(
    product_id: uuid.UUID,
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = Review(user_id=current_user.id, product_id=product_id, **payload.model_dump())
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


@reviews_router.get("/{product_id}/reviews", response_model=list[ReviewResponse])
async def list_reviews(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.product_id == product_id))
    return result.scalars().all()
