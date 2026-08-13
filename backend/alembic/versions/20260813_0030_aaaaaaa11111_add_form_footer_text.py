"""add_form_footer_text

Revision ID: aaaaaaa11111
Revises: 96995a85652a
Create Date: 2026-08-13 00:30:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'aaaaaaa11111'
down_revision: str | None = '96995a85652a'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('contact_config', sa.Column('form_footer_text', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('contact_config', 'form_footer_text')
