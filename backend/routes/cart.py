"""
Cart Routes (Redis-backed)
───────────────────────────
GET    /cart                       → view current cart
POST   /cart/items                 → add / increment item
PATCH  /cart/items/{product_id}    → set exact quantity
DELETE /cart/items/{product_id}    → remove item
DELETE /cart                       → clear entire cart
"""

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
import uuid

from services.auth import get_current_user
from services import cart as cart_service
from models.user import User

router = APIRouter(prefix="/cart", tags=["cart"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CartItemIn(BaseModel):
    product_id: uuid.UUID
    quantity: int = 1

class CartItemPatch(BaseModel):
    quantity: int

class CartOut(BaseModel):
    items: dict[str, int]  # {product_id: quantity}
    item_count: int

    @classmethod
    def from_dict(cls, data: dict[str, int]) -> "CartOut":
        return cls(items=data, item_count=sum(data.values()))


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=CartOut)
async def get_cart(current_user: User = Depends(get_current_user)):
    """Return the current user's cart from Redis."""
    data = await cart_service.get_cart(current_user.id)
    return CartOut.from_dict(data)


@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
async def add_item(
    payload: CartItemIn,
    current_user: User = Depends(get_current_user),
):
    """Add a product to the cart (or increment its quantity)."""
    data = await cart_service.add_to_cart(
        current_user.id, payload.product_id, payload.quantity
    )
    return CartOut.from_dict(data)


@router.patch("/items/{product_id}", response_model=CartOut)
async def update_item_quantity(
    product_id: uuid.UUID,
    payload: CartItemPatch,
    current_user: User = Depends(get_current_user),
):
    """Set an exact quantity for a cart item. Set to 0 to remove."""
    data = await cart_service.set_item_quantity(
        current_user.id, product_id, payload.quantity
    )
    return CartOut.from_dict(data)


@router.delete("/items/{product_id}", response_model=CartOut)
async def remove_item(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
):
    """Remove a single item from the cart."""
    data = await cart_service.remove_from_cart(current_user.id, product_id)
    return CartOut.from_dict(data)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(current_user: User = Depends(get_current_user)):
    """Wipe the entire cart."""
    await cart_service.clear_cart(current_user.id)
