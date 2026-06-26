"""
Redis Cart Service
──────────────────
Stores each user's cart as a Redis Hash:
  Key:   cart:{user_id}
  Field: {product_id}
  Value: {quantity}   (stored as int string)

TTL: 7 days — refreshed on every write.
"""

import json
import os
import uuid
from typing import Optional

import redis.asyncio as aioredis
from fastapi import HTTPException, status

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CART_TTL = 60 * 60 * 24 * 7  # 7 days


# ── Connection pool (re-used across requests) ────────────────────────────────

_redis_pool: Optional[aioredis.Redis] = None


def get_redis() -> aioredis.Redis:
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.from_url(REDIS_URL, decode_responses=True)
    return _redis_pool


# ── Cart key helper ──────────────────────────────────────────────────────────

def _cart_key(user_id: uuid.UUID) -> str:
    return f"cart:{user_id}"


# ── CRUD ─────────────────────────────────────────────────────────────────────

async def get_cart(user_id: uuid.UUID) -> dict[str, int]:
    """Return the cart as {product_id: quantity}."""
    redis = get_redis()
    raw = await redis.hgetall(_cart_key(user_id))
    return {k: int(v) for k, v in raw.items()}


async def add_to_cart(user_id: uuid.UUID, product_id: uuid.UUID, quantity: int) -> dict[str, int]:
    """Add or increment a product in the cart. Returns the updated cart."""
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be a positive integer.",
        )
    redis = get_redis()
    key = _cart_key(user_id)
    await redis.hincrby(key, str(product_id), quantity)
    await redis.expire(key, CART_TTL)
    return await get_cart(user_id)


async def set_item_quantity(
    user_id: uuid.UUID, product_id: uuid.UUID, quantity: int
) -> dict[str, int]:
    """Set an exact quantity for a product (replaces existing value)."""
    if quantity <= 0:
        return await remove_from_cart(user_id, product_id)
    redis = get_redis()
    key = _cart_key(user_id)
    await redis.hset(key, str(product_id), quantity)
    await redis.expire(key, CART_TTL)
    return await get_cart(user_id)


async def remove_from_cart(user_id: uuid.UUID, product_id: uuid.UUID) -> dict[str, int]:
    """Remove a single product from the cart."""
    redis = get_redis()
    key = _cart_key(user_id)
    removed = await redis.hdel(key, str(product_id))
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not in cart.",
        )
    return await get_cart(user_id)


async def clear_cart(user_id: uuid.UUID) -> None:
    """Delete the entire cart (called after a successful order)."""
    redis = get_redis()
    await redis.delete(_cart_key(user_id))
