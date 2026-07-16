from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Dict, Optional
from uuid import UUID, uuid4

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.resume import Resume


class JobPost(SQLModel, table=True):
    __tablename__ = "jobposts"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)

    title: str = Field(nullable=False)
    company: str = Field(nullable=False)
    description: str = Field(nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    owner: Optional["User"] = Relationship()


class JobMatch(SQLModel, table=True):
    __tablename__ = "jobmatches"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    job_id: UUID = Field(foreign_key="jobposts.id", nullable=False, index=True)
    resume_id: UUID = Field(foreign_key="resumes.id", nullable=False, index=True)

    match_score: float = Field(default=0.0)
    match_analytics: Dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSONB, nullable=False)
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    job_post: Optional[JobPost] = Relationship()
    resume: Optional["Resume"] = Relationship()
