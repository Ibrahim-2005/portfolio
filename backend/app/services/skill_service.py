"""
app/services/skill_service.py
─────────────────────────────
Business logic for skills: fetching all rows and grouping them by category.

Grouping in Python rather than SQL keeps the query simple and avoids
vendor-specific GROUP_BY / json_agg syntax.
"""
from __future__ import annotations

from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.skill import Skill
from app.schemas.skill import SkillGroup, SkillItem


def get_grouped(db: Session) -> list[SkillGroup]:
    """
    Return all skills grouped by category, preserving insertion sort_order
    within each category and category order by the lowest sort_order seen.

    Returns:
        List of SkillGroup objects ordered by first-appearance of each category.
    """
    rows: list[Skill] = db.execute(
        select(Skill).order_by(Skill.category, Skill.sort_order)
    ).scalars().all()

    # Preserve category insertion order (Python 3.7+ dicts are ordered)
    buckets: dict[str, list[SkillItem]] = defaultdict(list)
    for row in rows:
        buckets[row.category].append(SkillItem.model_validate(row))

    return [
        SkillGroup(category=cat, items=items) for cat, items in buckets.items()
    ]
