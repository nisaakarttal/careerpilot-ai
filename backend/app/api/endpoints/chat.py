from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.chat import ChatMessage, ChatSession
from app.models.resume import Resume
from app.models.user import User
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionResponse,
)
from app.services.aiservice import generate_interview_chat_response

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    session_in: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Verify resume belongs to user
    resume_result = await session.execute(
        select(Resume).where(Resume.id == session_in.resume_id, Resume.user_id == current_user.id)
    )
    resume = resume_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    # Create Chat Session
    chat_session = ChatSession(
        user_id=current_user.id,
        resume_id=resume.id,
    )
    session.add(chat_session)
    await session.commit()
    await session.refresh(chat_session)

    # Generate first AI question
    try:
        first_question = generate_interview_chat_response(resume.raw_text, history=[])
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate first interview question: {str(exc)}"
        )

    # Save first AI question to messages
    first_message = ChatMessage(
        session_id=chat_session.id,
        role="model",
        content=first_question,
    )
    session.add(first_message)
    await session.commit()

    return chat_session


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
async def list_session_messages(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Verify session belongs to user
    session_result = await session.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    chat_session = session_result.scalar_one_or_none()
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found."
        )

    # Get messages
    messages_result = await session.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
    )
    return messages_result.scalars().all()


@router.post("/sessions/{session_id}/message", response_model=ChatMessageResponse)
async def send_chat_message(
    session_id: UUID,
    message_in: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Verify session belongs to user
    session_result = await session.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    chat_session = session_result.scalar_one_or_none()
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found."
        )

    # Fetch resume text
    resume_result = await session.execute(
        select(Resume).where(Resume.id == chat_session.resume_id)
    )
    resume = resume_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    # Save User message
    user_message = ChatMessage(
        session_id=session_id,
        role="user",
        content=message_in.content,
    )
    session.add(user_message)
    await session.commit()

    # Load entire conversation history
    messages_result = await session.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
    )
    history_messages = messages_result.scalars().all()

    # Map to list of dicts for AI service
    mapped_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
    ]

    # Generate AI response
    try:
        ai_reply = generate_interview_chat_response(resume.raw_text, history=mapped_history)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to get AI response: {str(exc)}"
        )

    # Save AI response message
    ai_message = ChatMessage(
        session_id=session_id,
        role="model",
        content=ai_reply,
    )
    session.add(ai_message)
    await session.commit()
    await session.refresh(ai_message)

    return ai_message
