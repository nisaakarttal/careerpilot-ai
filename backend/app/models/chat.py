from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.resume import Resume


class ChatSession(SQLModel, table=True):
    __tablename__ = "chatsessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    resume_id: UUID = Field(foreign_key="resumes.id", nullable=False, index=True)

    created_at: datetime = Field(
        default_factory=lambda: datetime.utcnow(), nullable=False
    )

    # Relationships
    owner: Optional["User"] = Relationship()
    resume: Optional["Resume"] = Relationship()


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chatmessages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="chatsessions.id", nullable=False, index=True)

    role: str = Field(nullable=False)  # "user" veya "model"
    content: str = Field(nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.utcnow(), nullable=False
    )

    # Relationships
    session: Optional[ChatSession] = Relationship()
