import json
from sqlalchemy import text
from sqlalchemy.orm import Session

KNOWN_ICONS = {
    "Flask": "flask",
    "PostgreSQL": "postgresql",
    "Python": "python",
    "FastAPI": "fastapi",
    "SQLAlchemy": "sqlalchemy",
    "SQLite": "sqlite",
    "HTML": "html",
    "CSS": "css",
    "JavaScript": "javascript",
    "Pytest": "pytest",
    "GitHub Actions": "github",
    "HTML/CSS": "html5",
}

PROFICIENCY_MAP = {
    "Beginner": 25,
    "Intermediate": 60,
    "Advanced": 80,
    "Expert": 95
}

def get_tech_icon(name: str) -> str | None:
    return KNOWN_ICONS.get(name)

def migrate_phase3_data(session: Session) -> dict:
    results = {
        "projects_migrated": 0,
        "skill_domains_created": 0,
        "skills_migrated": 0,
    }

    # 1. Migrate Skill Domains and Skills
    skills = session.execute(text("SELECT id, category, proficiency_legacy FROM skills")).fetchall()
    
    for skill_id, category, proficiency_legacy in skills:
        # Create or find domain
        domain = session.execute(
            text("SELECT id FROM skill_domains WHERE name = :name"),
            {"name": category}
        ).fetchone()
        
        if not domain:
            session.execute(
                text("INSERT INTO skill_domains (name, sort_order) VALUES (:name, 0)"),
                {"name": category}
            )
            domain = session.execute(
                text("SELECT id FROM skill_domains WHERE name = :name"),
                {"name": category}
            ).fetchone()
            results["skill_domains_created"] += 1
            
        domain_id = domain[0]
        
        # Map proficiency
        if proficiency_legacy not in PROFICIENCY_MAP:
            raise ValueError(f"Unknown legacy proficiency: {proficiency_legacy}")
        prof_value = PROFICIENCY_MAP[proficiency_legacy]
        
        # Update skill (idempotent: sets it exactly to the deterministic values every time)
        session.execute(
            text("UPDATE skills SET domain_id = :domain_id, proficiency = :prof WHERE id = :id"),
            {"domain_id": domain_id, "prof": prof_value, "id": skill_id}
        )
        results["skills_migrated"] += 1

    # 2. Migrate Projects Tech Stack
    projects = session.execute(text("SELECT id, tech_stack_legacy FROM projects")).fetchall()
    
    for proj_id, tech_legacy in projects:
        new_tech_stack = []
        if tech_legacy:
            # Handle list vs string (sqlite might give string if not properly JSON decoded, but postgres gives list)
            if isinstance(tech_legacy, str):
                try:
                    tech_list = json.loads(tech_legacy.replace("'", '"'))
                except:
                    # postgres array '{Flask,PostgreSQL}' raw text parsing fallback
                    tech_list = tech_legacy.strip("{}").split(",") if "{" in tech_legacy else []
            else:
                tech_list = tech_legacy
                
            for tech in tech_list:
                tech = tech.strip('"').strip()
                if tech:
                    new_tech_stack.append({
                        "name": tech,
                        "icon": get_tech_icon(tech)
                    })
        
        # Update project (idempotent)
        session.execute(
            text("UPDATE projects SET tech_stack = :tech_stack WHERE id = :id"),
            {"tech_stack": json.dumps(new_tech_stack), "id": proj_id}
        )
        results["projects_migrated"] += 1

    session.commit()
    return results
