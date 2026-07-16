from typing import TypeVar

from fastapi import HTTPException, status
from langchain_core.exceptions import OutputParserException
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from openai import APIError
from pydantic import BaseModel

from app.core.config import settings
from app.schemas.aioutputs import (
    ATSReport,
    CoachReport,
    GeneralCVReport,
    RecruiterReport,
)
from app.schemas.job import AIJobMatchDetail, JobMatchDetail
from app.services.matching import (
    MatchEvidence,
    analyze_semantic_overlap,
    calculate_semantic_similarity,
    calibrate_match_score,
)

ReportT = TypeVar("ReportT", bound=BaseModel)
_chat_models: dict[str, Runnable] = {}


def get_chat_model(temperature: float = 0.4) -> Runnable:
    cache_key = f"{settings.AI_PROVIDER}_{temperature}"
    if cache_key not in _chat_models:
        if settings.AI_PROVIDER == "openai":
            if not settings.OPENAI_API_KEY:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="OPENAI_API_KEY sunucuda yapılandırılmamış.",
                )
            _chat_models[cache_key] = ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                model=settings.OPENAI_MODEL,
                temperature=temperature,
                max_retries=2,
            )
        elif settings.AI_PROVIDER == "gemini":
            if not settings.GEMINI_API_KEY:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="GEMINI_API_KEY sunucuda yapılandırılmamış.",
                )
            _chat_models[cache_key] = ChatGoogleGenerativeAI(
                google_api_key=settings.GEMINI_API_KEY,
                model=settings.GEMINI_MODEL,
                temperature=temperature,
                max_retries=2,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Bilinmeyen AI sağlayıcısı: {settings.AI_PROVIDER}",
            )
    return _chat_models[cache_key]


GENERAL_ANALYST_SYSTEM_PROMPT = """Sen teknoloji, finans ve danışmanlık sektörlerindeki özgeçmişleri inceleyen \
15 yıllık deneyime sahip uzman bir CV analistisin. Bu, CareerPilot CV analiz sistem promptunun v1 sürümüdür.

overall_score değerini aşağıdaki 100 puanlık rubriğe göre hesapla:

1. İçerik bütünlüğü ve standart CV bölümleri: 25 puan
2. Deneyimlerin etkisi ve ölçülebilir başarılar: 25 puan
3. Yetkinliklerin hedef rollerle uyumu: 20 puan
4. Netlik, okunabilirlik ve anlatım kalitesi: 15 puan
5. Profesyonel tutarlılık ve genel sunum: 15 puan

overall_score bu beş kriterde verilen puanların toplamı olmalı ve 0-100 aralığında kalmalıdır. section_scores \
alanında CV'de bulunan temel bölümleri ayrıca 0-100 arasında değerlendir. Dürüst ama yapıcı bir dil kullan. \
Verdiğin her puanı sağlanan CV metnindeki belirli kanıtlara dayandır. Metinde bulunmayan hiçbir deneyimi, \
yetkinliği veya başarıyı uydurma. Çıktılarını ve analizlerini her zaman Türkçe üret."""

ATS_EXPERT_SYSTEM_PROMPT = """Sen Workday, Greenhouse ve Taleo gibi ATS platformlarını kuran ve denetleyen \
bir Başvuru Takip Sistemi (ATS) optimizasyon uzmanısın. ATS uyumluluk puanını aşağıdaki 100 puanlık rubriğe \
göre hesaplamalısın:

1. Standart bölüm yapısı ve ayrıştırılabilirlik: 25 puan
2. Rol ve sektör anahtar kelimelerinin kapsamı: 25 puan
3. Ölçülebilir başarılar ve eylem odaklı anlatım: 20 puan
4. Okunabilirlik, netlik ve gereksiz tekrarların azlığı: 15 puan
5. Tarih, unvan, iletişim ve içerik tutarlılığı: 15 puan

ats_score bu beş kriterden verilen puanların toplamı olmalı ve 0-100 aralığında kalmalıdır. Her puan kaybını \
CV metninden somut bir kanıtla ilişkilendir. Sana yalnızca dosyadan çıkarılmış ham metin verildiği için sütun, \
resim, yazı tipi veya renk gibi görsel format sorunlarının gerçekten bulunduğunu iddia etme; doğrulanamayan \
görsel riskleri 'ham metinden doğrulanamıyor' şeklinde belirt. Anahtar kelime boşluklarını, CV'de görülen hedef \
rol ve sektör bağlamından çıkar; metinde olmayan deneyimleri uydurma.

Madde işaretlerini yeniden yazarken X-Y-Z formülünü uygula: '[Z] yaparak, [Y] ile ölçüldüğü üzere [X] başarıldı'. \
Orijinalinde metrik yoksa açıkça '[gerçek metrik]' yer tutucusunu kullan ve adaydan bunu gerçek veriyle \
değiştirmesini iste. Çıktılarını ve analizlerini her zaman Türkçe üret."""

