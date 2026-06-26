import uuid
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str
    slug: str
    parent_id: Optional[uuid.UUID] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: Decimal
    stock: int
    category_id: uuid.UUID
    images: list[str] = []

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None
    category_id: Optional[uuid.UUID] = None
    images: Optional[list[str]] = None

class ProductResponse(ProductBase):
    id: uuid.UUID
    category: CategoryResponse
    model_config = ConfigDict(from_attributes=True)
