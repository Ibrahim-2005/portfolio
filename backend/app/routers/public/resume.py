"""
routers/public/resume.py  — PUBLIC (unauthenticated)
────────────────────────────────────────────────────
GET /api/resume → Serves the resume PDF file
"""
import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.resume_file import ResumeFile

router = APIRouter(tags=["public:resume"])

@router.get(
    "/resume",
    summary="Download Resume PDF",
    description="Serves the portfolio's main resume PDF file.",
    responses={
        200: {"description": "The PDF file.", "content": {"application/pdf": {}}},
        404: {"description": "Resume PDF not found."}
    }
)
def get_resume(db: Session = Depends(get_db)):
    # Check for the dynamic database resume first
    db_resume = db.get(ResumeFile, 1)
    if db_resume and db_resume.file_data:
        return Response(
            content=db_resume.file_data,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "inline; filename=\"Resume.pdf\""
            }
        )

    # Fallback to the static legacy file
    file_path = settings.RESUME_FILE_PATH
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume PDF not found")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename="Resume.pdf",
        content_disposition_type="inline"
    )