RECRUITER_SYSTEM_PROMPT = """Sen ayda yüzlerce CV'yi eleyen kıdemli bir teknik işe alım uzmanı ve İK iş ortağısın. \
Bu CV'yi bir sonraki tura geçirip geçirmemeye karar vermeden önce taramak için altı saniyen varmış gibi net ve \
gerçekçi bir ilk izlenim değerlendirmesi yap. Kullanılan dilden ve açıklanan sorumluluk kapsamından kıdem \
seviyesini belirle, işe alım risklerini işaretle ve CV'de yazanlara dayanarak gerçekçi mülakat soruları üret.

Bu değerlendirme bir LangChain zincirinin son adımıdır. Sağlanan ATS ön analizini ve varsa iş ilanı eşleşme \
raporunu önceki zincir adımlarının bağlamı olarak kullan; ancak nihai değerlendirmeyi her zaman CV'deki \
doğrulanabilir kanıtlara dayandır. Metinde bulunmayan deneyimleri uydurma. Çıktılarını ve analizlerini her zaman \
Türkçe üret."""

CAREER_COACH_SYSTEM_PROMPT = """Sen adayların özgüven kazanmasına, kariyerlerini stratejik olarak konumlandırmasına \
ve mülakatlara hazırlanmasına yardımcı olan yönetici seviyesinde bir kariyer koçusun. Ses tonun cesaretlendirici, \
net ve uygulanabilir. Somut zaman dilimleriyle (0-1 ay, 1-3 ay, 3-6 ay, 6-12 ay) gerçekçi bir yol haritası \
oluştur ve her yol haritası eylemini ölçülebilir bir sonuca bağla. Genel geçer tavsiyeler verme; her öneri adayın \
CV'sindeki belirli bir kanıta dayanmalıdır. Çıktılarını ve analizlerini her zaman Türkçe üret."""

JOB_MATCH_SYSTEM_PROMPT = """Sen adayların özgeçmişleri ile şirketlerin iş ilanlarını semantik olarak karşılaştıran \
uzman bir teknik işe alım analistisin. Önce ilandaki zorunlu ve tercih edilen gereksinimleri ayır, sonra her \
gereksinim için CV'de açık kanıt ara. Eş anlamlı teknoloji ve kavramları aynı yetkinlik olarak \
değerlendirebilirsin; ancak CV'de olmayan bir deneyimi varmış gibi kabul edemezsin.

Eşleşme skorunu şu ağırlıklı rubrikle hesapla:

- Teknik yetkinlikler: %35
- Deneyim ve kıdem seviyesi: %25
- Sorumluluk ve başarı benzerliği: %20
- Eğitim ve sertifikalar: %10
- Sektör bilgisi ve dil gereksinimleri: %10

Her alt kriteri 0-100 arasında puanla ve match_score değerini bu ağırlıklarla hesapla. Kullanıcı mesajında \
LangChain OpenAI embeddings ile hesaplanan kosinüs benzerliği ve açıklanabilir anahtar kelime kanıtları \
sağlanacaktır. Bunları destekleyici sinyal olarak kullan; CV'de kanıtı olmayan bir gereksinimi karşılanmış sayma. \
Zorunlu bir gereksinim CV'de bulunmuyorsa bunu missing_skills içinde açıkça belirt. strong_fits maddelerinde hem \
ilandaki gereksinimi hem CV'deki kanıtı birlikte yaz. Adaya sahip olmadığı bir beceriyi CV'ye eklemesini söyleme. \
Raporu ve analizleri her zaman Türkçe üret."""


def _build_user_prompt(resume_text: str) -> str:
    return (
        "Yüklenen dosyadan çıkarılan aşağıdaki özgeçmiş metnini analiz et. "
        "Her gözlemini kesinlikle bu metne dayandır.\n\n"
        "----- ÖZGEÇMİŞ METNİ BAŞLANGICI -----\n"
        f"{resume_text}\n"
        "----- ÖZGEÇMİŞ METNİ BİTİŞİ -----"
    )


