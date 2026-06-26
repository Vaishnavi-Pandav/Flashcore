from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import uuid

from database import get_db
from models.order import Order, OrderItem, OrderStatus
from models.product import Product
from models.cart import Cart, CartItem
from models.review import Review
from schemas.order import (
    OrderCreate, OrderResponse,
    CartItemBase, CartResponse,
    ReviewCreate, ReviewResponse,
)
from services.auth import get_current_user
from models.user import User

# ── Orders ─────────────────────────────────────────────────────────────────
orders_router = APIRouter(prefix="/orders", tags=["orders"])

@orders_router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = sum(item.unit_price * item.quantity for item in payload.items)
    order = Order(user_id=current_user.id, status=OrderStatus.PENDING, total=total)
    db.add(order)
    await db.flush()
    for item in payload.items:
        db.add(OrderItem(order_id=order.id, **item.model_dump()))
    await db.commit()
    result = await db.execute(
        select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).where(Order.id == order.id)
    )
    return result.scalars().first()

@orders_router.get("", response_model=list[OrderResponse])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.user_id == current_user.id)
    )
    return result.scalars().all()

@orders_router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ── Cart ────────────────────────────────────────────────────────────────────
cart_router = APIRouter(prefix="/cart", tags=["cart"])

async def _get_or_create_cart(db: AsyncSession, user_id: uuid.UUID) -> Cart:
    result = await db.execute(
        select(Cart).options(selectinload(Cart.items)).where(Cart.user_id == user_id)
    )
    cart = result.scalars().first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        await db.flush()
    return cart

@cart_router.get("", response_model=CartResponse)
async def get_cart(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await _get_or_create_cart(db, current_user.id)

@cart_router.post("/items", response_model=CartResponse, status_code=201)
async def add_to_cart(
    payload: CartItemBase,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = await _get_or_create_cart(db, current_user.id)
    # Check if product already in cart
    existing = next((i for i in cart.items if str(i.product_id) == str(payload.product_id)), None)
    if existing:
        existing.quantity += payload.quantity
    else:
        db.add(CartItem(cart_id=cart.id, **payload.model_dump()))
    await db.commit()
    result = await db.execute(
        select(Cart).options(selectinload(Cart.items)).where(Cart.id == cart.id)
    )
    return result.scalars().first()

@cart_router.delete("/items/{item_id}", status_code=204)
async def remove_cart_item(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = await _get_or_create_cart(db, current_user.id)
    result = await db.execute(select(CartItem).where(CartItem.id == item_id, CartItem.cart_id == cart.id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    await db.delete(item)
    await db.commit()


# ── Reviews ─────────────────────────────────────────────────────────────────
reviews_router = APIRouter(prefix="/products", tags=["reviews"])

@reviews_router.post("/{product_id}/reviews", response_model=ReviewResponse, status_code=201)
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
