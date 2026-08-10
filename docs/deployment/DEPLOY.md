# Deployment Guide (Render)

This repository is pre-configured for automated deployment to [Render](https://render.com). It uses a unified backend-frontend architecture where the FastAPI backend serves the compiled frontend assets directly, ensuring no cross-origin (CORS) issues and minimizing infrastructure complexity.

## Prerequisites
- A Render account
- A GitHub repository containing this source code

## 1. Create the Database

1. In the Render Dashboard, click **New** -> **PostgreSQL**.
2. Name it (e.g., `portfolio-os-db`).
3. Select your preferred region and tier (the Free tier is supported).
4. Click **Create Database**.
5. Once created, scroll down to the **Connections** section and copy the **Internal Database URL** (e.g., `postgresql://...`).

## 2. Deploy the Web Service

Because this repository contains a `render.yaml` Blueprint file, you can deploy the entire stack automatically:

### Option A: Using Blueprint (Recommended)
1. In the Render Dashboard, click **New** -> **Blueprint**.
2. Connect your GitHub repository.
3. Render will automatically detect `render.yaml`.
4. Fill in the required environment variables when prompted:
   - `ADMIN_EMAIL`: The email address you will use to log in to the admin panel.
   - `ADMIN_PASSWORD`: A strong password for the admin panel.
5. Click **Apply**.

*Note: The Blueprint automatically provisions both the Web Service and the PostgreSQL Database, configures the environment variables, and starts the initial deploy. You can skip Step 1 if you use the Blueprint, as Render handles the database provisioning for you.*

### Option B: Manual Web Service Creation
If you prefer not to use the Blueprint:
1. Click **New** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `portfolio-os-api` (or similar)
   - **Environment**: Python
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && alembic upgrade head && python create_admin.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add the following **Environment Variables**:
   - `DATABASE_URL`: Paste the Internal Database URL from Step 1.
   - `SECRET_KEY`: Generate a random string (e.g., `openssl rand -hex 32`) and paste it here.
   - `ADMIN_EMAIL`: The email address for your admin account.
   - `ADMIN_PASSWORD`: The plaintext password for your admin account.
5. Click **Create Web Service**.

## 3. Initial Setup & Migrations

The configuration is designed to be fully automated. When the service builds and starts, the `startCommand` will sequentially:
1. **Run Migrations:** `alembic upgrade head` ensures your database schema is strictly up-to-date. The application will intentionally refuse to start if migrations fail.
2. **Create Admin User:** `python create_admin.py` runs idempotently to create or update the admin credentials you supplied via `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
3. **Start the API:** `uvicorn` spins up the FastAPI server, listening on Render's dynamic `$PORT`.

If you wish to seed dummy data, you can SSH into the Render instance (via the **Shell** tab) and execute:
```bash
cd backend
python seed.py
```

## 4. Verification Checklist

Once the Render deploy is marked "Live", verify the following:

- [ ] **Frontend Loading**: Visit the public Render URL. The VS Code interface should load immediately.
- [ ] **API Connectivity**: Open the Terminal and type `help`.
- [ ] **Resume Viewing**: Click the `Resume` tab in the sidebar. It should successfully load the embedded PDF.
- [ ] **Admin Access**: Navigate to `[Render URL]/admin/index.html`.
- [ ] **Admin Authentication**: Log in using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you provided.
- [ ] **Database Persistence**: Add a test project in the admin interface, then verify it appears on the public frontend.

## 5. Troubleshooting

**"Internal Server Error" when accessing the site**
- Check the Render logs. This usually indicates that the database connection failed. Verify that `DATABASE_URL` matches the internal Postgres connection string.

**Sidebar is stuck loading or files do not appear**
- Inspect the browser console (F12). Ensure there are no Mixed Content errors (e.g., requesting `http://` from an `https://` domain). The frontend automatically routes API calls to `/api/`, avoiding this issue if served correctly.

**Admin login fails (HTTP 401)**
- Verify that `ADMIN_EMAIL` and `ADMIN_PASSWORD` are correctly set in the Render Environment Variables tab. The `create_admin.py` script will automatically update the password on the next deployment if you need to change it.

**Database Migrations Fail**
- Ensure you haven't manually modified the database schema outside of Alembic. If the schema is corrupted on a fresh install, delete the database on Render and recreate it.
