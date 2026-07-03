from typing import List

from pydantic import BaseModel, Field


class SectionScore(BaseModel):
    section_name: str = Field(description="Name of the CV section, e.g. Experience, Education, Skills")
    score: int = Field(description="Score for this section from 0 to 100")
    comment: str = Field(description="Short justification for the score")


class GeneralCVReport(BaseModel):
    candidate_summary: str = Field(description="Two to three sentence summary of the candidate profile")
    job_title_fit: List[str] = Field(description="List of job titles this CV is best fitted for")
    overall_score: int = Field(description="Overall CV quality score from 0 to 100")
    section_scores: List[SectionScore] = Field(description="Score breakdown per CV section")
    strengths: List[str] = Field(description="Key strengths identified in the CV")
    weaknesses: List[str] = Field(description="Key weaknesses identified in the CV")
    missing_sections: List[str] = Field(description="Sections that are missing or underdeveloped")
    top_fixes: List[str] = Field(description="Top prioritized fixes the candidate should make")


class RevisedBullet(BaseModel):
    original: str = Field(description="Original bullet point text from the CV")
    revised: str = Field(description="Rewritten bullet using X-Y-Z formula: Accomplished X as measured by Y by doing Z")
    reason: str = Field(description="Why the revision improves ATS and recruiter perception")


class ATSReport(BaseModel):
    ats_score: int = Field(description="ATS compatibility score from 0 to 100")
    parsing_risk_level: str = Field(description="Risk level for ATS parsing failure: low, medium, or high")
    formatting_issues: List[str] = Field(description="List of formatting problems that could break ATS parsing")
    keyword_gaps: List[str] = Field(description="Important industry or role keywords missing from the CV")
    revised_bullets: List[RevisedBullet] = Field(description="Bullet points rewritten using the X-Y-Z formula")
    ats_optimization_summary: str = Field(description="Summary of how to optimize this CV for ATS systems")


class InterviewQuestion(BaseModel):
    question: str = Field(description="Likely interview question a recruiter would ask based on this CV")
    reasoning: str = Field(description="Why a recruiter would ask this, based on CV content")


class RecruiterReport(BaseModel):
    recruiter_score: int = Field(description="Score representing overall recruiter appeal from 0 to 100")
    first_impression: str = Field(description="What a recruiter would think in the first 6 seconds of scanning this CV")
    perceived_seniority: str = Field(description="Perceived seniority level: junior, mid, senior, lead, executive")
    hiring_risks: List[str] = Field(description="Red flags or risks a recruiter might perceive")
    standout_signals: List[str] = Field(description="Signals that make the candidate stand out positively")
    interview_questions: List[InterviewQuestion] = Field(description="Questions a recruiter is likely to ask")
    recruiter_summary: str = Field(description="Overall recruiter perspective summary")


class RoadmapItem(BaseModel):
    timeframe: str = Field(description="Timeframe for this roadmap item, e.g. 0-1 month, 1-3 months, 3-6 months")
    action: str = Field(description="Concrete action the candidate should take in this timeframe")
    expected_outcome: str = Field(description="Expected career outcome from completing this action")


class CoachReport(BaseModel):
    coach_score: int = Field(description="Overall career coaching readiness score from 0 to 100")
    career_positioning: str = Field(description="Recommended career positioning and narrative strategy")
    confidence_boosters: List[str] = Field(description="Encouraging, specific points to boost candidate confidence")
    development_priorities: List[str] = Field(description="Skills or experiences the candidate should prioritize developing")
    interview_preparation_plan: List[str] = Field(description="Step-by-step interview preparation plan")
    roadmap: List[RoadmapItem] = Field(description="Career development roadmap with timeframes")
    coach_summary: str = Field(description="Overall career coach summary and encouragement")


class MasterCareerPilotOutput(BaseModel):
    general_report: GeneralCVReport
    ats_report: ATSReport
    recruiter_report: RecruiterReport
    coach_report: CoachReport
