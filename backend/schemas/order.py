import uuid
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict
from .product import ProductResponse


class OrderItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int
    unit_price: Decimal

class OrderItemResponse(OrderItemBase):
    id: uuid.UUID
    product: ProductResponse
    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    items: list[OrderItemBase]

class OrderResponse(BaseModel):
    id: uuid.UUID
    status: str
    total: Decimal
    items: list[OrderItemResponse]
    model_config = ConfigDict(from_attributes=True)


class CartItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int

class CartItemResponse(CartItemBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

class CartResponse(BaseModel):
    id: uuid.UUID
    items: list[CartItemResponse]
    model_config = ConfigDict(from_attributes=True)


class ReviewCreate(BaseModel):
    rating: int
    body: Optional[str] = None

class ReviewResponse(ReviewCreate):
    id: uuid.UUID
    user_id: uuid.UUID
    product_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)
