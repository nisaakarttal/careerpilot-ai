import unittest

from langchain_core.embeddings import Embeddings

from app.services.matching import (
    MatchEvidence,
    analyze_semantic_overlap,
    calculate_semantic_similarity,
    calibrate_match_score,
    cosine_similarity,
)


class StubEmbeddings(Embeddings):
    def __init__(self, vectors: list[list[float]]):
        self.vectors = vectors

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self.vectors

    def embed_query(self, text: str) -> list[float]:
        return self.vectors[0]


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

    def test_calculates_cosine_similarity(self):
        self.assertAlmostEqual(
            cosine_similarity([1.0, 1.0], [1.0, 0.0]),
            0.707106,
            places=5,
        )

    def test_uses_langchain_embeddings_for_semantic_score(self):
        embeddings = StubEmbeddings(
            [
                [1.0, 0.0],
                [0.8, 0.6],
            ]
        )

        score = calculate_semantic_similarity(
            "Python geliştirici özgeçmişi",
            "Backend geliştirici iş ilanı",
            embeddings=embeddings,
        )

        self.assertEqual(score, 80)

    def test_calibrates_ai_embedding_and_keyword_scores(self):
        evidence = MatchEvidence(
            keyword_match_score=80,
            matched_keywords=("Python",),
            missing_keywords=("Docker",),
        )

        self.assertEqual(calibrate_match_score(70, 80, evidence), 73)

    def test_calibrates_without_keyword_evidence(self):
        evidence = MatchEvidence(
            keyword_match_score=0,
            matched_keywords=(),
            missing_keywords=(),
        )

        self.assertEqual(calibrate_match_score(80, 60, evidence), 75)


if __name__ == "__main__":
    unittest.main()
