"""
app/services/section_service.py
────────────────────────────────
Business logic for sections:
  - build_tree()     : convert a flat DB result into a nested tree in Python
  - get_by_slug()    : single-section lookup with a 404 guard

Keeping this out of the route handler makes it independently testable
and keeps the route thin (parse → call service → return).
"""
from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.section import Section
from app.schemas.section import SectionDetail, SectionNode


# ── Public helpers ────────────────────────────────────────────────────────────

def get_full_tree(db: Session) -> list[SectionNode]:
    """
    Return the complete sidebar tree for visible sections.

    Strategy:
      1. Fetch ALL visible sections in sort_order order — single query.
      2. Build id → SectionNode map.
      3. Walk the map: children attach to their parent; root nodes (parent_id=None)
         go into the result list.

    This is O(n) in Python and avoids recursive SQL / multiple round-trips.
    """
    rows: list[Section] = db.execute(
        select(Section)
        .where(Section.is_visible == True)  # noqa: E712
        .order_by(Section.sort_order)
    ).scalars().all()

    # Build a node for every row — force children empty here, since
    # model_validate() may auto-populate it from an ORM relationship
    # (Section.children), and we build it ourselves below instead.
    node_map: dict[int, SectionNode] = {}
    for row in rows:
        node = SectionNode.model_validate(row)
        node.children = []
        node_map[row.id] = node

    roots: list[SectionNode] = []
    for row in rows:
        node = node_map[row.id]
        if row.parent_id is None:
            roots.append(node)
        else:
            parent = node_map.get(row.parent_id)
            if parent is not None:
                parent.children.append(node)

    return roots


def get_by_slug(db: Session, slug: str) -> SectionDetail:
    """
    Return the full detail for a single visible section.

    Raises:
        HTTPException(404): if no visible section matches *slug*.
    """
    row: Section | None = db.execute(
        select(Section).where(
            Section.slug == slug,
            Section.is_visible == True,  # noqa: E712
        )
    ).scalar_one_or_none()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section '{slug}' not found.",
        )

    return SectionDetail.model_validate(row)


# ── Admin CRUD ────────────────────────────────────────────────────────────────

def _check_slug_unique(db: Session, slug: str, exclude_id: int | None = None) -> None:
    """Raise 400 if slug already exists."""
    query = select(Section).where(Section.slug == slug)
    if exclude_id is not None:
        query = query.where(Section.id != exclude_id)
    if db.execute(query).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Section with slug '{slug}' already exists.",
        )


def _check_parent_exists(db: Session, parent_id: int) -> None:
    """Raise 404 if parent_id does not exist."""
    if not db.execute(select(Section).where(Section.id == parent_id)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parent section with id {parent_id} not found.",
        )


def create_section(db: Session, payload) -> SectionDetail:
    """Create a new section."""
    _check_slug_unique(db, payload.slug)
    if payload.parent_id is not None:
        _check_parent_exists(db, payload.parent_id)

    row = Section(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return SectionDetail.model_validate(row)


def update_section(db: Session, section_id: int, payload) -> SectionDetail:
    """Update an existing section (partial)."""
    row = db.execute(select(Section).where(Section.id == section_id)).scalar_one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section with id {section_id} not found.",
        )

    if payload.slug is not None and payload.slug != row.slug:
        _check_slug_unique(db, payload.slug, exclude_id=section_id)
    if payload.parent_id is not None and payload.parent_id != row.parent_id:
        _check_parent_exists(db, payload.parent_id)

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return SectionDetail.model_validate(row)


def delete_section(db: Session, section_id: int) -> None:
    """Delete a section. Prevents deletion if it has children."""
    row = db.execute(select(Section).where(Section.id == section_id)).scalar_one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section with id {section_id} not found.",
        )

    # Check for children
    has_children = db.execute(
        select(Section).where(Section.parent_id == section_id)
    ).first()
    if has_children:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete section {section_id} because it has child sections.",
        )

    db.delete(row)
    db.commit()
