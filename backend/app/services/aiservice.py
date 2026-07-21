from typing import Literal, TypeVar

from fastapi import HTTPException, status
from langchain_core.exceptions import OutputParserException
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
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
    InterviewEvaluation,
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
AssistantType = Literal["interview", "career_coach"]
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

CAREER_COACH_CHAT_SYSTEM_PROMPT = """Sen adayın yüklediği özgeçmişe dayalı, etkileşimli bir AI kariyer \
koçusun. Adayın hedefini netleştir, CV'deki doğrulanabilir güçlü yönleri ve gelişim alanlarını kullanarak \
ölçülebilir aksiyonlar öner. Önerileri 0-1 ay, 1-3 ay, 3-6 ay ve gerektiğinde 6-12 ay zaman dilimlerine bağla. \
Bir mesajda en fazla bir netleştirici soru sor. Adayın CV'sinde bulunmayan deneyim veya yetkinlikleri varmış \
gibi kabul etme; eksik bir bilgi kararını etkiliyorsa bunu açıkça sor. Tüm konuşmayı Türkçe, destekleyici ama \
gerçekçi bir dille yürüt."""

INTERVIEW_EVALUATION_SYSTEM_PROMPT = """Sen tamamlanmış bir mülakat simülasyonunu değerlendiren kıdemli \
teknik işe alım uzmanısın. Yalnızca adayın özgeçmişi ve konuşma dökümündeki cevaplarını kanıt olarak kullan. \
İletişim, teknik derinlik ve somut örnek kullanımı için ayrı puanlar ver. Adayın cevaplamadığı veya konuşmada \
ölçülemeyen alanlarda varsayım yapma; bunu gelişim alanı olarak belirt. Geri bildirimi yapıcı, net ve Türkçe üret."""

CAREER_COACH_COMPLETION_SYSTEM_PROMPT = """Sen tamamlanmış kariyer koçluğu görüşmesini eylem planına dönüştüren \
deneyimli bir kariyer koçusun. Özgeçmişteki doğrulanabilir kanıtları ve adayın konuşmada açıkladığı hedefleri \
birlikte kullan. Hedefi konuşmada netleşmediyse bunu açıkça belirt. Yol haritasını ölçülebilir sonuçlarla \
0-1 ay, 1-3 ay, 3-6 ay ve gerektiğinde 6-12 ay dönemlerine ayır. Tüm çıktıyı Türkçe üret."""

ASSISTANT_SYSTEM_PROMPTS: dict[AssistantType, str] = {
    "interview": INTERVIEWER_SYSTEM_PROMPT,
    "career_coach": CAREER_COACH_CHAT_SYSTEM_PROMPT,
}

ASSISTANT_INITIAL_MESSAGES: dict[AssistantType, str] = {
    "interview": (
        "Özgeçmişimi incele, mülakat simülasyonunu başlat ve ilk soruyu sor."
    ),
    "career_coach": (
        "Özgeçmişimi incele, kariyer durumumu kısaca değerlendir ve hedefimi "
        "netleştirmek için ilk sorunu sor."
    ),
}

ASSISTANT_TEMPERATURES: dict[AssistantType, float] = {
    "interview": 0.7,
    "career_coach": 0.5,
}


def _to_langchain_history(
    history: list[dict],
    max_messages: int | None = None,
) -> list[BaseMessage]:
    """Convert persisted messages to a safe, bounded LangChain chat history."""
    message_limit = (
        settings.CHAT_MEMORY_MAX_MESSAGES
        if max_messages is None
        else max(0, max_messages)
    )
    converted: list[BaseMessage] = []

    for message in history:
        role = str(message.get("role", "")).lower()
        content = str(message.get("content", "")).strip()
        if not content:
            continue
        if role in {"user", "human"}:
            converted.append(HumanMessage(content=content))
        elif role in {"model", "assistant", "ai"}:
            converted.append(AIMessage(content=content))

    if message_limit == 0:
        return []
    return converted[-message_limit:]


