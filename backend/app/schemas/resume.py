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
    cv_analytics: GeneralCVReport
    ats_analytics: ATSReport
    recruiter_analytics: RecruiterReport
    coach_analytics: CoachReport
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
