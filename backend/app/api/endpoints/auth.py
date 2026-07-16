from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from sqlalchemy import func

from app.api.deps import get_current_user
from app.core.database import get_session
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobPost, JobMatch
from app.models.chat import ChatSession
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    UserProfileResponse,
    UserProfileUpdate,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == payload.email))
    existing_user = result.scalar_one_or_none()
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    access_token = create_access_token(subject=user.email)
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    access_token = create_access_token(subject=user.email)
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    resumes_count = await session.execute(
        select(func.count(Resume.id)).where(Resume.user_id == current_user.id)
    )
    total_resumes = resumes_count.scalar() or 0

    jobs_count = await session.execute(
        select(func.count(JobPost.id)).where(JobPost.user_id == current_user.id)
    )
    total_jobs = jobs_count.scalar() or 0

    matches_count = await session.execute(
        select(func.count(JobMatch.id))
        .join(JobPost, JobMatch.job_id == JobPost.id)
        .where(JobPost.user_id == current_user.id)
    )
    total_matches = matches_count.scalar() or 0

    chats_count = await session.execute(
        select(func.count(ChatSession.id)).where(ChatSession.user_id == current_user.id)
    )
    total_chats = chats_count.scalar() or 0

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
        total_resumes=total_resumes,
        total_jobs=total_jobs,
        total_matches=total_matches,
        total_chats=total_chats
    )


@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if payload.email is not None and payload.email != current_user.email:
        result = await session.execute(select(User).where(User.email == payload.email))
        existing_user = result.scalar_one_or_none()
        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )
        current_user.email = payload.email

    if payload.full_name is not None:
        current_user.full_name = payload.full_name

    if payload.password is not None:
        current_user.hashed_password = hash_password(payload.password)

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)

    resumes_count = await session.execute(
        select(func.count(Resume.id)).where(Resume.user_id == current_user.id)
    )
    total_resumes = resumes_count.scalar() or 0

    jobs_count = await session.execute(
        select(func.count(JobPost.id)).where(JobPost.user_id == current_user.id)
    )
    total_jobs = jobs_count.scalar() or 0

    matches_count = await session.execute(
        select(func.count(JobMatch.id))
        .join(JobPost, JobMatch.job_id == JobPost.id)
        .where(JobPost.user_id == current_user.id)
    )
    total_matches = matches_count.scalar() or 0

    chats_count = await session.execute(
        select(func.count(ChatSession.id)).where(ChatSession.user_id == current_user.id)
    )
    total_chats = chats_count.scalar() or 0

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
        total_resumes=total_resumes,
        total_jobs=total_jobs,
        total_matches=total_matches,
        total_chats=total_chats
    )

