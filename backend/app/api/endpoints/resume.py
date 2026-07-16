from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_session, AsyncSessionLocal
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import DashboardResponse, ResumeAnalysisResponse, ResumeHistoryItem
from app.services.aiservice import (
    generate_general_report,
    generate_ats_report,
    generate_recruiter_report,
    generate_coach_report,
)
from app.services.parser import extract_resume_text

router = APIRouter(prefix="/resume", tags=["resume"])


async def analyze_resume_task(resume_id: UUID, resume_text: str):
    # 1. General analysis
    try:
        general_report = generate_general_report(resume_text)
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Resume).where(Resume.id == resume_id))
            resume = result.scalar_one_or_none()
            if resume:
                resume.overall_score = float(general_report.overall_score)
                resume.cv_analytics = general_report.model_dump()
                session.add(resume)
                await session.commit()
    except Exception as exc:
        print(f"Error in general analysis: {exc}")
        return

    # 2. ATS analysis
    try:
        ats_report = generate_ats_report(resume_text)
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Resume).where(Resume.id == resume_id))
            resume = result.scalar_one_or_none()
            if resume:
                resume.ats_score = float(ats_report.ats_score)
                resume.ats_analytics = ats_report.model_dump()
                session.add(resume)
                await session.commit()
    except Exception as exc:
        print(f"Error in ATS analysis: {exc}")
        return

    # 3. Recruiter analysis
    try:
        recruiter_report = generate_recruiter_report(resume_text)
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Resume).where(Resume.id == resume_id))
            resume = result.scalar_one_or_none()
            if resume:
                resume.recruiter_score = float(recruiter_report.recruiter_score)
                resume.recruiter_analytics = recruiter_report.model_dump()
                session.add(resume)
                await session.commit()
    except Exception as exc:
        print(f"Error in Recruiter analysis: {exc}")
        return

    # 4. Coach analysis
    try:
        coach_report = generate_coach_report(resume_text)
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Resume).where(Resume.id == resume_id))
            resume = result.scalar_one_or_none()
            if resume:
                resume.coach_score = float(coach_report.coach_score)
                resume.coach_analytics = coach_report.model_dump()
                session.add(resume)
                await session.commit()
    except Exception as exc:
        print(f"Error in Coach analysis: {exc}")
        return


def _resume_to_response(resume: Resume) -> ResumeAnalysisResponse:
    return ResumeAnalysisResponse(
        id=resume.id,
        original_filename=resume.original_filename,
        overall_score=resume.overall_score,
        ats_score=resume.ats_score,
        recruiter_score=resume.recruiter_score,
        coach_score=resume.coach_score,
        cv_analytics=resume.cv_analytics if resume.cv_analytics else None,
        ats_analytics=resume.ats_analytics if resume.ats_analytics else None,
        recruiter_analytics=resume.recruiter_analytics if resume.recruiter_analytics else None,
        coach_analytics=resume.coach_analytics if resume.coach_analytics else None,
        created_at=resume.created_at,
    )


@router.post("/upload", response_model=ResumeAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    resume_text = await extract_resume_text(file, settings.MAX_UPLOAD_SIZE_MB)

    resume = Resume(
        user_id=current_user.id,
        original_filename=file.filename or "resume",
        raw_text=resume_text,
        overall_score=0.0,
        ats_score=0.0,
        recruiter_score=0.0,
        coach_score=0.0,
        cv_analytics={},
        ats_analytics={},
        recruiter_analytics={},
        coach_analytics={},
        created_at=datetime.utcnow(),
    )

    session.add(resume)
    await session.commit()
    await session.refresh(resume)

    background_tasks.add_task(analyze_resume_task, resume.id, resume_text)

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