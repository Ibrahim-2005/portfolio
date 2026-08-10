"""
routers/admin/resume.py
───────────────────────
Admin endpoints for managing the resume binary upload.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.resume_file import ResumeFile

router = APIRouter(prefix="/resume", tags=["admin:resume"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    if not file_bytes.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Invalid PDF file.")

    instance = db.get(ResumeFile, 1)
    if not instance:
        instance = ResumeFile(id=1, filename=file.filename, file_data=file_bytes)
        db.add(instance)
    else:
        instance.filename = file.filename
        instance.file_data = file_bytes

    db.commit()

    return {"message": "Resume uploaded successfully", "filename": instance.filename}