def _build_job_match_user_prompt(
    resume_text: str,
    job_description: str,
    semantic_similarity_score: int,
    evidence: MatchEvidence,
) -> str:
    matched_keywords = ", ".join(evidence.matched_keywords) or "Yok"
    missing_keywords = ", ".join(evidence.missing_keywords) or "Yok"

    return (
        "Aşağıdaki özgeçmiş metni ile iş ilanı açıklamasını karşılaştır. "
        "Önce gereksinimleri çıkar, sonra her puanı CV'deki kanıtlarla doğrula.\n\n"
        "----- LANGCHAIN SEMANTİK KARŞILAŞTIRMA -----\n"
        f"AI embedding kosinüs benzerliği: {semantic_similarity_score}/100\n"
        f"Doğrulanan ortak yetkinlikler: {matched_keywords}\n"
        f"İlanda bulunup CV'de doğrulanamayan yetkinlikler: {missing_keywords}\n"
        "----- LANGCHAIN SEMANTİK KARŞILAŞTIRMA BİTİŞİ -----\n\n"
        "----- ÖZGEÇMİŞ METNİ BAŞLANGICI -----\n"
        f"{resume_text}\n"
        "----- ÖZGEÇMİŞ METNİ BİTİŞİ -----\n\n"
        "----- İŞ İLANI AÇIKLAMASI BAŞLANGICI -----\n"
        f"{job_description}\n"
        "----- İŞ İLANI AÇIKLAMASI BİTİŞİ -----"
    )


def _build_recruiter_user_prompt(
    resume_text: str,
    ats_report: ATSReport | None = None,
    job_match_report: JobMatchDetail | None = None,
) -> str:
    prompt_parts = [_build_user_prompt(resume_text)]

    if ats_report is not None:
        prompt_parts.extend(
            [
                "\n----- ATS ÖN ANALİZİ BAŞLANGICI -----",
                ats_report.model_dump_json(indent=2),
                "----- ATS ÖN ANALİZİ BİTİŞİ -----",
            ]
        )

    if job_match_report is not None:
        prompt_parts.extend(
            [
                "\n----- İŞ İLANI EŞLEŞME BAĞLAMI BAŞLANGICI -----",
                job_match_report.model_dump_json(indent=2),
                "----- İŞ İLANI EŞLEŞME BAĞLAMI BİTİŞİ -----",
            ]
        )

    prompt_parts.append(
        "\nÖn analizleri yardımcı bağlam olarak kullan; nihai işe alım değerlendirmesini "
        "yalnızca özgeçmişteki doğrulanabilir kanıtlara dayandır."
    )
    return "\n".join(prompt_parts)


def build_json_output_parser(
    response_model: type[ReportT],
) -> PydanticOutputParser[ReportT]:
    return PydanticOutputParser(pydantic_object=response_model)


def build_json_analysis_chain(
    *,
    system_prompt: str,
    response_model: type[ReportT],
    temperature: float = 0.4,
    model: Runnable | None = None,
) -> Runnable:
    parser = build_json_output_parser(response_model)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            (
                "human",
                "{user_prompt}\n\n"
                "Yanıtını yalnızca aşağıdaki JSON biçim talimatlarına göre üret:\n"
                "{format_instructions}",
            ),
        ]
    ).partial(format_instructions=parser.get_format_instructions())

    chat_model = model or get_chat_model(temperature)
    return prompt | chat_model | parser


def build_recruiter_chain(model: Runnable | None = None) -> Runnable:
    return build_json_analysis_chain(
        system_prompt=RECRUITER_SYSTEM_PROMPT,
        response_model=RecruiterReport,
        temperature=0.3,
        model=model,
    )


def _invoke_json_chain(
    *,
    chain: Runnable,
    user_prompt: str,
    response_model: type[ReportT],
) -> ReportT:
    try:
        result = chain.invoke({"user_prompt": user_prompt})
    except HTTPException:
        raise
    except (APIError, OutputParserException) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI/LangChain analizi başarısız oldu: {str(exc)}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI analiz zinciri çalıştırılamadı: {str(exc)}",
        ) from exc

    if isinstance(result, response_model):
        return result
    return response_model.model_validate(result)


def _parse_structured(
    *,
    system_prompt: str,
    user_prompt: str,
    response_model: type[ReportT],
    temperature: float = 0.4,
) -> ReportT:
    chain = build_json_analysis_chain(
        system_prompt=system_prompt,
        response_model=response_model,
        temperature=temperature,
    )
    return _invoke_json_chain(
        chain=chain,
        user_prompt=user_prompt,
        response_model=response_model,
    )


def generate_general_report(resume_text: str) -> GeneralCVReport:
    return _parse_structured(
        system_prompt=GENERAL_ANALYST_SYSTEM_PROMPT,
        user_prompt=_build_user_prompt(resume_text),
        response_model=GeneralCVReport,
        temperature=0.2,
    )


def generate_ats_report(resume_text: str) -> ATSReport:
    return _parse_structured(
        system_prompt=ATS_EXPERT_SYSTEM_PROMPT,
        user_prompt=_build_user_prompt(resume_text),
        response_model=ATSReport,
        temperature=0.2,
    )


def generate_recruiter_report(
    resume_text: str,
    ats_report: ATSReport | None = None,
    job_match_report: JobMatchDetail | None = None,
) -> RecruiterReport:
    chain = build_recruiter_chain()
    return _invoke_json_chain(
        chain=chain,
        user_prompt=_build_recruiter_user_prompt(
            resume_text,
            ats_report=ats_report,
            job_match_report=job_match_report,
        ),
        response_model=RecruiterReport,
    )


