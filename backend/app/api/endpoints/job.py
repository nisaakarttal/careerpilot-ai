from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.job import JobPost, JobMatch
from app.models.resume import Resume
from app.models.user import User
from app.schemas.job import JobPostCreate, JobPostResponse, JobMatchResponse
from app.services.aiservice import generate_job_match_report

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=JobPostResponse, status_code=status.HTTP_201_CREATED)
async def create_job_post(
    job_in: JobPostCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    job = JobPost(
        user_id=current_user.id,
        title=job_in.title,
        company=job_in.company,
        description=job_in.description,
    )
    session.add(job)
    await session.commit()
    await session.refresh(job)
    return job


@router.get("", response_model=List[JobPostResponse])
async def list_job_posts(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(JobPost)
        .where(JobPost.user_id == current_user.id)
        .order_by(JobPost.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{job_id}/match/{resume_id}", response_model=JobMatchResponse)
async def match_resume_to_job(
    job_id: UUID,
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Verify JobPost exists and belongs to user
    job_result = await session.execute(
        select(JobPost).where(JobPost.id == job_id, JobPost.user_id == current_user.id)
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job post not found."
        )

    # Verify Resume exists and belongs to user
    resume_result = await session.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id)
    )
    resume = resume_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    # Call AI match service
    try:
        match_detail = generate_job_match_report(resume.raw_text, job.description)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error generating AI job match: {str(exc)}"
        )

    job_match = JobMatch(
        job_id=job.id,
        resume_id=resume.id,
        match_score=float(match_detail.match_score),
        match_analytics=match_detail.model_dump(),
    )
    session.add(job_match)
    await session.commit()
    await session.refresh(job_match)
    return job_match


@router.get("/{job_id}/matches", response_model=List[JobMatchResponse])
async def get_job_matches(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Check if job belongs to user
    job_result = await session.execute(
        select(JobPost).where(JobPost.id == job_id, JobPost.user_id == current_user.id)
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job post not found."
        )

    result = await session.execute(
        select(JobMatch)
        .where(JobMatch.job_id == job_id)
        .order_by(JobMatch.created_at.desc())
    )
    return result.scalars().all()
