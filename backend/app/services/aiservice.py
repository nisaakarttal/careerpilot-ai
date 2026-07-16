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
from app.schemas.job import AIJobMatchDetail, JobMatchDetail
from app.services.matching import analyze_semantic_overlap, calibrate_match_score

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
değiştirmesini iste. Çıktılarını ve analizlerini her zaman Türkçe dilinde üretmelisin."""

RECRUITER_SYSTEM_PROMPT = """Sen ayda yüzlerce CV'yi eleyen kıdemli bir teknik işe alım uzmanı ve İK iş ortağısın. \
Bu CV'yi bir sonraki tura geçirip geçirmemeye karar vermeden önce taramak için altı saniyen varmış gibi net ve \
gerçekçi bir ilk izlenim değerlendirmesi yapıyorsun. Kullanılan dilden ve açıklanan sorumluluk kapsamından kıdem \
seviyesini belirler, işe alım risklerini (istihdam boşlukları, çok sık iş değiştirme, belirsiz başarılar, uyumsuz \
kariyer gidişatı) işaretler ve CV'de yazanlara dayanarak bir işe alım uzmanının gerçekten soracağı gerçekçi mülakat \
soruları üretirsin. Bir ATS ön analizi veya iş ilanı eşleşme raporu sağlanırsa bunu karar zincirinin bağlamı olarak \
kullanırsın; ancak nihai değerlendirmeyi her zaman CV'deki doğrulanabilir kanıtlara dayandırırsın. Çıktılarını ve \
analizlerini her zaman Türkçe dilinde üretmelisin."""

CAREER_COACH_SYSTEM_PROMPT = """Sen adayların özgüven kazanmasına, kariyerlerini stratejik olarak konumlandırmasına \
ve mülakatlara hazırlanmasına yardımcı olan yönetici seviyesinde bir kariyer koçusun. Ses tonun cesaretlendirici, \
net ve uygulanabilir. Somut zaman dilimleriyle (0-1 ay, 1-3 ay, 3-6 ay, 6-12 ay) gerçekçi bir yol haritası \
oluşturuyorsun ve her yol haritası eylemini ölçülebilir bir sonuca bağlıyorsun. Asla genel geçer tavsiyeler \
vermezsin; her öneri adayın CV'sinden belirli bir şeye atıfta bulunmalıdır. Çıktılarını ve analizlerini her zaman \
Türkçe dilinde üretmelisin."""

JOB_MATCH_SYSTEM_PROMPT = """Sen adayların özgeçmişleri ile şirketlerin iş ilanlarını semantik olarak \
karşılaştıran uzman bir teknik işe alım analistisin. Önce ilandaki zorunlu ve tercih edilen gereksinimleri ayır, \
sonra her gereksinim için CV'de açık kanıt ara. Eş anlamlı teknoloji ve kavramları aynı yetkinlik olarak \
değerlendirebilirsin; ancak CV'de olmayan bir deneyimi varmış gibi kabul edemezsin.

Eşleşme skorunu şu ağırlıklı rubrikle hesapla:

- Teknik yetkinlikler: %35
- Deneyim ve kıdem seviyesi: %25
- Sorumluluk ve başarı benzerliği: %20
- Eğitim ve sertifikalar: %10
- Sektör bilgisi ve dil gereksinimleri: %10

Her alt kriteri 0-100 arasında puanla ve nihai match_score değerini bu ağırlıklarla hesapla. Zorunlu bir \
gereksinim CV'de bulunmuyorsa bunu missing_skills içinde açıkça belirt. strong_fits maddelerinde hem ilandaki \
gereksinimi hem CV'deki kanıtı birlikte yaz. improvements önerileri yalnızca gerçekçi CV düzenlemeleri veya \
gelişim adımları içermeli; adaya sahip olmadığı bir beceriyi CV'ye eklemesini söyleme. Raporu ve analizleri her \
zaman Türkçe dilinde üretmelisin."""


def _build_job_match_user_prompt(resume_text: str, job_description: str) -> str:
    return (
        "Aşağıdaki özgeçmiş metni ile iş ilanı açıklamasını karşılaştır. "
        "Önce gereksinimleri çıkar, sonra her puanı CV'deki kanıtlarla doğrula.\n\n"
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


def _parse_structured(
    *,
    system_prompt: str,
    user_prompt: str,
    response_model,
    temperature: float = 0.4,
):
    client = get_gemini_client()

    # Model ismi için settings kontrolü (örn: gemini-2.5-flash veya gemini-2.5-pro)
    model_name = getattr(settings, "GEMINI_MODEL", getattr(settings, "OPENAI_MODEL", "gemini-2.5-flash"))

    try:
        # Gemini'de Structured Outputs için GenerateContentConfig kullanıyoruz
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=temperature,
            response_mime_type="application/json",
            response_schema=response_model,
        )

        response = client.models.generate_content(
            model=model_name,
            contents=user_prompt,
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

    if isinstance(parsed, response_model):
        return parsed
    return response_model.model_validate(parsed)


def generate_general_report(resume_text: str) -> GeneralCVReport:
    return _parse_structured(
        system_prompt=GENERAL_ANALYST_SYSTEM_PROMPT,
        user_prompt=_build_user_prompt(resume_text),
        response_model=GeneralCVReport,
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
    return _parse_structured(
        system_prompt=RECRUITER_SYSTEM_PROMPT,
        user_prompt=_build_recruiter_user_prompt(
            resume_text,
            ats_report=ats_report,
            job_match_report=job_match_report,
        ),
        response_model=RecruiterReport,
        temperature=0.3,
    )


def generate_coach_report(resume_text: str) -> CoachReport:
    return _parse_structured(
        system_prompt=CAREER_COACH_SYSTEM_PROMPT,
        user_prompt=_build_user_prompt(resume_text),
        response_model=CoachReport,
    )


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
    ai_report = _parse_structured(
        system_prompt=JOB_MATCH_SYSTEM_PROMPT,
        user_prompt=_build_job_match_user_prompt(resume_text, job_description),
        response_model=AIJobMatchDetail,
        temperature=0.2,
    )
    evidence = analyze_semantic_overlap(resume_text, job_description)
    payload = ai_report.model_dump()
    payload.update(
        {
            "match_score": calibrate_match_score(ai_report.match_score, evidence),
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


def run_full_analysis(resume_text: str):
    general_report = generate_general_report(resume_text)
    ats_report = generate_ats_report(resume_text)
    recruiter_report = generate_recruiter_report(
        resume_text,
        ats_report=ats_report,
    )
    coach_report = generate_coach_report(resume_text)
    return general_report, ats_report, recruiter_report, coach_report
