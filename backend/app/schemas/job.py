from datetime import datetime
from typing import Any, Dict, List
from uuid import UUID

from pydantic import BaseModel, Field


class JobPostCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    company: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=10)


class JobPostResponse(BaseModel):
    id: UUID
    title: str
    company: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


class JobMatchDetail(BaseModel):
    match_score: int = Field(description="İş ilanı ile CV arasındaki semantik eşleşme yüzdesi (0-100)")
    strong_fits: List[str] = Field(description="Adayın iş ilanı gereksinimleriyle uyuşan en güçlü yanları")
    missing_skills: List[str] = Field(description="İlanda istenen ama adayda eksik olan yetkinlikler veya anahtar kelimeler")
    improvements: List[str] = Field(description="Adayın bu pozisyona daha uygun hale gelmesi için özgeçmişinde yapabileceği iyileştirme önerileri")
    match_summary: str = Field(description="Eşleşmeye dair 3-4 cümlelik genel değerlendirme özeti")


class JobMatchResponse(BaseModel):
    id: UUID
    job_id: UUID
    resume_id: UUID
    match_score: float
    match_analytics: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
