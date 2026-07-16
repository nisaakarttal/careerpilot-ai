import unittest

from app.services.matching import (
    MatchEvidence,
    analyze_semantic_overlap,
    calibrate_match_score,
)


class SemanticMatchingTests(unittest.TestCase):
    def test_matches_skill_aliases_and_reports_gaps(self):
        resume_text = "Python, FastAPI, PostgreSQL ve GitHub ile API geliştirdim."
        job_description = (
            "Python ve Fast API bilen, PostgreSQL, Docker ve Git deneyimli geliştirici."
        )

        evidence = analyze_semantic_overlap(resume_text, job_description)

        self.assertEqual(
            evidence.matched_keywords,
            ("FastAPI", "Git", "PostgreSQL", "Python"),
        )
        self.assertEqual(evidence.missing_keywords, ("Docker",))
        self.assertEqual(evidence.keyword_match_score, 80)

    def test_uses_keyword_fallback_when_no_known_skill_exists(self):
        evidence = analyze_semantic_overlap(
            "Müşteri ilişkileri ve raporlama tecrübesi",
            "Müşteri raporlama ve bütçeleme",
        )

        self.assertIn("musteri", evidence.matched_keywords)
        self.assertIn("butceleme", evidence.missing_keywords)

    def test_calibrates_ai_score_with_local_evidence(self):
        evidence = MatchEvidence(
            keyword_match_score=80,
            matched_keywords=("Python",),
            missing_keywords=("Docker",),
        )

        self.assertEqual(calibrate_match_score(70, evidence), 72)

    def test_keeps_ai_score_when_there_is_no_local_evidence(self):
        evidence = MatchEvidence(
            keyword_match_score=0,
            matched_keywords=(),
            missing_keywords=(),
        )

        self.assertEqual(calibrate_match_score(74, evidence), 74)


if __name__ == "__main__":
    unittest.main()
