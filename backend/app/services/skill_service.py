"""
app/services/skill_service.py
─────────────────────────────
Business logic for skills: fetching all rows and grouping them by category.

Grouping in Python rather than SQL keeps the query simple and avoids
vendor-specific GROUP_BY / json_agg syntax.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.skill import Skill
from app.models.skill_domain import SkillDomain
from app.schemas.skill import SkillGroup, SkillItem


def get_grouped(db: Session) -> list[SkillGroup]:
    """
    Return all skills grouped by their domain, preserving the domain's sort_order
    and the skill's sort_order within each domain.
    """
    rows = db.execute(
        select(Skill)
        .join(Skill.domain)
        .order_by(SkillDomain.sort_order, Skill.sort_order)
    ).scalars().all()

    buckets: dict[str, dict] = {}

    for row in rows:
        domain_name = row.domain.name
        if domain_name not in buckets:
            buckets[domain_name] = {
                "category": domain_name,
                "sort_order": row.domain.sort_order,
                "items": []
            }
        buckets[domain_name]["items"].append(SkillItem.model_validate(row))

    return [
        SkillGroup(
            category=data["category"],
            sort_order=data["sort_order"],
            items=data["items"]
        )
        for data in buckets.values()
    ]
