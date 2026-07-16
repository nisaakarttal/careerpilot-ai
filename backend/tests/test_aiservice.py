import unittest
from unittest.mock import patch

from langchain_core.language_models.fake_chat_models import FakeListChatModel
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables import RunnableSequence
from langchain_openai import ChatOpenAI

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
    def test_openai_chat_model_is_integrated_through_langchain(self):
        aiservice._chat_models.clear()

        with patch.object(
            aiservice.settings,
            "OPENAI_API_KEY",
            "test-openai-key",
        ):
            model = aiservice.get_openai_chat_model(temperature=0.1)

        self.assertIsInstance(model, ChatOpenAI)
        self.assertEqual(model.model_name, aiservice.settings.OPENAI_MODEL)
        aiservice._chat_models.clear()

    def test_sprint_one_v1_prompt_uses_100_point_scoring(self):
        prompt = aiservice.GENERAL_ANALYST_SYSTEM_PROMPT

        self.assertIn("v1 sürümüdür", prompt)
        self.assertIn("100 puanlık rubriğe", prompt)
        self.assertIn("overall_score", prompt)

    def test_json_output_parser_parses_pydantic_report(self):
        parser = aiservice.build_json_output_parser(ATSReport)

        self.assertIsInstance(parser, PydanticOutputParser)
        result = parser.parse(make_ats_report().model_dump_json())
        self.assertEqual(result.ats_score, 72)

    def test_langchain_lcel_chain_runs_prompt_model_and_json_parser(self):
        fake_model = FakeListChatModel(
            responses=[make_ats_report().model_dump_json()]
        )
        chain = aiservice.build_json_analysis_chain(
            system_prompt=aiservice.ATS_EXPERT_SYSTEM_PROMPT,
            response_model=ATSReport,
            temperature=0.2,
            model=fake_model,
        )

        self.assertIsInstance(chain, RunnableSequence)
        result = chain.invoke({"user_prompt": "Python geliştirici özgeçmişi"})
        self.assertEqual(result.ats_score, 72)

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

    @patch(
        "app.services.aiservice.calculate_semantic_similarity",
        return_value=80,
    )
    @patch("app.services.aiservice._parse_structured")
    def test_job_match_combines_langchain_embeddings_and_ai(
        self,
        parse_structured,
        calculate_similarity,
    ):
        parse_structured.return_value = make_job_match_report()

        result = aiservice.generate_job_match_report(
            "Python ve FastAPI ile API geliştirdim.",
            "Python, FastAPI ve Docker bilen geliştirici.",
        )

        calculate_similarity.assert_called_once()
        self.assertEqual(result.semantic_similarity_score, 80)
        self.assertEqual(result.keyword_match_score, 67)
        self.assertEqual(result.matched_keywords, ["FastAPI", "Python"])
        self.assertEqual(result.missing_keywords, ["Docker"])
        self.assertEqual(result.match_score, 72)
        self.assertIs(
            parse_structured.call_args.kwargs["response_model"],
            AIJobMatchDetail,
        )
        self.assertIn(
            "OpenAI embedding kosinüs benzerliği: 80/100",
            parse_structured.call_args.kwargs["user_prompt"],
        )

    def test_recruiter_chain_is_langchain_runnable_sequence(self):
        fake_model = FakeListChatModel(
            responses=[make_recruiter_report().model_dump_json()]
        )

        chain = aiservice.build_recruiter_chain(model=fake_model)

        self.assertIsInstance(chain, RunnableSequence)

    def test_recruiter_chain_receives_ats_context(self):
        fake_model = FakeListChatModel(
            responses=[make_recruiter_report().model_dump_json()]
        )
        chain = aiservice.build_recruiter_chain(model=fake_model)
        ats_report = make_ats_report()

        with patch(
            "app.services.aiservice.build_recruiter_chain",
            return_value=chain,
        ):
            result = aiservice.generate_recruiter_report(
                "Python geliştirici özgeçmişi",
                ats_report=ats_report,
            )

        self.assertEqual(result.recruiter_score, 75)

    def test_interview_simulator_uses_langchain_chat_model(self):
        fake_model = FakeListChatModel(
            responses=["Özgeçmişinizi inceledim. İlk projenizi nasıl geliştirdiniz?"]
        )

        with patch(
            "app.services.aiservice.get_openai_chat_model",
            return_value=fake_model,
        ) as get_model:
            result = aiservice.generate_interview_chat_response(
                "Python ve FastAPI projeleri geliştirdim.",
                history=[],
            )

        self.assertIn("İlk projenizi", result)
        get_model.assert_called_once_with(temperature=0.7)

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
            {
                **make_job_match_report().model_dump(),
                "semantic_similarity_score": 80,
                "keyword_match_score": 67,
            }
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
