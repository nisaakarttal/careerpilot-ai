from fastapi import HTTPException, status
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.core.config import settings
from app.schemas.aioutputs import (
    ATSReport,
    CoachReport,
    GeneralCVReport,
    RecruiterReport,
)

_client: genai.Client | None = None


def get_gemini_client() -> genai.Client:
    global _client
    if _client is None:
        # Settings içindeki API key ismini projenize göre (örn: GEMINI_API_KEY) güncelleyebilirsiniz.
        # Eğer hala OPENAI_API_KEY adını kullanıyorsanız settings.OPENAI_API_KEY olarak bırakın.
        api_key = getattr(settings, "GEMINI_API_KEY", getattr(settings, "OPENAI_API_KEY", None))
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gemini API key is not configured on the server.",
            )
        _client = genai.Client(api_key=api_key)
    return _client


GENERAL_ANALYST_SYSTEM_PROMPT = """You are a veteran CV analyst with 15 years of experience \
reviewing resumes across technology, finance, and consulting industries. You evaluate CVs \
holistically: structure, clarity, impact, and overall professional presentation. You are \
honest but constructive. You always ground your scores in specific evidence found in the \
CV text provided. You never invent experience that is not present in the text."""

ATS_EXPERT_SYSTEM_PROMPT = """You are an Applicant Tracking System (ATS) optimization expert \
who has configured and audited ATS platforms such as Workday, Greenhouse, and Taleo. You \
detect formatting risks (tables, columns, images, unusual fonts, headers/footers, graphics) \
described or implied by the raw extracted text, missing standard section headers, and keyword \
gaps versus common industry terminology. When rewriting bullets, you strictly apply the X-Y-Z \
formula: "Accomplished [X] as measured by [Y], by doing [Z]" so every bullet has a concrete \
action, a quantifiable metric, and a method. If no metric exists in the original, you propose \
a reasonable placeholder metric pattern such as "by X%" and clearly instruct the candidate to \
replace it with their real number."""

RECRUITER_SYSTEM_PROMPT = """You are a senior technical recruiter and HR business partner who \
screens hundreds of CVs per month. You give a blunt, realistic first-impression assessment as \
if you had six seconds to scan this CV before deciding to move it to the next round. You \
identify seniority level from the language and scope of responsibility described, flag hiring \
risks (employment gaps, job hopping, vague accomplishments, mismatched career trajectory), and \
generate realistic interview questions a recruiter would actually ask based on what is written \
in the CV."""

CAREER_COACH_SYSTEM_PROMPT = """You are an executive career coach who helps candidates build \
confidence, position their careers strategically, and prepare for interviews. Your tone is \
encouraging, specific, and actionable. You build a realistic roadmap with concrete timeframes \
(0-1 month, 1-3 months, 3-6 months, 6-12 months) and tie every roadmap action to a measurable \
outcome. You never give generic advice; every recommendation must reference something specific \
from the candidate's CV."""


def _build_user_prompt(resume_text: str) -> str:
    return (
        "Analyze the following resume text that was extracted from an uploaded file. "
        "Base every observation strictly on this text.\n\n"
        "----- BEGIN RESUME TEXT -----\n"
        f"{resume_text}\n"
        "----- END RESUME TEXT -----"
    )


def _parse_structured(system_prompt: str, resume_text: str, response_model):
    client = get_gemini_client()

    # Model ismi için settings kontrolü (örn: gemini-2.5-flash veya gemini-2.5-pro)
    model_name = getattr(settings, "GEMINI_MODEL", getattr(settings, "OPENAI_MODEL", "gemini-2.5-flash"))

    try:
        # Gemini'de Structured Outputs için GenerateContentConfig kullanıyoruz
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.4,
            response_mime_type="application/json",
            response_schema=response_model,
        )

        response = client.models.generate_content(
            model=model_name,
            contents=_build_user_prompt(resume_text),
            config=config,
        )
    except APIError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI analysis failed: {str(exc)}",
        ) from exc

    # SDK, response_schema verdiğimizde veriyi otomatik olarak parse eder ve .parsed attribute'una ekler
    parsed = getattr(response, "parsed", None)
    if parsed is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI analysis returned no structured output.",
        )

    return parsed


def generate_general_report(resume_text: str) -> GeneralCVReport:
    return _parse_structured(GENERAL_ANALYST_SYSTEM_PROMPT, resume_text, GeneralCVReport)


def generate_ats_report(resume_text: str) -> ATSReport:
    return _parse_structured(ATS_EXPERT_SYSTEM_PROMPT, resume_text, ATSReport)


def generate_recruiter_report(resume_text: str) -> RecruiterReport:
    return _parse_structured(RECRUITER_SYSTEM_PROMPT, resume_text, RecruiterReport)


def generate_coach_report(resume_text: str) -> CoachReport:
    return _parse_structured(CAREER_COACH_SYSTEM_PROMPT, resume_text, CoachReport)


def run_full_analysis(resume_text: str):
    general_report = generate_general_report(resume_text)
    ats_report = generate_ats_report(resume_text)
    recruiter_report = generate_recruiter_report(resume_text)
    coach_report = generate_coach_report(resume_text)
    return general_report, ats_report, recruiter_report, coach_report