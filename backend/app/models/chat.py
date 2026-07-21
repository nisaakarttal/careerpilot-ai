from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any, Dict, Optional
from uuid import UUID, uuid4

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.resume import Resume


def _utc_now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


class ChatSession(SQLModel, table=True):
    __tablename__ = "chatsessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    resume_id: UUID = Field(foreign_key="resumes.id", nullable=False, index=True)
    assistant_type: str = Field(
        default="interview",
        max_length=32,
        nullable=False,
        index=True,
    )
    status: str = Field(
        default="active",
        max_length=16,
        nullable=False,
        index=True,
    )
    session_result: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB, nullable=False),
    )

    created_at: datetime = Field(
        default_factory=_utc_now, nullable=False
    )
    updated_at: datetime = Field(
        default_factory=_utc_now, nullable=False
    )
    completed_at: Optional[datetime] = Field(default=None, nullable=True)

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
        default_factory=_utc_now, nullable=False
    )

    # Relationships
    session: Optional[ChatSession] = Relationship()
