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


class JobMatchScoreBreakdown(BaseModel):
    technical_skills: int = Field(
        ge=0,
        le=100,
        description="Teknik yetkinlik eşleşmesi (0-100)",
    )
    experience_level: int = Field(
        ge=0,
        le=100,
        description="Deneyim ve kıdem seviyesi eşleşmesi (0-100)",
    )
    responsibilities: int = Field(
        ge=0,
        le=100,
        description="İş sorumluluklarıyla deneyim eşleşmesi (0-100)",
    )
    education_certifications: int = Field(
        ge=0,
        le=100,
        description="Eğitim ve sertifika eşleşmesi (0-100)",
    )
    domain_language: int = Field(
        ge=0,
        le=100,
        description="Sektör bilgisi ve dil gereksinimleri eşleşmesi (0-100)",
    )


class AIJobMatchDetail(BaseModel):
    match_score: int = Field(
        ge=0,
        le=100,
        description="Ağırlıklı kriterlere göre iş ilanı ile CV arasındaki semantik eşleşme yüzdesi (0-100)",
    )
    score_breakdown: JobMatchScoreBreakdown
    strong_fits: List[str] = Field(description="Adayın iş ilanı gereksinimleriyle uyuşan en güçlü yanları")
    missing_skills: List[str] = Field(description="İlanda istenen ama adayda eksik olan yetkinlikler veya anahtar kelimeler")
    improvements: List[str] = Field(description="Adayın bu pozisyona daha uygun hale gelmesi için özgeçmişinde yapabileceği iyileştirme önerileri")
    match_summary: str = Field(description="Eşleşmeye dair 3-4 cümlelik genel değerlendirme özeti")


class JobMatchDetail(AIJobMatchDetail):
    semantic_similarity_score: int = Field(
        default=0,
        ge=0,
        le=100,
        description="LangChain AI embeddings ile hesaplanan kosinüs benzerliği skoru (0-100)",
    )
    keyword_match_score: int = Field(
        default=0,
        ge=0,
        le=100,
        description="Yerel yetkinlik ve anahtar kelime örtüşme skoru (0-100)",
    )
    matched_keywords: List[str] = Field(
        default_factory=list,
        description="Hem iş ilanında hem özgeçmişte doğrulanan yetkinlikler",
    )
    missing_keywords: List[str] = Field(
        default_factory=list,
        description="İş ilanında bulunup özgeçmişte doğrulanamayan yetkinlikler",
    )


class JobMatchResponse(BaseModel):
    id: UUID
    job_id: UUID
    resume_id: UUID
    match_score: float
    match_analytics: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
