"""
Product CRUD Routes
───────────────────
GET    /products              – paginated list with filters (category, price range, search)
GET    /products/{slug}       – single product with reviews
POST   /products              – admin only, creates product + uploads images to Cloudinary
PUT    /products/{id}         – admin only, partial update
DELETE /products/{id}         – admin only, soft-delete
GET    /products/categories   – list all categories
POST   /products/categories   – admin only, create category
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import (
    APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
)
from sqlalchemy import func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from database import get_db
from models.product import Product
from models.category import Category
from models.review import Review
from schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse,
    ProductDetailResponse, PaginatedProducts,
    CategoryCreate, CategoryResponse,
)
from services.auth import get_current_user
from services.cloudinary import upload_images
from models.user import User, UserRole

router = APIRouter(prefix="/products", tags=["products"])

# ─── Helper ──────────────────────────────────────────────────────────────────

def _require_admin(user: User) -> None:
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required."
        )

async def _get_product_by_id(db: AsyncSession, product_id: uuid.UUID) -> Product:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.id == product_id, Product.is_deleted.is_(False))
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


# ─── Categories ───────────────────────────────────────────────────────────────

@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    return result.scalars().all()


@router.post("/categories", response_model=CategoryResponse, status_code=201)
async def create_category(
    payload: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)
    # Check slug uniqueness
    existing = await db.execute(select(Category).where(Category.slug == payload.slug))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="A category with this slug already exists.")
    category = Category(**payload.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


# ─── GET /products ─────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedProducts)
async def list_products(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    search: Optional[str] = Query(None, description="Full-text search on name/description"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category UUID"),
    min_price: Optional[Decimal] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[Decimal] = Query(None, ge=0, description="Maximum price filter"),
):
    filters = [Product.is_deleted.is_(False)]

    if search:
        term = f"%{search.lower()}%"
        filters.append(
            (func.lower(Product.name).like(term)) | (func.lower(Product.description).like(term))
        )
    if category_id:
        filters.append(Product.category_id == category_id)
    if min_price is not None:
        filters.append(Product.price >= min_price)
    if max_price is not None:
        filters.append(Product.price <= max_price)

    # Total count (for pagination metadata)
    count_result = await db.execute(select(func.count()).select_from(Product).where(and_(*filters)))
    total = count_result.scalar_one()

    # Paginated results
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.category))
        .where(and_(*filters))
        .order_by(Product.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    products = result.scalars().all()

    return PaginatedProducts(total=total, skip=skip, limit=limit, items=products)


# ─── GET /products/{slug} ─────────────────────────────────────────────────────

@router.get("/{slug}", response_model=ProductDetailResponse)
async def get_product_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.category),
            selectinload(Product.reviews),
        )
        .where(Product.slug == slug, Product.is_deleted.is_(False))
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


# ─── POST /products ────────────────────────────────────────────────────────────

@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    # Use Form fields so we can also receive file uploads in the same request
    name: str = Form(...),
    slug: str = Form(...),
    description: Optional[str] = Form(None),
    price: Decimal = Form(...),
    stock: int = Form(...),
    category_id: uuid.UUID = Form(...),
    images: list[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)

    # Check slug uniqueness
    existing = await db.execute(
        select(Product).where(Product.slug == slug, Product.is_deleted.is_(False))
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="A product with this slug already exists.")

    # Validate category exists
    cat_result = await db.execute(select(Category).where(Category.id == category_id))
    if not cat_result.scalars().first():
        raise HTTPException(status_code=404, detail="Category not found.")

    # Upload images to Cloudinary
    image_urls: list[str] = []
    if images:
        image_urls = await upload_images(images)

    product = Product(
        name=name,
        slug=slug,
        description=description,
        price=price,
        stock=stock,
        category_id=category_id,
        images=image_urls,
    )
    db.add(product)
    await db.commit()

    result = await db.execute(
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.id == product.id)
    )
    return result.scalars().first()


# ─── PUT /products/{id} ────────────────────────────────────────────────────────

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: uuid.UUID,
    payload: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)
    product = await _get_product_by_id(db, product_id)

    updated_fields = payload.model_dump(exclude_unset=True)
    if not updated_fields:
        raise HTTPException(status_code=400, detail="No fields provided for update.")

    # Check slug uniqueness if slug is being changed
    if "slug" in updated_fields and updated_fields["slug"] != product.slug:
        existing = await db.execute(
            select(Product).where(
                Product.slug == updated_fields["slug"],
                Product.id != product_id,
                Product.is_deleted.is_(False),
            )
        )
        if existing.scalars().first():
            raise HTTPException(status_code=400, detail="Slug already in use by another product.")

    for field, value in updated_fields.items():
        setattr(product, field, value)

    await db.commit()

    result = await db.execute(
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.id == product_id)
    )
    return result.scalars().first()


# ─── DELETE /products/{id} ────────────────────────────────────────────────────

@router.delete("/{product_id}", status_code=200)
async def soft_delete_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)
    product = await _get_product_by_id(db, product_id)

    product.is_deleted = True
    product.deleted_at = datetime.now(timezone.utc)

    await db.commit()
    return {"detail": f"Product '{product.name}' has been soft-deleted.", "id": str(product_id)}