def build_assistant_chat_chain(
    assistant_type: AssistantType,
    model: Runnable | None = None,
) -> Runnable:
    """Build the shared LCEL chain used by interview and career-coach chats."""
    if assistant_type not in ASSISTANT_SYSTEM_PROMPTS:
        raise ValueError(f"Desteklenmeyen asistan türü: {assistant_type}")

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                f"{ASSISTANT_SYSTEM_PROMPTS[assistant_type]}\n\n"
                "----- ADAYIN ÖZGEÇMİŞ METNİ -----\n"
                "{resume_text}\n"
                "----- ÖZGEÇMİŞ METNİ BİTİŞİ -----",
            ),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{message}"),
        ]
    )
    chat_model = model or get_chat_model(
        temperature=ASSISTANT_TEMPERATURES[assistant_type]
    )
    return prompt | chat_model


def generate_assistant_chat_response(
    assistant_type: AssistantType,
    resume_text: str,
    history: list[dict],
    new_message: str | None = None,
) -> str:
    """Generate a mode-specific response with a bounded window of persisted memory."""
    if assistant_type not in ASSISTANT_SYSTEM_PROMPTS:
        raise ValueError(f"Desteklenmeyen asistan türü: {assistant_type}")

    chat_history = _to_langchain_history(history)

    if new_message and new_message.strip():
        current_message = new_message.strip()
    elif chat_history and isinstance(chat_history[-1], HumanMessage):
        current_message = str(chat_history.pop().content)
    elif not chat_history:
        current_message = ASSISTANT_INITIAL_MESSAGES[assistant_type]
    else:
        current_message = "Sohbete kaldığın yerden devam et."

    try:
        chain = build_assistant_chat_chain(assistant_type)
        response = chain.invoke(
            {
                "resume_text": resume_text,
                "history": chat_history,
                "message": current_message,
            }
        )
    except HTTPException:
        raise
    except APIError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI asistan yanıtı üretilemedi: {str(exc)}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LangChain konuşma zinciri çalıştırılamadı: {str(exc)}",
        ) from exc

    return response.text or str(response.content)


def generate_interview_chat_response(
    resume_text: str,
    history: list[dict],
    new_message: str | None = None,
) -> str:
    return generate_assistant_chat_response(
        "interview",
        resume_text,
        history,
        new_message,
    )


def generate_career_coach_chat_response(
    resume_text: str,
    history: list[dict],
    new_message: str | None = None,
) -> str:
    return generate_assistant_chat_response(
        "career_coach",
        resume_text,
        history,
        new_message,
    )


def _build_session_completion_prompt(
    resume_text: str,
    history: list[dict],
) -> str:
    transcript_lines = []
    for message in history:
        role = "ADAY" if message.get("role") == "user" else "AI ASİSTAN"
        content = str(message.get("content", "")).strip()
        if content:
            transcript_lines.append(f"{role}: {content}")

    transcript = "\n".join(transcript_lines) or "Konuşma kaydı bulunmuyor."
    return (
        f"{_build_user_prompt(resume_text)}\n\n"
        "----- KONUŞMA DÖKÜMÜ BAŞLANGICI -----\n"
        f"{transcript}\n"
        "----- KONUŞMA DÖKÜMÜ BİTİŞİ -----"
    )


def generate_session_completion(
    assistant_type: AssistantType,
    resume_text: str,
    history: list[dict],
) -> InterviewEvaluation | CoachReport:
    if assistant_type == "interview":
        system_prompt = INTERVIEW_EVALUATION_SYSTEM_PROMPT
        response_model = InterviewEvaluation
    elif assistant_type == "career_coach":
        system_prompt = CAREER_COACH_COMPLETION_SYSTEM_PROMPT
        response_model = CoachReport
    else:
        raise ValueError(f"Desteklenmeyen asistan türü: {assistant_type}")

    return _parse_structured(
        system_prompt=system_prompt,
        user_prompt=_build_session_completion_prompt(resume_text, history),
        response_model=response_model,
        temperature=0.2,
    )


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
