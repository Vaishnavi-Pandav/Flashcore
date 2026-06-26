"""
Order Service
─────────────
Converts a Redis cart into a PostgreSQL Order row.
Uses SELECT FOR UPDATE to lock Product rows during stock decrement,
preventing race conditions under concurrent checkouts.
"""

import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.order import Order, OrderItem, OrderStatus
from models.product import Product
from services.cart import get_cart, clear_cart


async def checkout(db: AsyncSession, user_id: uuid.UUID) -> Order:
    """
    Atomically:
    1. Read cart from Redis.
    2. Lock all involved Product rows with SELECT FOR UPDATE.
    3. Validate stock for every item.
    4. Decrement stock, create Order + OrderItems in one transaction.
    5. Clear the Redis cart on success.
    """
    cart = await get_cart(user_id)

    if not cart:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty. Add items before placing an order.",
        )

    product_ids = [uuid.UUID(pid) for pid in cart.keys()]

    # ── Lock rows to prevent concurrent overselling ──────────────────────────
    result = await db.execute(
        select(Product)
        .where(Product.id.in_(product_ids), Product.is_deleted.is_(False))
        .with_for_update()          # SELECT FOR UPDATE — blocks concurrent transactions
    )
    products = {str(p.id): p for p in result.scalars().all()}

    # ── Validate all products exist and have sufficient stock ─────────────────
    order_items_data: list[dict] = []
    total = Decimal("0.00")

    for pid_str, qty in cart.items():
        product = products.get(pid_str)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {pid_str} not found or has been removed.",
            )
        if product.stock < qty:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Insufficient stock for '{product.name}'. "
                    f"Requested: {qty}, Available: {product.stock}."
                ),
            )
        unit_price = Decimal(str(product.price))
        total += unit_price * qty
        order_items_data.append(
            {
                "product_id": product.id,
                "quantity": qty,
                "unit_price": unit_price,
            }
        )
        # ── Decrement stock inside the same transaction ───────────────────────
        product.stock -= qty

    # ── Persist order ─────────────────────────────────────────────────────────
    order = Order(user_id=user_id, status=OrderStatus.PENDING, total=total)
    db.add(order)
    await db.flush()  # Get order.id before inserting items

    for item_data in order_items_data:
        db.add(OrderItem(order_id=order.id, **item_data))

    await db.commit()

    # ── Clear Redis cart after successful commit ───────────────────────────────
    await clear_cart(user_id)

    # ── Return fully-loaded order ─────────────────────────────────────────────
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order.id)
    )
    return result.scalars().first()
