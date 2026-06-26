"""Add soft-delete fields to products

Revision ID: 002_soft_delete_products
Revises: 001_initial
Create Date: 2026-06-26 22:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_soft_delete_products'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'products',
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false')
    )
    op.add_column(
        'products',
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('ix_products_is_deleted', 'products', ['is_deleted'], unique=False)
    op.create_index('ix_products_price', 'products', ['price'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_products_price', table_name='products')
    op.drop_index('ix_products_is_deleted', table_name='products')
    op.drop_column('products', 'deleted_at')
    op.drop_column('products', 'is_deleted')
