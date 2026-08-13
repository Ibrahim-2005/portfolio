"""
seed.py
───────
Database seed script to populate initial portfolio data.
Run this after creating tables (alembic upgrade head).
"""
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.about_config import AboutConfig
from app.models.certificates_config import CertificatesConfig
from app.models.contact_config import ContactConfig
from app.models.home_config import HomeConfig
from app.models.project import Project
from app.models.projects_config import ProjectsConfig
from app.models.public_settings import PublicSettings
from app.models.readme_config import ReadmeConfig
from app.models.resume_config import ResumeConfig
from app.models.skill import Skill
from app.models.skills_config import SkillsConfig


def seed_projects(db):
    if db.query(Project).first():
        print("Projects already exist. Skipping projects seed.")
        return

    print("Seeding projects...")
    
    p1 = Project(
        title="Job Tracker API",
        description="> A production-ready 12-endpoint REST API for tracking the full job application lifecycle — Applied → Interview → Offer/Rejected — with complete status-history logging via a normalized relational schema. Built with strict per-user data isolation in mind from day one.",
        tech_stack=["Flask", "PostgreSQL", "JWT (access/refresh)", "Flask-Caching", "Flask-Limiter", "APScheduler", "Pytest", "GitHub Actions"],
        highlights="\n".join([
            "JWT access/refresh authentication with strict per-user data isolation",
            "Response caching and rate limiting built in from the start",
            "Automated background jobs via APScheduler",
            "Full Pytest suite wired into GitHub Actions CI/CD"
        ]),
        sort_order=1
    )

    p2 = Project(
        title="Money Tracker (Expense & Income Tracking App)",
        description="> A full-stack personal finance web app for tracking expenses and income, with an interactive dashboard that gives instant income/expense/net-balance summaries. Built with a normalized schema and strict multi-user data isolation, so every user's financial data stays properly separated and secure.",
        tech_stack=["Flask", "SQLite", "HTML/CSS", "Session-based auth"],
        highlights="\n".join([
            "Normalized relational schema for users, categories, and transactions",
            "Secure CRUD with strict multi-user data isolation",
            "Optimized queries powering real-time financial summaries",
            "Server-side validation and error handling throughout"
        ]),
        sort_order=2
    )

    p3 = Project(
        title="Curated by Afza — Handmade Gifts E-Commerce",
        description="> A full Flask e-commerce platform built for a handmade gifts business, from initial build through a rigorous multi-audit technical review. Took the codebase through a 59-task, 14-phase remediation roadmap covering security hardening, a Cloudinary-backed media pipeline, and a full architectural cleanup.",
        tech_stack=["Flask", "Cloudinary", "CSS/JS modular refactor"],
        highlights="\n".join([
            "Refactored a monolithic stylesheet into 5 modular files and a monolithic JS file into 4 decoupled modules with a reusable cropper API",
            "Ran a full security and reliability audit, identifying and roadmapping fixes including an account-takeover path in the password reset flow",
            "Delivered brand identity work — logo iterations, social presence, print-ready business card assets",
            "Wrote a beginner-level full-codebase PDF study guide documenting the entire system"
        ]),
        sort_order=3
    )

    p4 = Project(
        title="Awaken Your Inner Power — Life Coaching Platform",
        description="> A complete Flask website built from scratch for a life-coaching business, live at awakenyourinnerpower.co.in. Owns and maintains the site end-to-end — from the booking system to the brand identity.",
        tech_stack=["Flask", "FullCalendar.js", "CallMeBot WhatsApp API", "Admin dashboard"],
        highlights="\n".join([
            "FullCalendar.js-powered booking system with WhatsApp notifications via CallMeBot",
            "Full custom admin dashboard for site management",
            "Complete brand system built around a lotus logo motif",
            "Professional README and MIT license — packaged like a real open-source-quality repo"
        ]),
        sort_order=4
    )

    db.add_all([p1, p2, p3, p4])
    db.commit()

