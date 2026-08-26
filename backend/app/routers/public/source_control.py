"""
app/routers/public/source_control.py
───────────────────────────────────
Public endpoint to fetch dynamic GitHub repository & main-branch status
for the Source Control panel.
"""
import time
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Request

from app.core.config import settings
from app.core.limiter import limiter

router = APIRouter(tags=["Source Control"])

# In-memory cache for GitHub API data to respect rate limits
_CACHE: dict = {
    "data": None,
    "timestamp": 0,
    "ttl_seconds": 60,
}


def _format_relative_time(date_str: str) -> str:
    """Format an ISO 8601 UTC timestamp to a human-friendly relative time."""
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        diff = now - dt

        seconds = int(diff.total_seconds())
        if seconds < 60:
            return "just now"
        minutes = seconds // 60
        if minutes < 60:
            return f"{minutes}m ago" if minutes > 1 else "1m ago"
        hours = minutes // 60
        if hours < 24:
            return f"{hours}h ago" if hours > 1 else "1h ago"
        days = hours // 24
        if days < 30:
            return f"{days}d ago" if days > 1 else "1d ago"
        return dt.strftime("%b %d, %Y")
    except Exception:
        return date_str[:10] if date_str else "recently"


@router.get("/source-control")
@limiter.limit("30/minute")
async def get_source_control_status(request: Request):
    """
    Fetch live GitHub repository and latest commit status on the main branch.
    Uses in-memory caching to minimize GitHub API calls.
    """
    now = time.time()
    if _CACHE["data"] and (now - _CACHE["timestamp"]) < _CACHE["ttl_seconds"]:
        return _CACHE["data"]

    repo = settings.GITHUB_REPO.strip() or "Ibrahim-2005/portfolio"
    repo_url = f"https://github.com/{repo}"
    api_url = f"https://api.github.com/repos/{repo}/commits/main"

    headers = {
        "User-Agent": "PortfolioOS-API",
        "Accept": "application/vnd.github.v3+json",
    }
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN.strip()}"

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(api_url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                sha = data.get("sha", "")
                short_sha = sha[:7] if sha else "main"
                commit_obj = data.get("commit", {})
                author_obj = commit_obj.get("author", {})
                files = data.get("files", [])
                stats_obj = data.get("stats", {})

                # Calculate real file change counts from latest commit
                modified_cnt = sum(1 for f in files if f.get("status") == "modified")
                added_cnt = sum(1 for f in files if f.get("status") == "added")
                deleted_cnt = sum(1 for f in files if f.get("status") == "removed")

                # If no files breakdown was returned, fallback to stats total
                if not files and stats_obj:
                    modified_cnt = stats_obj.get("total", 0)

                raw_date = author_obj.get("date", "")
                result = {
                    "status": "ok",
                    "repo": repo,
                    "branch": "main",
                    "sha": sha,
                    "short_sha": short_sha,
                    "repo_url": repo_url,
                    "commit_url": data.get("html_url", repo_url),
                    "commit": {
                        "message": commit_obj.get("message", "").strip(),
                        "author": author_obj.get("name", "Author"),
                        "date": raw_date,
                        "relative_date": _format_relative_time(raw_date),
                    },
                    "stats": {
                        "modified": modified_cnt,
                        "added": added_cnt,
                        "deleted": deleted_cnt,
                        "additions": stats_obj.get("additions", 0),
                        "deletions": stats_obj.get("deletions", 0),
                        "total_files": len(files) if files else stats_obj.get("total", 0),
                    },
                }

                _CACHE["data"] = result
                _CACHE["timestamp"] = now
                return result

            # If rate limited or error, return cached data if we have it
            if _CACHE["data"]:
                return _CACHE["data"]

            return {
                "status": "error",
                "message": f"GitHub API returned {resp.status_code}",
                "repo": repo,
                "branch": "main",
                "repo_url": repo_url,
            }
    except Exception:
        if _CACHE["data"]:
            return _CACHE["data"]
        return {
            "status": "error",
            "message": "Unable to load repository status",
            "repo": repo,
            "branch": "main",
            "repo_url": repo_url,
        }
