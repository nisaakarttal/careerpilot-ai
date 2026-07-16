import re
import unicodedata
from dataclasses import dataclass


SEMANTIC_CONCEPTS: dict[str, tuple[str, ...]] = {
    "Python": ("python",),
    "Java": ("java",),
    "JavaScript": ("javascript", "java script", "js"),
    "TypeScript": ("typescript", "type script", "ts"),
    "React": ("react", "react.js", "reactjs"),
    "Next.js": ("next.js", "nextjs", "next js"),
    "Node.js": ("node.js", "nodejs", "node js"),
    "FastAPI": ("fastapi", "fast api"),
    "Django": ("django",),
    "Flask": ("flask",),
    "SQL": ("sql",),
    "PostgreSQL": ("postgresql", "postgres", "postgre sql"),
    "MongoDB": ("mongodb", "mongo db"),
    "Redis": ("redis",),
    "Docker": ("docker",),
    "Kubernetes": ("kubernetes", "k8s"),
    "Git": ("git", "github", "gitlab"),
    "REST API": ("rest api", "restful api", "rest servis"),
    "GraphQL": ("graphql", "graph ql"),
    "AWS": ("aws", "amazon web services"),
    "Azure": ("azure", "microsoft azure"),
    "Google Cloud": ("google cloud", "gcp"),
    "CI/CD": ("ci/cd", "cicd", "continuous integration", "continuous delivery"),
    "OpenAI": ("openai", "gpt-4", "gpt4"),
    "Gemini": ("gemini", "google genai"),
    "LangChain": ("langchain", "lang chain"),
    "Machine Learning": ("machine learning", "makine ogrenmesi"),
    "NLP": ("nlp", "natural language processing", "dogal dil isleme"),
    "Data Analysis": ("data analysis", "veri analizi", "data analytics"),
    "Agile": ("agile", "cevik"),
    "Scrum": ("scrum",),
    "English": ("english", "ingilizce"),
}

STOP_WORDS = {
    "aday",
    "aranan",
    "aranmaktadir",
    "bir",
    "biz",
    "bu",
    "calisma",
    "deneyim",
    "deneyimli",
    "ekip",
    "gibi",
    "gorev",
    "icin",
    "ile",
    "ilan",
    "is",
    "iyi",
    "olarak",
    "olan",
    "olmak",
    "pozisyon",
    "sahip",
    "takim",
    "tercihen",
    "ve",
    "veya",
    "yil",
}


@dataclass(frozen=True)
class MatchEvidence:
    keyword_match_score: int
    matched_keywords: tuple[str, ...]
    missing_keywords: tuple[str, ...]

    @property
    def has_evidence(self) -> bool:
        return bool(self.matched_keywords or self.missing_keywords)


def normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text).casefold()
    return normalized.translate(
        str.maketrans(
            {
                "ç": "c",
                "ğ": "g",
                "ı": "i",
                "ö": "o",
                "ş": "s",
                "ü": "u",
            }
        )
    )


def _contains_alias(text: str, alias: str) -> bool:
    normalized_alias = normalize_text(alias).strip()
    pattern = rf"(?<!\w){re.escape(normalized_alias)}(?!\w)"
    return re.search(pattern, text) is not None


def _extract_concepts(text: str) -> set[str]:
    normalized_text = normalize_text(text)
    return {
        label
        for label, aliases in SEMANTIC_CONCEPTS.items()
        if any(_contains_alias(normalized_text, alias) for alias in aliases)
    }


def _extract_fallback_keywords(text: str, limit: int = 20) -> list[str]:
    normalized_text = normalize_text(text)
    tokens = re.findall(r"[a-z0-9+#.]{3,}", normalized_text)
    keywords: list[str] = []

    for token in tokens:
        if token in STOP_WORDS or token.isdigit() or token in keywords:
            continue
        keywords.append(token)
        if len(keywords) == limit:
            break

    return keywords


def analyze_semantic_overlap(resume_text: str, job_description: str) -> MatchEvidence:
    resume_concepts = _extract_concepts(resume_text)
    job_concepts = _extract_concepts(job_description)

    if job_concepts:
        matched = sorted(job_concepts & resume_concepts)
        missing = sorted(job_concepts - resume_concepts)
    else:
        resume_tokens = set(_extract_fallback_keywords(resume_text, limit=100))
        job_tokens = _extract_fallback_keywords(job_description)
        matched = sorted(token for token in job_tokens if token in resume_tokens)
        missing = sorted(token for token in job_tokens if token not in resume_tokens)

    total = len(matched) + len(missing)
    score = round((len(matched) / total) * 100) if total else 0

    return MatchEvidence(
        keyword_match_score=score,
        matched_keywords=tuple(matched),
        missing_keywords=tuple(missing),
    )


def calibrate_match_score(ai_score: int, evidence: MatchEvidence) -> int:
    bounded_ai_score = max(0, min(100, ai_score))
    if not evidence.has_evidence:
        return bounded_ai_score

    calibrated_score = round(
        (bounded_ai_score * 0.85) + (evidence.keyword_match_score * 0.15)
    )
    return max(0, min(100, calibrated_score))
