from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ChatSessionCreate(BaseModel):
    resume_id: UUID


class ChatSessionResponse(BaseModel):
    id: UUID
    resume_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1)


class ChatMessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
