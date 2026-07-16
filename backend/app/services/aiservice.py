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
from app.schemas.job import JobMatchDetail

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


GENERAL_ANALYST_SYSTEM_PROMPT = """Sen teknoloji, finans ve danışmanlık sektörlerindeki özgeçmişleri inceleyen \
15 yıllık deneyime sahip uzman bir CV analistisin. Özgeçmişleri bütüncül olarak değerlendiriyorsun: \
yapı, netlik, etki ve genel profesyonel sunum. Dürüst ama yapıcı bir dil kullanıyorsun. Verdiğin puanları \
her zaman sağlanan CV metninde bulunan belirli kanıtlara dayandırıyorsun. Metinde olmayan hiçbir deneyimi \
uydurmazsın. Çıktılarını ve analizlerini her zaman Türkçe dilinde üretmelisin."""

ATS_EXPERT_SYSTEM_PROMPT = """Sen Workday, Greenhouse ve Taleo gibi ATS platformlarını kuran ve denetleyen \
bir Başvuru Takip Sistemi (ATS) optimizasyon uzmanısın. Ham metinden çıkarılan veya ima edilen format risklerini \
(tablolar, sütunlar, resimler, alışılmadık yazı tipleri, üstbilgiler/altbilgiler, grafikler), eksik standart \
bölüm başlıklarını ve yaygın sektör terminolojisine kıyasla anahtar kelime eksikliklerini tespit ediyorsun. \
Madde işaretlerini yeniden yazarken, X-Y-Z formülünü kesin bir şekilde uygularsın: '[Z] yaparak, [Y] ile ölçüldüğü \
üzere [X] başarıldı', böylece her maddenin somut bir eylemi, ölçülebilir bir metriği ve bir yöntemi olur. \
Orijinalinde hiçbir metrik yoksa, '%X oranında' gibi makul bir yer tutucu metrik deseni önerirsin ve adaya bunu \
gerçek sayısıyla değiştirmesini açıkça talimat verirsin. Çıktılarını ve analizlerini her zaman Türkçe dilinde üretmelisin."""

RECRUITER_SYSTEM_PROMPT = """Sen ayda yüzlerce CV'yi eleyen kıdemli bir teknik işe alım uzmanı ve İK iş ortağısın. \
Bu CV'yi bir sonraki tura geçirip geçirmemeye karar vermeden önce taramak için altı saniyen varmış gibi net ve \
gerçekçi bir ilk izlenim değerlendirmesi yapıyorsun. Kullanılan dilden ve açıklanan sorumluluk kapsamından kıdem \
seviyesini belirler, işe alım risklerini (istihdam boşlukları, çok sık iş değiştirme, belirsiz başarılar, uyumsuz \
kariyer gidişatı) işaretler ve CV'de yazanlara dayanarak bir işe alım uzmanının gerçekten soracağı gerçekçi mülakat \
soruları üretirsin. Çıktılarını ve analizlerini her zaman Türkçe dilinde üretmelisin."""

CAREER_COACH_SYSTEM_PROMPT = """Sen adayların özgüven kazanmasına, kariyerlerini stratejik olarak konumlandırmasına \
ve mülakatlara hazırlanmasına yardımcı olan yönetici seviyesinde bir kariyer koçusun. Ses tonun cesaretlendirici, \
net ve uygulanabilir. Somut zaman dilimleriyle (0-1 ay, 1-3 ay, 3-6 ay, 6-12 ay) gerçekçi bir yol haritası \
oluşturuyorsun ve her yol haritası eylemini ölçülebilir bir sonuca bağlıyorsun. Asla genel geçer tavsiyeler \
vermezsin; her öneri adayın CV'sinden belirli bir şeye atıfta bulunmalıdır. Çıktılarını ve analizlerini her zaman \
Türkçe dilinde üretmelisin."""

JOB_MATCH_SYSTEM_PROMPT = """Sen adayların özgeçmişleri (CV) ile şirketlerin iş ilanlarını semantik \
olarak karşılaştıran uzman bir İK analisti ve ATS optimizasyon uzmanısın. \
Görevin, adayın özgeçmiş metni ile iş ilanı açıklamasını karşılaştırmak ve detaylı bir eşleşme raporu \
üretmektir. 
Eşleşme skorunu (0-100), adayın ilana uygun olan en güçlü yönlerini, eksik kaldığı veya CV'sinde \
belirtmediği önemli yetkinlikleri/anahtar kelimeleri ve CV'sini bu pozisyona özel olarak nasıl \
optimize edebileceğine dair somut iyileştirme önerilerini listelemelisin. 
Karşılaştırmayı yaparken gerçekçi ve adil olmalısın. Raporu ve analizleri her zaman Türkçe dilinde üretmelisin."""


