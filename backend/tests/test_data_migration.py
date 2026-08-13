import json

import pytest
from sqlalchemy import inspect, text

from app.services.data_migration import migrate_phase3_data


def test_data_migration(db_session):
    # Setup initial mock data before migration

    # Clean tables
    db_session.execute(text("DELETE FROM skills"))
    db_session.execute(text("DELETE FROM skill_domains"))
    db_session.execute(text("DELETE FROM projects"))
    db_session.execute(text("DELETE FROM messages"))

    # SQLite test DB is created from current models which lack legacy columns, so we add them for the migration test
    inspector = inspect(db_session.bind)

    project_columns = {column["name"] for column in inspector.get_columns("projects")}
    skill_columns = {column["name"] for column in inspector.get_columns("skills")}

    if "tech_stack_legacy" not in project_columns:
        db_session.execute(
            text("ALTER TABLE projects ADD COLUMN tech_stack_legacy VARCHAR")
        )

    if "proficiency_legacy" not in skill_columns:
        db_session.execute(
            text("ALTER TABLE skills ADD COLUMN proficiency_legacy VARCHAR")
        )
    if "category" not in skill_columns:
        db_session.execute(text("ALTER TABLE skills ADD COLUMN category VARCHAR"))
    if "proficiency" not in skill_columns:
        db_session.execute(text("ALTER TABLE skills ADD COLUMN proficiency INTEGER DEFAULT 0"))

    db_session.commit()

    # 1. Insert Legacy Projects
    # Simulate both known and unknown tech stack
    tech_legacy = json.dumps(["Python", "Flask", "UnknownTech"])
    db_session.execute(
        text(
            "INSERT INTO projects (title, description, tech_stack_legacy, tech_stack, sort_order, featured) VALUES ('Proj1', 'Desc', :tech, '[]', 1, false)"
        ),
        {"tech": tech_legacy},
    )

    # 2. Insert Legacy Skills
    db_session.execute(
        text(
            "INSERT INTO skills (name, category, proficiency_legacy, sort_order, domain_id, proficiency, level) VALUES ('Python', 'Backend', 'Intermediate', 1, null, 0, 'Working')"
        )
    )
    db_session.execute(
        text(
            "INSERT INTO skills (name, category, proficiency_legacy, sort_order, domain_id, proficiency, level) VALUES ('HTML', 'Frontend', 'Expert', 2, null, 0, 'Working')"
        )
    )

    # 3. Insert Messages
    db_session.execute(
        text(
            "INSERT INTO messages (name, email, message, created_at, is_read, phone) VALUES ('John', 'j@m.com', 'Msg', CURRENT_TIMESTAMP, false, '+1234')"
        )
    )

    db_session.commit()

    # --- Execute Migration ---
    results1 = migrate_phase3_data(db_session)

    assert results1["projects_migrated"] == 1
    assert results1["skill_domains_created"] == 2
    assert results1["skills_migrated"] == 2

    # --- Verify Projects ---
    proj = db_session.execute(
        text(
            "SELECT tech_stack, tech_stack_legacy, featured FROM projects WHERE title = 'Proj1'"
        )
    ).fetchone()

    # Legacy unchanged
    assert proj.tech_stack_legacy == tech_legacy
    assert not proj.featured

    # New stack json verified
    stack = json.loads(proj.tech_stack)
    assert len(stack) == 3
    assert stack[0]["name"] == "Python"
    assert stack[0]["icon"] == "python"

    assert stack[1]["name"] == "Flask"
    assert stack[1]["icon"] == "flask"

    # Unsupported icon -> None
    assert stack[2]["name"] == "UnknownTech"
    assert stack[2]["icon"] is None

    # --- Verify Skills ---
    domains = db_session.execute(
        text("SELECT id, name FROM skill_domains ORDER BY name")
    ).fetchall()
    assert len(domains) == 2
    assert domains[0].name == "Backend"
    assert domains[1].name == "Frontend"

    s_backend = db_session.execute(
        text(
            "SELECT proficiency, proficiency_legacy, category FROM skills WHERE name = 'Python'"
        )
    ).fetchone()
    assert s_backend.category == "Backend"
    assert s_backend.proficiency_legacy == "Intermediate"
    assert s_backend.proficiency == 60  # Intermediate -> 60

    s_frontend = db_session.execute(
        text(
            "SELECT proficiency, proficiency_legacy, category FROM skills WHERE name = 'HTML'"
        )
    ).fetchone()
    assert s_frontend.category == "Frontend"
    assert s_frontend.proficiency_legacy == "Expert"
    assert s_frontend.proficiency == 95  # Expert -> 95

    msg = db_session.execute(
        text("SELECT phone FROM messages WHERE name = 'John'")
    ).fetchone()
    assert msg.phone == "+1234"

    # --- Verify Idempotency ---
    results2 = migrate_phase3_data(db_session)
    # the function iterates over all rows and does the same assignments
    assert results2["projects_migrated"] == 1
    assert results2["skill_domains_created"] == 0  # No new domains
    assert results2["skills_migrated"] == 2

    # Data is exactly the same
    proj2 = db_session.execute(
        text(
            "SELECT tech_stack, tech_stack_legacy, featured FROM projects WHERE title = 'Proj1'"
        )
    ).fetchone()
    assert proj2.tech_stack == proj.tech_stack


