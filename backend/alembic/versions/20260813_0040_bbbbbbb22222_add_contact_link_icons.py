"""add_contact_link_icons

Revision ID: bbbbbbb22222
Revises: aaaaaaa11111
Create Date: 2026-08-13 00:40:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'bbbbbbb22222'
down_revision: str | None = 'aaaaaaa11111'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('contact_links', sa.Column('icon_data', sa.LargeBinary(), nullable=True))
    op.add_column('contact_links', sa.Column('icon_mime', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('contact_links', 'icon_mime')
    op.drop_column('contact_links', 'icon_data')