def seed_skills(db):
    from app.models.skill_domain import SkillDomain

    print("Seeding skills and categories...")

    # 1. Seed Categories (Domains)
    categories = [
        ("Backend", 1),
        ("Databases", 2),
        ("Frontend", 3),
        ("Testing & Delivery", 4),
        ("Engineering Practices", 5),
    ]

    domain_map = {}
    for name, sort_order in categories:
        domain = db.execute(
            select(SkillDomain).where(SkillDomain.name == name)
        ).scalar_one_or_none()
        if not domain:
            domain = SkillDomain(name=name, sort_order=sort_order)
            db.add(domain)
            db.commit()
            db.refresh(domain)
        else:
            # Update sort_order if it already exists
            domain.sort_order = sort_order
            db.commit()
        domain_map[name] = domain.id

    # 2. Seed Skills
    skills_data = [
        # Backend
        ("Backend", "Python", "Core", 1),
        ("Backend", "Flask", "Core", 2),
        ("Backend", "FastAPI", "Hands-on", 3),
        ("Backend", "REST API Design", "Core", 4),
        ("Backend", "SQLAlchemy", "Hands-on", 5),
        ("Backend", "JWT Authentication", "Core", 6),
        ("Backend", "Rate Limiting", "Hands-on", 7),
        ("Backend", "Background Jobs / APScheduler", "Hands-on", 8),
        # Databases
        ("Databases", "PostgreSQL", "Core", 1),
        ("Databases", "SQLite", "Hands-on", 2),
        ("Databases", "Database Design", "Core", 3),
        ("Databases", "Schema Design & Normalization", "Core", 4),
        # Frontend
        ("Frontend", "HTML", "Hands-on", 1),
        ("Frontend", "CSS", "Hands-on", 2),
        ("Frontend", "JavaScript", "Hands-on", 3),
        ("Frontend", "Responsive UI", "Hands-on", 4),
        # Testing & Delivery
        ("Testing & Delivery", "Pytest", "Core", 1),
        ("Testing & Delivery", "API Testing", "Core", 2),
        ("Testing & Delivery", "Git & GitHub", "Core", 3),
        ("Testing & Delivery", "GitHub Actions / CI", "Hands-on", 4),
        ("Testing & Delivery", "Render", "Hands-on", 5),
        ("Testing & Delivery", "Railway", "Hands-on", 6),
        # Engineering Practices
        ("Engineering Practices", "Technical Documentation", "Core", 1),
        ("Engineering Practices", "API Integration", "Hands-on", 2),
        ("Engineering Practices", "Code Auditing & Remediation", "Hands-on", 3),
    ]

    for category_name, skill_name, level, sort_order in skills_data:
        domain_id = domain_map[category_name]

        # Check if skill exists
        skill = db.execute(
            select(Skill).where(Skill.name == skill_name, Skill.domain_id == domain_id)
        ).scalar_one_or_none()

        if not skill:
            skill = Skill(
                name=skill_name, domain_id=domain_id, level=level, sort_order=sort_order
            )
            db.add(skill)
        else:
            # Update existing skill
            skill.level = level
            skill.sort_order = sort_order

    db.commit()