def test_migration_unknown_proficiency(db_session):
    # Setup
    db_session.execute(text("DELETE FROM skills"))
    db_session.execute(text("DELETE FROM skill_domains"))
    db_session.execute(text("DELETE FROM projects"))
    db_session.execute(text("DELETE FROM messages"))
    inspector = inspect(db_session.bind)

    skill_columns = {column["name"] for column in inspector.get_columns("skills")}

    if "proficiency_legacy" not in skill_columns:
        db_session.execute(text("ALTER TABLE skills ADD COLUMN proficiency_legacy VARCHAR"))
    if "category" not in skill_columns:
        db_session.execute(text("ALTER TABLE skills ADD COLUMN category VARCHAR"))
    if "proficiency" not in skill_columns:
        db_session.execute(text("ALTER TABLE skills ADD COLUMN proficiency INTEGER DEFAULT 0"))
    db_session.commit()

    # Insert unknown proficiency
    db_session.execute(
        text(
            "INSERT INTO skills (name, category, proficiency_legacy, sort_order, domain_id, proficiency, level) VALUES ('Python', 'Backend', 'Jedi', 1, null, 0, 'Working')"
        )
    )
    db_session.commit()

    with pytest.raises(ValueError, match="Unknown legacy proficiency: Jedi"):
        migrate_phase3_data(db_session)


def test_migration_postgres_array_list(monkeypatch):
    # Test that the migration handles actual lists returned by PostgreSQL driver
    # We monkeypatch the session to mock the returned projects
    from unittest.mock import MagicMock

    mock_session = MagicMock()

    # Mocking skills to return empty
    def mock_execute(statement, *args, **kwargs):
        mock_result = MagicMock()
        if "FROM skills" in str(statement):
            mock_result.fetchall.return_value = []
        elif "FROM projects" in str(statement):
            # Return real Python list instead of string
            mock_result.fetchall.return_value = [
                (1, ["Python", "Flask", "UnknownTech"])
            ]
        return mock_result

    mock_session.execute.side_effect = mock_execute

    results = migrate_phase3_data(mock_session)
    assert results["projects_migrated"] == 1

    # Check that update was called correctly
    update_call = None
    for call in mock_session.execute.call_args_list:
        stmt = str(call[0][0])
        if "UPDATE projects" in stmt:
            update_call = call
            break

    assert update_call is not None
    params = update_call[0][1]

    # Verify the JSON was generated correctly from the list
    stack = json.loads(params["tech_stack"])
    assert len(stack) == 3
    assert stack[0]["name"] == "Python"
    assert stack[1]["name"] == "Flask"
    assert stack[2]["name"] == "UnknownTech"
    assert stack[2]["icon"] is None
