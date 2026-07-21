import json
import logging
from datetime import UTC, datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import delete, select
from starlette.concurrency import run_in_threadpool

from app.api.deps import get_current_user
from app.core.database import get_session, AsyncSessionLocal
from app.core.security import decode_access_token
from app.models.chat import ChatMessage, ChatSession
from app.models.resume import Resume
from app.models.user import User
from app.schemas.chat import (
    AssistantType,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionResponse,
    ChatSessionStatus,
)
from app.core.config import settings
from app.services.aiservice import (
    generate_assistant_chat_response,
    generate_session_completion,
)

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


def _utc_now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


async def _generate_reply(
    assistant_type: str,
    resume_text: str,
    history: list[dict],
) -> str:
    return await run_in_threadpool(
        generate_assistant_chat_response,
        assistant_type,
        resume_text,
        history,
    )


async def _generate_completion(
    assistant_type: str,
    resume_text: str,
    history: list[dict],
) -> dict:
    result = await run_in_threadpool(
        generate_session_completion,
        assistant_type,
        resume_text,
        history,
    )
    return result.model_dump()


async def _load_memory_messages(
    session: AsyncSession,
    session_id: UUID,
) -> list[dict]:
    messages_result = await session.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(settings.CHAT_MEMORY_MAX_MESSAGES)
    )
    messages = list(reversed(messages_result.scalars().all()))
    return [
        {"role": message.role, "content": message.content}
        for message in messages
    ]


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

    chat_session = ChatSession(
        user_id=current_user.id,
        resume_id=resume.id,
        assistant_type=session_in.assistant_type,
    )

    try:
        first_reply = await _generate_reply(
            session_in.assistant_type,
            resume.raw_text,
            history=[],
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to create AI assistant session")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI asistan oturumu şu anda başlatılamıyor.",
        ) from exc

    first_message = ChatMessage(
        session_id=chat_session.id,
        role="model",
        content=first_reply,
    )
    session.add(chat_session)
    session.add(first_message)
    await session.commit()
    await session.refresh(chat_session)

    return chat_session


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(
    resume_id: UUID | None = None,
    assistant_type: AssistantType | None = None,
    session_status: ChatSessionStatus | None = Query(default=None, alias="status"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    statement = select(ChatSession).where(ChatSession.user_id == current_user.id)
    if resume_id is not None:
        statement = statement.where(ChatSession.resume_id == resume_id)
    if assistant_type is not None:
        statement = statement.where(ChatSession.assistant_type == assistant_type)
    if session_status is not None:
        statement = statement.where(ChatSession.status == session_status)

    result = await session.execute(statement.order_by(ChatSession.updated_at.desc()))
    return result.scalars().all()


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
    if chat_session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tamamlanmış bir oturuma yeni mesaj gönderilemez.",
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

    mapped_history = await _load_memory_messages(session, session_id)

    try:
        ai_reply = await _generate_reply(
            chat_session.assistant_type,
            resume.raw_text,
            mapped_history,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to generate AI assistant response")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI asistan şu anda yanıt üretemiyor.",
        ) from exc

    # Save AI response message
    ai_message = ChatMessage(
        session_id=session_id,
        role="model",
        content=ai_reply,
    )
    session.add(ai_message)
    chat_session.updated_at = _utc_now()
    session.add(chat_session)
    await session.commit()
    await session.refresh(ai_message)

    return ai_message


@router.post(
    "/sessions/{session_id}/complete",
    response_model=ChatSessionResponse,
)
async def complete_chat_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    session_result = await session.execute(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id,
        )
    )
    chat_session = session_result.scalar_one_or_none()
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found.",
        )
    if chat_session.status == "completed":
        return chat_session

    resume_result = await session.execute(
        select(Resume).where(
            Resume.id == chat_session.resume_id,
            Resume.user_id == current_user.id,
        )
    )
    resume = resume_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    messages_result = await session.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(settings.CHAT_COMPLETION_MAX_MESSAGES)
    )
    completion_messages = list(reversed(messages_result.scalars().all()))
    history = [
        {"role": message.role, "content": message.content}
        for message in completion_messages
    ]
    if not any(message["role"] == "user" for message in history):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Oturum değerlendirilmeden önce en az bir kullanıcı cevabı gerekir.",
        )

    try:
        completion = await _generate_completion(
            chat_session.assistant_type,
            resume.raw_text,
            history,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to complete AI assistant session")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI asistan değerlendirmesi şu anda tamamlanamıyor.",
        ) from exc

    completed_at = _utc_now()
    chat_session.status = "completed"
    chat_session.session_result = completion
    chat_session.updated_at = completed_at
    chat_session.completed_at = completed_at
    session.add(chat_session)
    await session.commit()
    await session.refresh(chat_session)
    return chat_session


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_chat_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    session_result = await session.execute(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id,
        )
    )
    chat_session = session_result.scalar_one_or_none()
    if not chat_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found.",
        )

    await session.execute(
        delete(ChatMessage).where(ChatMessage.session_id == session_id)
    )
    await session.delete(chat_session)
    await session.commit()


@router.websocket("/ws/{session_id}")
async def websocket_chat_endpoint(websocket: WebSocket, session_id: UUID):
    await websocket.accept()
    
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    email = decode_access_token(token)
    if not email:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Check session ownership in database
    async with AsyncSessionLocal() as db_session:
        result = await db_session.execute(
            select(ChatSession)
            .join(User, ChatSession.user_id == User.id)
            .where(ChatSession.id == session_id, User.email == email)
        )
        chat_session = result.scalar_one_or_none()
        if not chat_session:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        if chat_session.status != "active":
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
            
        resume_result = await db_session.execute(
            select(Resume).where(Resume.id == chat_session.resume_id)
        )
        resume = resume_result.scalar_one_or_none()
        if not resume:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
            
        resume_text = resume.raw_text
        assistant_type = chat_session.assistant_type

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg_data = json.loads(data)
                user_content = msg_data.get("content", "").strip()
            except Exception:
                user_content = data.strip()

            if not user_content:
                continue
            if len(user_content) > 4000:
                await websocket.send_text(json.dumps({
                    "error": "Mesaj en fazla 4000 karakter olabilir."
                }))
                continue

            async with AsyncSessionLocal() as db_session:
                user_message = ChatMessage(
                    session_id=session_id,
                    role="user",
                    content=user_content,
                )
                db_session.add(user_message)
                await db_session.commit()

                mapped_history = await _load_memory_messages(
                    db_session,
                    session_id,
                )

            try:
                ai_reply = await _generate_reply(
                    assistant_type,
                    resume_text,
                    mapped_history,
                )
            except Exception:
                logger.exception("WebSocket AI assistant response failed")
                await websocket.send_text(json.dumps({
                    "error": "AI asistan şu anda yanıt üretemiyor."
                }))
                continue

            async with AsyncSessionLocal() as db_session:
                ai_message = ChatMessage(
                    session_id=session_id,
                    role="model",
                    content=ai_reply,
                )
                db_session.add(ai_message)
                current_session_result = await db_session.execute(
                    select(ChatSession).where(ChatSession.id == session_id)
                )
                current_chat_session = current_session_result.scalar_one()
                current_chat_session.updated_at = _utc_now()
                db_session.add(current_chat_session)
                await db_session.commit()
                await db_session.refresh(ai_message)
                
                reply_data = {
                    "id": str(ai_message.id),
                    "session_id": str(ai_message.session_id),
                    "role": ai_message.role,
                    "content": ai_message.content,
                    "created_at": ai_message.created_at.isoformat()
                }

            await websocket.send_text(json.dumps(reply_data))

    except WebSocketDisconnect:
        pass
