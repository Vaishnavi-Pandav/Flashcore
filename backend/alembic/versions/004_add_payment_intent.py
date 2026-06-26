"""add payment intent id to orders

Revision ID: 004_add_payment_intent
Revises: 003_drop_carts
Create Date: 2026-06-26 22:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '004_add_payment_intent'
down_revision: Union[str, None] = '003_drop_carts'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('orders', sa.Column('payment_intent_id', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_orders_payment_intent_id'), 'orders', ['payment_intent_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_orders_payment_intent_id'), table_name='orders')
    op.drop_column('orders', 'payment_intent_id')