def seed_singletons(db):
    print("Seeding singletons...")

    if not db.query(HomeConfig).filter(HomeConfig.id == 1).first():
        db.add(HomeConfig(
            id=1,
            top_text="// main.py",
            name="Mohamed Ibrahim Y",
            tagline="Building real, working software 🚀",
            intro="I build and ship real software — REST APIs, CI/CD pipelines, and full-stack apps that go from my machine to a live URL.",
            roles=[],
            social_links=[]
        ))

    about_cfg = db.query(AboutConfig).filter(AboutConfig.id == 1).first()
    if not about_cfg:
        db.add(AboutConfig(
            id=1,
            top_text="// who I am · what I build · where I'm headed",
            big_text="About Me",
            tagline="Backend Developer & Software Engineer",
            about_me="Hi, I'm Mohamed Ibrahim Y — a software engineer focused on backend development and building practical software.\n\nI enjoy turning ideas into working systems, from REST APIs and database design to authentication, testing, and deployment.",
            current_focus=[{"emoji": "⚙️", "text": "Building reliable backend systems"}, {"emoji": "🚀", "text": "Turning ideas into production software"}, {"emoji": "🧩", "text": "Exploring system design & API architecture"}],
            currently_learning=[{"emoji": "🐍", "text": "Python, FastAPI & Flask"}, {"emoji": "🗄️", "text": "PostgreSQL & SQLAlchemy"}, {"emoji": "🔧", "text": "APIs, testing & CI/CD"}],
            closing_title="ALWAYS BUILDING",
            closing_text="I learn best by building — taking an idea, turning it into a working system, debugging what breaks, and shipping it.\n\nCurrently focused on becoming a stronger software engineer with a deep focus on backend development."
        ))
    else:
        # Non-destructive upgrade for existing config
        if not about_cfg.closing_title:
            about_cfg.closing_title = "ALWAYS BUILDING"

        if not about_cfg.closing_text:
            about_cfg.closing_text = "I learn best by building — taking an idea, turning it into a working system, debugging what breaks, and shipping it.\n\nCurrently focused on becoming a stronger software engineer with a deep focus on backend development."

        # If the user hasn't customized the old text (or if it's empty), upgrade it
        if not about_cfg.about_me or about_cfg.about_me.startswith("> I'm Mohamed Ibrahim Y"):
            about_cfg.top_text = "// who I am · what I build · where I'm headed"
            about_cfg.tagline = "Backend Developer & Software Engineer"
            about_cfg.about_me = "Hi, I'm Mohamed Ibrahim Y — a software engineer focused on backend development and building practical software.\n\nI enjoy turning ideas into working systems, from REST APIs and database design to authentication, testing, and deployment."
            about_cfg.current_focus = [{"emoji": "⚙️", "text": "Building reliable backend systems"}, {"emoji": "🚀", "text": "Turning ideas into production software"}, {"emoji": "🧩", "text": "Exploring system design & API architecture"}]
            about_cfg.currently_learning = [{"emoji": "🐍", "text": "Python, FastAPI & Flask"}, {"emoji": "🗄️", "text": "PostgreSQL & SQLAlchemy"}, {"emoji": "🔧", "text": "APIs, testing & CI/CD"}]

    if not db.query(ProjectsConfig).filter(ProjectsConfig.id == 1).first():
        db.add(ProjectsConfig(
            id=1,
            top_text="// projects",
            heading="Projects",
            tagline=None
        ))

    skills_cfg = db.query(SkillsConfig).filter(SkillsConfig.id == 1).first()
    if not skills_cfg:
        db.add(SkillsConfig(
            id=1,
            top_text="// skills",
            heading="Skills",
            tagline="Technologies and engineering practices I use to build, test, and ship software."
        ))
    else:
        if not skills_cfg.tagline:
            skills_cfg.tagline = "Technologies and engineering practices I use to build, test, and ship software."

    if not db.query(ResumeConfig).filter(ResumeConfig.id == 1).first():
        db.add(ResumeConfig(
            id=1,
            top_text="// resume",
            heading="Resume",
            tagline=None,
            file_path=None
        ))

    if not db.query(ContactConfig).filter(ContactConfig.id == 1).first():
        db.add(ContactConfig(
            id=1,
            top_text="// contact",
            heading="Get in Touch",
            tagline=None
        ))

    if not db.query(PublicSettings).filter(PublicSettings.id == 1).first():
        db.add(PublicSettings(
            id=1,
            author_text=None,
            tech_stack_text=None
        ))

    if not db.query(ReadmeConfig).filter(ReadmeConfig.id == 1).first():
        readme_content = "> ## portfolio-os\n>\n> A developer portfolio that pretends to be VS Code — sidebar file tree, tabs, a working terminal, 13 switchable themes — backed by a real FastAPI + PostgreSQL API with a private CMS admin panel.\n>\n> **Why build it this way?** Because a portfolio *about* backend engineering should probably have some backend engineering in it. Every piece of content here — projects, skills, even this README — is a row in a database, editable through an admin panel, not hardcoded HTML.\n>\n> **Stack:** FastAPI · SQLAlchemy · PostgreSQL · vanilla JS · deployed on Render\n>\n> Check the sidebar. Try the terminal. Type `help`."
        db.add(ReadmeConfig(
            id=1,
            content=readme_content
        ))

    if not db.query(CertificatesConfig).filter(CertificatesConfig.id == 1).first():
        db.add(CertificatesConfig(
            id=1,
            content=None
        ))

    db.commit()

def seed_sidebar(db):
    from app.models.sidebar_item import SidebarItem
    print("Seeding Sidebar Items...")
    default_items = [
        {"slug": "home", "label": "Home", "sort_order": 1, "is_visible": True, "extension": None},
        {"slug": "about", "label": "About Me", "sort_order": 2, "is_visible": True, "extension": ".md"},
        {"slug": "projects", "label": "Projects", "sort_order": 3, "is_visible": True, "extension": None},
        {"slug": "skills", "label": "Skills", "sort_order": 4, "is_visible": True, "extension": ".md"},
        {"slug": "contact", "label": "Contact", "sort_order": 5, "is_visible": True, "extension": ".md"},
        {"slug": "readme", "label": "README", "sort_order": 6, "is_visible": True, "extension": ".md"},
        {"slug": "resume", "label": "Resume", "sort_order": 7, "is_visible": True, "extension": ".pdf"}
    ]

    for item_data in default_items:
        existing = db.execute(select(SidebarItem).where(SidebarItem.slug == item_data["slug"])).scalar_one_or_none()
        if not existing:
            new_item = SidebarItem(**item_data)
            db.add(new_item)

    # Remove the deprecated 'certificates' sidebar item if it exists
    deprecated = db.execute(select(SidebarItem).where(SidebarItem.slug == "certificates")).scalar_one_or_none()
    if deprecated:
        db.delete(deprecated)

    db.commit()
    print("Sidebar Items seeded successfully.")

def main():
    db = SessionLocal()
    try:
        seed_projects(db)
        seed_skills(db)
        seed_singletons(db)
        seed_sidebar(db)
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
