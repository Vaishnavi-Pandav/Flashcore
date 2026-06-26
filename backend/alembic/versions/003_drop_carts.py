"""drop cart tables

Revision ID: 003_drop_carts
Revises: 002_soft_delete_products
Create Date: 2026-06-26 22:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_drop_carts'
down_revision: Union[str, None] = '002_soft_delete_products'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table('cart_items')
    op.drop_table('carts')


def downgrade() -> None:
    pass
