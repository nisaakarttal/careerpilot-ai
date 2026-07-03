from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Dict, Optional
from uuid import UUID, uuid4

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User


class Resume(SQLModel, table=True):
    __tablename__ = "resumes"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)

    original_filename: str = Field(nullable=False)
    raw_text: str = Field(nullable=False)

    overall_score: float = Field(default=0.0)
    ats_score: float = Field(default=0.0)
    recruiter_score: float = Field(default=0.0)
    coach_score: float = Field(default=0.0)

    cv_analytics: Dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSONB, nullable=False)
    )
    ats_analytics: Dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSONB, nullable=False)
    )
    recruiter_analytics: Dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSONB, nullable=False)
    )
    coach_analytics: Dict[str, Any] = Field(
        default_factory=dict, sa_column=Column(JSONB, nullable=False)
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    owner: Optional["User"] = Relationship(back_populates="resumes")
