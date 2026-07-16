from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel

from app.schemas.aioutputs import ATSReport, CoachReport, GeneralCVReport, RecruiterReport


class ResumeAnalysisResponse(BaseModel):
    id: UUID
    original_filename: str
    overall_score: float
    ats_score: float
    recruiter_score: float
    coach_score: float
    cv_analytics: GeneralCVReport | None = None
    ats_analytics: ATSReport | None = None
    recruiter_analytics: RecruiterReport | None = None
    coach_analytics: CoachReport | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeHistoryItem(BaseModel):
    id: UUID
    original_filename: str
    overall_score: float
    ats_score: float
    recruiter_score: float
    coach_score: float
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    latest: ResumeAnalysisResponse | None
    history: List[ResumeHistoryItem]
