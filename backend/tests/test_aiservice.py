import unittest
from unittest.mock import patch

from app.schemas.aioutputs import ATSReport, RecruiterReport
from app.schemas.job import (
    AIJobMatchDetail,
    JobMatchDetail,
    JobMatchScoreBreakdown,
)
from app.services import aiservice


def make_ats_report() -> ATSReport:
    return ATSReport(
        ats_score=72,
        parsing_risk_level="düşük",
        formatting_issues=["Görsel biçim ham metinden doğrulanamıyor."],
        keyword_gaps=["Docker"],
        revised_bullets=[],
        ats_optimization_summary="Standart başlıklar ve ölçülebilir sonuçlar eklenmeli.",
    )


def make_recruiter_report() -> RecruiterReport:
    return RecruiterReport(
        recruiter_score=75,
        first_impression="Teknik temeli güçlü bir aday.",
        perceived_seniority="junior",
        hiring_risks=["Ölçülebilir çıktı az."],
        standout_signals=["Python ve FastAPI deneyimi."],
        interview_questions=[],
        recruiter_summary="Teknik görüşmeye alınabilir.",
    )


def make_job_match_report() -> AIJobMatchDetail:
    return AIJobMatchDetail(
        match_score=70,
        score_breakdown=JobMatchScoreBreakdown(
            technical_skills=80,
            experience_level=60,
            responsibilities=70,
            education_certifications=60,
            domain_language=70,
        ),
        strong_fits=["Python gereksinimi CV'de doğrulanıyor."],
        missing_skills=["Docker"],
        improvements=["Docker deneyimi edinildikten sonra CV'ye kanıtıyla eklenmeli."],
        match_summary="Temel teknik eşleşme var, ancak bazı gereksinimler eksik.",
    )


class AIServiceTests(unittest.TestCase):
    @patch("app.services.aiservice._parse_structured")
    def test_ats_report_uses_weighted_scoring_prompt(self, parse_structured):
        parse_structured.return_value = make_ats_report()

        result = aiservice.generate_ats_report("Python geliştirici özgeçmişi")

        self.assertEqual(result.ats_score, 72)
        call_kwargs = parse_structured.call_args.kwargs
        self.assertIn("100 puanlık rubriğe", call_kwargs["system_prompt"])
        self.assertIn("ham metinden doğrulanamıyor", call_kwargs["system_prompt"])
        self.assertIn("Python geliştirici özgeçmişi", call_kwargs["user_prompt"])
        self.assertEqual(call_kwargs["temperature"], 0.2)

    @patch("app.services.aiservice._parse_structured")
    def test_job_match_combines_ai_and_local_semantic_evidence(
        self,
        parse_structured,
    ):
        parse_structured.return_value = make_job_match_report()

        result = aiservice.generate_job_match_report(
            "Python ve FastAPI ile API geliştirdim.",
            "Python, FastAPI ve Docker bilen geliştirici.",
        )

        self.assertEqual(result.keyword_match_score, 67)
        self.assertEqual(result.matched_keywords, ["FastAPI", "Python"])
        self.assertEqual(result.missing_keywords, ["Docker"])
        self.assertEqual(result.match_score, 70)
        self.assertIs(
            parse_structured.call_args.kwargs["response_model"],
            AIJobMatchDetail,
        )

    @patch("app.services.aiservice._parse_structured")
    def test_recruiter_prompt_receives_ats_chain_context(self, parse_structured):
        parse_structured.return_value = make_recruiter_report()
        ats_report = make_ats_report()

        result = aiservice.generate_recruiter_report(
            "Python geliştirici özgeçmişi",
            ats_report=ats_report,
        )

        self.assertEqual(result.recruiter_score, 75)
        user_prompt = parse_structured.call_args.kwargs["user_prompt"]
        self.assertIn("ATS ÖN ANALİZİ", user_prompt)
        self.assertIn('"ats_score": 72', user_prompt)
        self.assertIn("Python geliştirici özgeçmişi", user_prompt)

    @patch("app.services.aiservice.generate_recruiter_report")
    @patch("app.services.aiservice.generate_job_match_report")
    @patch("app.services.aiservice.generate_ats_report")
    def test_recruiter_chain_passes_previous_results_to_final_step(
        self,
        generate_ats_report,
        generate_job_match_report,
        generate_recruiter_report,
    ):
        ats_report = make_ats_report()
        job_match_report = JobMatchDetail.model_validate(
            make_job_match_report().model_dump()
        )
        recruiter_report = make_recruiter_report()
        generate_ats_report.return_value = ats_report
        generate_job_match_report.return_value = job_match_report
        generate_recruiter_report.return_value = recruiter_report

        result = aiservice.run_recruiter_evaluation_chain(
            "Python geliştirici özgeçmişi",
            "Python geliştirici iş ilanı",
        )

        self.assertEqual(result, (ats_report, job_match_report, recruiter_report))
        generate_recruiter_report.assert_called_once_with(
            "Python geliştirici özgeçmişi",
            ats_report=ats_report,
            job_match_report=job_match_report,
        )


if __name__ == "__main__":
    unittest.main()
