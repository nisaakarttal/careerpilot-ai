from typing import List

from pydantic import BaseModel, Field


class SectionScore(BaseModel):
    section_name: str = Field(description="Özgeçmiş bölümünün adı, örn. Deneyim, Eğitim, Yetenekler")
    score: int = Field(
        ge=0,
        le=100,
        description="Bu bölüm için 0'dan 100'e kadar puan",
    )
    comment: str = Field(description="Puan için kısa gerekçe")


class GeneralCVReport(BaseModel):
    candidate_summary: str = Field(description="Aday profilinin iki ila üç cümlelik özeti")
    job_title_fit: List[str] = Field(description="Bu CV'nin en uygun olduğu iş unvanlarının listesi")
    overall_score: int = Field(
        ge=0,
        le=100,
        description="0'dan 100'e kadar genel CV kalite puanı",
    )
    section_scores: List[SectionScore] = Field(description="CV bölümü başına puan dağılımı")
    strengths: List[str] = Field(description="CV'de tespit edilen temel güçlü yönler")
    weaknesses: List[str] = Field(description="CV'de tespit edilen temel zayıf yönler")
    missing_sections: List[str] = Field(description="Eksik veya yetersiz olan bölümler")
    top_fixes: List[str] = Field(description="Adayın yapması gereken en öncelikli düzeltmeler")


class RevisedBullet(BaseModel):
    original: str = Field(description="CV'deki orijinal madde işareti metni")
    revised: str = Field(description="X-Y-Z formülü kullanılarak yeniden yazılmış madde: [Z] yaparak, [Y] ile ölçüldüğü üzere [X] başarıldı")
    reason: str = Field(description="Bu revizyonun ATS ve işe alım uzmanı algısını neden iyileştirdiği")


class ATSReport(BaseModel):
    ats_score: int = Field(
        ge=0,
        le=100,
        description="0'dan 100'e kadar ATS uyumluluk puanı",
    )
    parsing_risk_level: str = Field(description="ATS ayrıştırma hatası risk seviyesi: düşük (low), orta (medium) veya yüksek (high)")
    formatting_issues: List[str] = Field(description="ATS ayrıştırmasını bozabilecek format sorunlarının listesi")
    keyword_gaps: List[str] = Field(description="CV'de eksik olan önemli sektör veya rol anahtar kelimeleri")
    revised_bullets: List[RevisedBullet] = Field(description="X-Y-Z formülü kullanılarak yeniden yazılan madde işaretleri")
    ats_optimization_summary: str = Field(description="Bu CV'nin ATS sistemleri için nasıl optimize edileceğinin özeti")


class InterviewQuestion(BaseModel):
    question: str = Field(description="Bir işe alım uzmanının bu CV'ye dayanarak sorabileceği muhtemel mülakat sorusu")
    reasoning: str = Field(description="İşe alım uzmanının CV içeriğine dayanarak bunu neden soracağı")


class RecruiterReport(BaseModel):
    recruiter_score: int = Field(
        ge=0,
        le=100,
        description="0'dan 100'e kadar genel işe alım uzmanı çekiciliğini temsil eden puan",
    )
    first_impression: str = Field(description="Bir işe alım uzmanının bu CV'yi taradığı ilk 6 saniyede ne düşüneceği")
    perceived_seniority: str = Field(description="Algılanan kıdem seviyesi: junior, mid, senior, lead, executive")
    hiring_risks: List[str] = Field(description="Bir işe alım uzmanının algılayabileceği kırmızı bayraklar veya riskler")
    standout_signals: List[str] = Field(description="Adayı olumlu yönde öne çıkaran sinyaller")
    interview_questions: List[InterviewQuestion] = Field(description="Bir işe alım uzmanının sorması muhtemel sorular")
    recruiter_summary: str = Field(description="Genel işe alım uzmanı perspektifi özeti")


class RoadmapItem(BaseModel):
    timeframe: str = Field(description="Bu yol haritası eylemi için zaman dilimi, örn. 0-1 ay, 1-3 ay, 3-6 ay")
    action: str = Field(description="Adayın bu zaman diliminde atması gereken somut eylem")
    expected_outcome: str = Field(description="Bu eylemi tamamlamaktan beklenen kariyer sonucu")


class CoachReport(BaseModel):
    coach_score: int = Field(
        ge=0,
        le=100,
        description="0'dan 100'e kadar genel kariyer koçluğu hazırlık puanı",
    )
    career_positioning: str = Field(description="Önerilen kariyer konumlandırması ve anlatı stratejisi")
    confidence_boosters: List[str] = Field(description="Adayın özgüvenini artıracak cesaret verici, spesifik noktalar")
    development_priorities: List[str] = Field(description="Adayın geliştirmesi gereken öncelikli beceriler veya deneyimler")
    interview_preparation_plan: List[str] = Field(description="Adım adım mülakat hazırlık planı")
    roadmap: List[RoadmapItem] = Field(description="Zaman dilimlerini içeren kariyer gelişim yol haritası")
    coach_summary: str = Field(description="Genel kariyer koçu özeti ve cesaretlendirme")


class MasterCareerPilotOutput(BaseModel):
    general_report: GeneralCVReport
    ats_report: ATSReport
    recruiter_report: RecruiterReport
    coach_report: CoachReport