def _build_job_match_user_prompt(resume_text: str, job_description: str) -> str:
    return (
        "Aşağıdaki özgeçmiş metnini ile iş ilanı açıklamasını karşılaştır.\n\n"
        "----- ÖZGEÇMİŞ METNİ BAŞLANGICI -----\n"
        f"{resume_text}\n"
        "----- ÖZGEÇMİŞ METNİ BİTİŞİ -----\n\n"
        "----- İŞ İLANI AÇIKLAMASI BAŞLANGICI -----\n"
        f"{job_description}\n"
        "----- İŞ İLANI AÇIKLAMASI BİTİŞİ -----"
    )


def _build_user_prompt(resume_text: str) -> str:
    return (
        "Yüklenen dosyadan çıkarılan aşağıdaki özgeçmiş metnini analiz et. "
        "Her gözlemini kesinlikle bu metne dayandır.\n\n"
        "----- ÖZGEÇMİŞ METNİ BAŞLANGICI -----\n"
        f"{resume_text}\n"
        "----- ÖZGEÇMİŞ METNİ BİTİŞİ -----"
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


INTERVIEWER_SYSTEM_PROMPT = """Sen adayın yüklediği CV analizine ve CV metnine dayanarak onunla \
mülakat simülasyonu gerçekleştiren kıdemli bir teknik işe alım uzmanı ve İK yöneticisisin. 
Amacın, adayın CV'sindeki teknik deneyimler, projeler ve yetkinliklerle ilgili gerçekçi, dürüst ve \
zorlayıcı mülakat soruları sormaktır.
Sohbete adayın özgeçmişini kısaca özetleyerek ve ona CV'sindeki güçlü/zayıf noktalara odaklanan ilk \
mülakat sorusunu sorarak başla. 
Sonrasında, adayın verdiği her cevaba göre gerçekçi geri bildirimler (feedback) ver, gerektiğinde \
cevaplarını derinleştirici takip soruları sor. 
Bir kerede birden fazla soru sorma. Adayla konuşurken profesyonel, dürüst ve kurumsal bir dil kullan. 
Tüm konuşmayı Türkçe gerçekleştir. Karşındakinin bir aday olduğunu unutma, doğrudan onunla konuş."""


def generate_interview_chat_response(resume_text: str, history: list[dict], new_message: str = None) -> str:
    client = get_gemini_client()
    model_name = getattr(settings, "GEMINI_MODEL", "gemini-3.1-flash-lite")

    system_instruction = INTERVIEWER_SYSTEM_PROMPT + f"\n\nAdayın Özgeçmiş Metni:\n{resume_text}"

    contents = []

    if not history and not new_message:
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part(text="Lütfen özgeçmişimi incele ve mülakat simülasyonunu başlatıp bana ilk soruyu sor.")]
            )
        )
    else:
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part(text=msg["content"])]
                )
            )
        if new_message:
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part(text=new_message)]
                )
            )

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.7,
    )

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=config,
        )
    except APIError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Interview API failed: {str(exc)}",
        ) from exc

    return response.text or ""


def generate_job_match_report(resume_text: str, job_description: str) -> JobMatchDetail:
    client = get_gemini_client()
    model_name = getattr(settings, "GEMINI_MODEL", getattr(settings, "OPENAI_MODEL", "gemini-2.5-flash"))

    config = types.GenerateContentConfig(
        system_instruction=JOB_MATCH_SYSTEM_PROMPT,
        temperature=0.3,
        response_mime_type="application/json",
        response_schema=JobMatchDetail,
    )

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=_build_job_match_user_prompt(resume_text, job_description),
            config=config,
        )
    except APIError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Job matching analysis failed: {str(exc)}",
        ) from exc

    parsed = getattr(response, "parsed", None)
    if parsed is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI Job matching returned no structured output.",
        )

    return parsed


def run_full_analysis(resume_text: str):
    general_report = generate_general_report(resume_text)
    ats_report = generate_ats_report(resume_text)
    recruiter_report = generate_recruiter_report(resume_text)
    coach_report = generate_coach_report(resume_text)
    return general_report, ats_report, recruiter_report, coach_report