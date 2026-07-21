from datetime import datetime
from typing import Any, Dict, Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


AssistantType = Literal["interview", "career_coach"]
ChatSessionStatus = Literal["active", "completed"]


class ChatSessionCreate(BaseModel):
    resume_id: UUID
    assistant_type: AssistantType = "interview"


class ChatSessionResponse(BaseModel):
    id: UUID
    resume_id: UUID
    assistant_type: AssistantType
    status: ChatSessionStatus
    session_result: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)

    @field_validator("content")
    @classmethod
    def content_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Mesaj boş olamaz.")
        return value


class ChatMessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
