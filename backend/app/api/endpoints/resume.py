from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_session
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import DashboardResponse, ResumeAnalysisResponse, ResumeHistoryItem
from app.services.aiservice import run_full_analysis
from app.services.parser import extract_resume_text

router = APIRouter(prefix="/resume", tags=["resume"])


def _resume_to_response(resume: Resume) -> ResumeAnalysisResponse:
    return ResumeAnalysisResponse(
        id=resume.id,
        original_filename=resume.original_filename,
        overall_score=resume.overall_score,
        ats_score=resume.ats_score,
        recruiter_score=resume.recruiter_score,
        coach_score=resume.coach_score,
        cv_analytics=resume.cv_analytics,
        ats_analytics=resume.ats_analytics,
        recruiter_analytics=resume.recruiter_analytics,
        coach_analytics=resume.coach_analytics,
        created_at=resume.created_at,
    )


@router.post("/upload", response_model=ResumeAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    resume_text = await extract_resume_text(file, settings.MAX_UPLOAD_SIZE_MB)

    try:
        general_report, ats_report, recruiter_report, coach_report = run_full_analysis(
            resume_text
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unexpected error during AI analysis: {str(exc)}",
        ) from exc

    resume = Resume(
        user_id=current_user.id,
        original_filename=file.filename or "resume",
        raw_text=resume_text,
        overall_score=float(general_report.overall_score),
        ats_score=float(ats_report.ats_score),
        recruiter_score=float(recruiter_report.recruiter_score),
        coach_score=float(coach_report.coach_score),
        cv_analytics=general_report.model_dump(),
        ats_analytics=ats_report.model_dump(),
        recruiter_analytics=recruiter_report.model_dump(),
        coach_analytics=coach_report.model_dump(),
    )

    session.add(resume)
    await session.commit()
    await session.refresh(resume)

    return _resume_to_response(resume)


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
    )
    resumes = result.scalars().all()

    if not resumes:
        return DashboardResponse(latest=None, history=[])

    latest = _resume_to_response(resumes[0])
    history = [
        ResumeHistoryItem(
            id=r.id,
            original_filename=r.original_filename,
            overall_score=r.overall_score,
            ats_score=r.ats_score,
            recruiter_score=r.recruiter_score,
            coach_score=r.coach_score,
            created_at=r.created_at,
        )
        for r in resumes
    ]

    return DashboardResponse(latest=latest, history=history)


@router.get("/{resume_id}", response_model=ResumeAnalysisResponse)
async def get_resume_by_id(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume analysis not found.",
        )
    return _resume_to_response(resume)
