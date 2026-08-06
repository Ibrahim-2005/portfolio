# Git Workflow — PortfolioOS

A clean commit history mapped to your actual build phases, so the repo itself becomes part of the portfolio's story — a recruiter scrolling your commit log should see a coherent build, not a pile of "fix" and "asdf" commits.

## 1. Commit Message Format (Conventional Commits)

```
<type>(<scope>): <short summary>

[optional body — why, not what]
```

**Types:**
- `feat` — new functionality
- `fix` — bug fix
- `refactor` — code change that isn't a fix or feature
- `chore` — tooling, config, deps
- `docs` — documentation only
- `test` — adding/updating tests
- `style` — formatting, no logic change

**Scope** = the area touched, matching `project-structure.md`: `backend`, `frontend`, `admin`, `themes`, `terminal`, `ci`, `deploy`.

**Examples, mapped to your actual phases:**
```
feat(backend): scaffold FastAPI project structure and SQLAlchemy models
feat(backend): add public sections/projects/skills read endpoints
feat(backend): add contact and guestbook write endpoints with rate limiting
chore(backend): seed database with real bio, education, and project content
test(backend): add pytest coverage for sections and contact endpoints

feat(frontend): build static VS Code shell layout (sidebar, tabs, terminal, statusbar)
feat(frontend): wire sidebar and tabs to live section data
feat(themes): implement 10 base editor themes with command palette switcher
feat(themes): add Project Hail Mary, Interstellar, and F1 easter-egg themes with pets and cursors
feat(frontend): implement full responsive breakpoints and touch handling
feat(frontend): add global keyboard shortcut system

feat(admin): add JWT auth and protected admin routes
feat(admin): build content editor for sections, projects, and skills
feat(admin): add messages inbox, guestbook moderation, and analytics dashboard

feat(frontend): add resume download and inline viewer
chore(ci): add GitHub Actions workflow for lint and pytest
docs: add DEPLOY.md with Render deployment steps
chore(deploy): configure Render services and environment variables
```

## 2. Commit Granularity
One commit per completed, working checklist item from `implementation-plan.md` — not one giant commit per phase, not one commit per file. A phase like Phase 1 should produce 4-6 commits, not 1 and not 40. Rule of thumb: if you can describe it in one clean sentence and it runs without breaking anything else, it's commit-sized.

## 3. Branch Strategy
Keep it simple — this is a solo project, not a team repo:
- `main` — always deployable, never broken
- One short-lived branch per phase: `phase-1-backend`, `phase-2-frontend`, `phase-3-admin`, `phase-4-deploy`
- Merge each phase branch into `main` via a self-reviewed PR once its checkpoint (from `build-guide.md`) passes — this gives you a clean PR history too, which is a nice secondary signal if the repo's public

## 4. When to Make Your First Commit
Before running Prompt 1.1 — commit the repo skeleton first:
```
chore: initial commit — project structure, docs, .gitignore
```
This puts all 10 planning docs into the repo from commit #1, so the history *starts* with "here's the plan," which reads well to anyone browsing the log.

## 5. Essential `.gitignore`
```
# Python
__pycache__/
*.pyc
.venv/
venv/
.env

# Node (if any tooling)
node_modules/

# Editor/OS
.vscode/
.DS_Store

# Secrets — never commit these
.env
*.pem
credentials.json
```

## 6. Rules to Keep the History Clean
- Never commit directly to `main` once Phase 1 starts — always through a phase branch
- Never commit secrets, even temporarily — if it happens, rotate the credential immediately, don't just delete it in a later commit (it's still in history)
- Squash obviously messy in-progress commits (typo fixes, "wip", "oops") before merging a phase branch — `git rebase -i` or just squash-merge the PR
- Write the commit body when the *why* isn't obvious from the summary alone — e.g. "chore: switch resume storage to S3-style pattern" deserves a line explaining you're avoiding committing binary PDFs to git
- Tag the final deploy: `git tag v1.0 -m "PortfolioOS v1.0 — live on Render"` once Phase 4 ships — small touch, looks intentional

## 7. README Timing
Don't write the final polished `README.md` until Phase 4. Keep a minimal placeholder README from commit #1 (just title + one-line description) so the repo isn't empty, but the real one — with the CI badge, live link, and tech stack — gets written once there's something real to show.
