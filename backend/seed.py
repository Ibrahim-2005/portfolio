"""
seed.py
───────
Database seed script to populate initial portfolio data.
Run this after creating tables (alembic upgrade head).
"""
from app.core.database import SessionLocal
from app.models.project import Project
from app.models.section import Section
from app.models.skill import Skill
from app.models.home_config import HomeConfig
from app.models.about_config import AboutConfig
from app.models.projects_config import ProjectsConfig
from app.models.skills_config import SkillsConfig
from app.models.resume_config import ResumeConfig
from app.models.contact_config import ContactConfig
from app.models.public_settings import PublicSettings
from app.models.readme_config import ReadmeConfig
from app.models.certificates_config import CertificatesConfig


def seed_sections(db):
    if db.query(Section).first():
        print("Sections already exist. Skipping sections seed.")
        return

    print("Seeding sections...")
    
    # 1. Home
    home = Section(title="Home", slug="home", type="page", sort_order=1)
    db.add(home)

    # 2. About Me Folder
    about_me = Section(title="About Me", slug="about-me", type="folder", sort_order=2)
    db.add(about_me)
    db.flush() # To get about_me.id

    # Children of About Me
    bio_content = "> I'm Mohamed Ibrahim Y, a backend developer and final-year Computer Science Engineering student based in Chennai, India. I build and ship real, working software — REST APIs with JWT auth and rate limiting, CI/CD pipelines that actually run, and full-stack Flask applications that go from local machine to a live URL on Render or Railway.\n>\n> Outside of coursework, I split my time between software development, teaching, and freelance client work — which means I've had to get good at shipping things that work under real constraints, not just in a tutorial. This portfolio itself is one of those: it's not a static template, it's a FastAPI + PostgreSQL service with its own admin panel, because I'd rather build the thing than fake it."
    bio = Section(title="Bio", slug="bio", type="page", parent_id=about_me.id, content=bio_content, sort_order=1)
    
    edu_content = "> **B.E. Computer Science Engineering**\n> Dhaanish Ahmed College of Engineering — 2022–2026\n> CGPA: 8.01 / 10"
    edu = Section(title="Education", slug="education", type="page", parent_id=about_me.id, content=edu_content, sort_order=2)
    db.add_all([bio, edu])

    # 3. Projects
    projects = Section(title="Projects", slug="projects", type="page", sort_order=3)
    db.add(projects)

    # 4. Skills
    skills = Section(title="Skills", slug="skills", type="page", sort_order=4)
    db.add(skills)

    # 5. README
    readme_content = "> ## portfolio-os\n>\n> A developer portfolio that pretends to be VS Code — sidebar file tree, tabs, a working terminal, 13 switchable themes — backed by a real FastAPI + PostgreSQL API with a private CMS admin panel.\n>\n> **Why build it this way?** Because a portfolio *about* backend engineering should probably have some backend engineering in it. Every piece of content here — projects, skills, even this README — is a row in a database, editable through an admin panel, not hardcoded HTML.\n>\n> **Stack:** FastAPI · SQLAlchemy · PostgreSQL · vanilla JS · deployed on Render\n>\n> Check the sidebar. Try the terminal. Type `help`."
    readme = Section(title="README", slug="readme", type="page", content=readme_content, sort_order=5)
    db.add(readme)

    # 6. Files Folder
    files_folder = Section(title="Files", slug="files", type="folder", sort_order=6)
    db.add(files_folder)
    db.flush()

    # Children of Files
    resume = Section(title="Resume (PDF + inline)", slug="resume", type="page", parent_id=files_folder.id, sort_order=1)
    certs = Section(title="Certificates", slug="certificates", type="page", parent_id=files_folder.id, sort_order=2)
    db.add_all([resume, certs])

    # 7. Contact
    contact_content = "> Fill in with your real email, GitHub, LinkedIn, and any other social links before seeding — kept blank here intentionally since these weren't specified."
    contact = Section(title="Contact", slug="contact", type="page", content=contact_content, sort_order=7)
    db.add(contact)

    # Add Admin section (hidden)
    admin = Section(title="Admin", slug="admin", type="page", is_visible=False, sort_order=8)
    db.add(admin)

    db.commit()

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
    if db.query(Skill).first():
        print("Skills already exist. Skipping skills seed.")
        return

    print("Seeding skills...")
    
    skills_data = [
        # Backend
        ("Backend", "Python", 1),
        ("Backend", "Flask", 2),
        ("Backend", "FastAPI", 3),
        ("Backend", "SQLAlchemy", 4),
        ("Backend", "REST API design", 5),
        ("Backend", "JWT authentication", 6),
        ("Backend", "rate limiting", 7),
        ("Backend", "background jobs (APScheduler)", 8),
        
        # Database
        ("Database", "PostgreSQL", 1),
        ("Database", "SQLite", 2),
        ("Database", "schema design & normalization", 3),
        
        # DevOps / Deployment
        ("DevOps / Deployment", "GitHub Actions (CI/CD)", 1),
        ("DevOps / Deployment", "Render", 2),
        ("DevOps / Deployment", "Railway", 3),
        ("DevOps / Deployment", "Git version control", 4),
        
        # Frontend
        ("Frontend", "HTML", 1),
        ("Frontend", "CSS", 2),
        ("Frontend", "JavaScript", 3),
        ("Frontend", "responsive design", 4),
        
        # Testing
        ("Testing", "Pytest", 1),
        ("Testing", "API testing", 2),
        
        # Other
        ("Other", "Technical documentation", 1),
        ("Other", "code audits & remediation planning", 2),
        ("Other", "third-party API integration (Cloudinary, WhatsApp/CallMeBot)", 3),
    ]

    for category, name, order in skills_data:
        db.add(Skill(category=category, name=name, proficiency="Intermediate", sort_order=order))

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

    if not db.query(AboutConfig).filter(AboutConfig.id == 1).first():
        db.add(AboutConfig(
            id=1,
            top_text="// about me",
            big_text="About Me",
            tagline="Backend Developer & Student",
            about_me="> I'm Mohamed Ibrahim Y, a backend developer and final-year Computer Science Engineering student based in Chennai, India. I build and ship real, working software — REST APIs with JWT auth and rate limiting, CI/CD pipelines that actually run, and full-stack Flask applications that go from local machine to a live URL on Render or Railway.\n>\n> Outside of coursework, I split my time between software development, teaching, and freelance client work — which means I've had to get good at shipping things that work under real constraints, not just in a tutorial. This portfolio itself is one of those: it's not a static template, it's a FastAPI + PostgreSQL service with its own admin panel, because I'd rather build the thing than fake it.",
            current_focus=[],
            currently_learning=[]
        ))

    if not db.query(ProjectsConfig).filter(ProjectsConfig.id == 1).first():
        db.add(ProjectsConfig(
            id=1,
            top_text="// projects",
            heading="Projects",
            tagline=None
        ))

    if not db.query(SkillsConfig).filter(SkillsConfig.id == 1).first():
        db.add(SkillsConfig(
            id=1,
            top_text="// skills",
            heading="Skills",
            tagline=None
        ))

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

def main():
    db = SessionLocal()
    try:
        seed_sections(db)
        seed_projects(db)
        seed_skills(db)
        seed_singletons(db)
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