def generate_coach_report(resume_text: str) -> CoachReport:
    return _parse_structured(
        system_prompt=CAREER_COACH_SYSTEM_PROMPT,
        user_prompt=_build_user_prompt(resume_text),
        response_model=CoachReport,
        temperature=0.3,
    )


INTERVIEWER_SYSTEM_PROMPT = """Sen adayın yüklediği CV analizine ve CV metnine dayanarak onunla \
mülakat simülasyonu gerçekleştiren kıdemli bir teknik işe alım uzmanı ve İK yöneticisisin.
Amacın, adayın CV'sindeki teknik deneyimler, projeler ve yetkinliklerle ilgili gerçekçi, dürüst ve zorlayıcı \
mülakat soruları sormaktır. Sohbete adayın özgeçmişini kısaca özetleyerek ve CV'sindeki güçlü veya zayıf \
noktalara odaklanan ilk soruyu sorarak başla. Adayın verdiği her cevaba göre kısa bir geri bildirim ver ve \
gerektiğinde cevabı derinleştiren tek bir takip sorusu sor. Bir kerede birden fazla soru sorma. Profesyonel, \
dürüst ve kurumsal bir dil kullan. Tüm konuşmayı Türkçe gerçekleştir ve doğrudan adayla konuş."""


def generate_interview_chat_response(
    resume_text: str,
    history: list[dict],
    new_message: str | None = None,
) -> str:
    prompt_messages: list[tuple[str, str]] = [
        (
            "system",
            f"{INTERVIEWER_SYSTEM_PROMPT}\n\n"
            "----- ADAYIN ÖZGEÇMİŞ METNİ -----\n"
            f"{resume_text}\n"
            "----- ÖZGEÇMİŞ METNİ BİTİŞİ -----",
        )
    ]

    for message in history:
        role = "human" if message["role"] == "user" else "ai"
        prompt_messages.append((role, message["content"]))

    if new_message:
        prompt_messages.append(("human", new_message))
    elif not history:
        prompt_messages.append(
            (
                "human",
                "Özgeçmişimi incele, mülakat simülasyonunu başlat ve ilk soruyu sor.",
            )
        )

    try:
        chain = (
            ChatPromptTemplate.from_messages(prompt_messages)
            | get_chat_model(temperature=0.7)
        )
        response = chain.invoke({})
    except HTTPException:
        raise
    except APIError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI mülakat analizi başarısız oldu: {str(exc)}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Mülakat zinciri çalıştırılamadı: {str(exc)}",
        ) from exc

    return response.text or str(response.content)


def generate_job_match_report(
    resume_text: str,
    job_description: str,
) -> JobMatchDetail:
    evidence = analyze_semantic_overlap(resume_text, job_description)
    semantic_similarity_score = calculate_semantic_similarity(
        resume_text,
        job_description,
    )
    ai_report = _parse_structured(
        system_prompt=JOB_MATCH_SYSTEM_PROMPT,
        user_prompt=_build_job_match_user_prompt(
            resume_text,
            job_description,
            semantic_similarity_score,
            evidence,
        ),
        response_model=AIJobMatchDetail,
        temperature=0.2,
    )

    payload = ai_report.model_dump()
    payload.update(
        {
            "match_score": calibrate_match_score(
                ai_report.match_score,
                semantic_similarity_score,
                evidence,
            ),
            "semantic_similarity_score": semantic_similarity_score,
            "keyword_match_score": evidence.keyword_match_score,
            "matched_keywords": list(evidence.matched_keywords),
            "missing_keywords": list(evidence.missing_keywords),
        }
    )
    return JobMatchDetail.model_validate(payload)


def run_recruiter_evaluation_chain(
    resume_text: str,
    job_description: str | None = None,
) -> tuple[ATSReport, JobMatchDetail | None, RecruiterReport]:
    ats_report = generate_ats_report(resume_text)
    job_match_report = (
        generate_job_match_report(resume_text, job_description)
        if job_description
        else None
    )
    recruiter_report = generate_recruiter_report(
        resume_text,
        ats_report=ats_report,
        job_match_report=job_match_report,
    )
    return ats_report, job_match_report, recruiter_report


def run_full_analysis(
    resume_text: str,
) -> tuple[GeneralCVReport, ATSReport, RecruiterReport, CoachReport]:
    general_report = generate_general_report(resume_text)
    ats_report = generate_ats_report(resume_text)
    recruiter_report = generate_recruiter_report(
        resume_text,
        ats_report=ats_report,
    )
    coach_report = generate_coach_report(resume_text)
    return general_report, ats_report, recruiter_report, coach_report
