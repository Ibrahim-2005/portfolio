"""
routers/public/resume.py  — PUBLIC (unauthenticated)
────────────────────────────────────────────────────
GET /api/resume → Serves the resume PDF file
"""
import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.core.config import settings

router = APIRouter(tags=["public:resume"])

@router.get(
    "/resume",
    response_class=FileResponse,
    summary="Download Resume PDF",
    description="Serves the portfolio's main resume PDF file.",
    responses={
        200: {"description": "The PDF file.", "content": {"application/pdf": {}}},
        404: {"description": "Resume PDF not found."}
    }
)
def get_resume():
    file_path = settings.RESUME_FILE_PATH
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume PDF not found")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename="Resume.pdf",
        content_disposition_type="inline"
    )
