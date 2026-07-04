# CareerPilot

## Yapay Zekâ Destekli Kariyer ve CV Asistanı

CareerPilot AI; kullanıcıların özgeçmişlerini derinlemesine analiz eden, ATS (Applicant Tracking System) uyumluluğunu ölçümleyen, güncel iş ilanlarıyla akıllı semantik eşleştirmeler yapan ve kariyer gelişimlerine yönelik kişiselleştirilmiş yol haritaları sunan **uçtan uca bir dijital kariyer asistanı platformudur.**

Platform, adayların işe alım süreçlerinde daha rekabetçi ve başarılı olabilmeleri adına; CV optimizasyonu, yapay zekâ tabanlı mülakat simülasyonları ve dinamik kariyer planlaması araçları sunar.

---

## Takım Bilgileri: CareerPilot Team

Ekibimiz Yapay Zeka ve Teknoloji Akademisi bünyesinde çapraz fonksiyonlu (Cross-Functional) olarak çalışmaktadır. Akademi kuralları gereği ekibimizde tek bir lider bulunmamakta; tüm üyeler eşit sorumlulukla hem süreç yönetiminde hem de ürünün geliştirilmesinde aktif rol oynamaktadır.

*   **Scrum Master (İletişim Sorumlusu):** [İsim Soyisim] — Ekip içi koordinasyon, Scrum eventlerinin yönetimi, engellerin kaldırılması ve Full-Stack Geliştirme.
*   **Product Owner (Yedek İletişim Sorumlusu):** [İsim Soyisim] — Product Backlog yönetimi, user story'lerin önceliklendirilmesi ve Full-Stack Geliştirme.
*   **Developer:** [İsim Soyisim] — Full-Stack Geliştirme, Yapay Zeka Modelleri ve Veritabanı Mimarisi.
*   **Developer:** [İsim Soyisim] — Full-Stack Geliştirme, UI/UX Tasarım ve API Entegrasyonları.
*   **Developer:** [İsim Soyisim] — Full-Stack Geliştirme, Test, Dağıtım ve Sistem Optimizasyonu.

---

## Problem ve Çözüm

### Problem Tanımı
*   **ATS Engeli:** İş ve staj başvurusu yapan birçok nitelikli aday, hazırladıkları CV'lerin ATS (Aday Takip Sistemleri) standartlarına ve algoritmalarına uygun olmaması nedeniyle ilk aşamada elenmektedir.
*   **Bütünleşik Platform Eksikliği:** Adayların kariyer gelişimlerini merkezi bir sistemden takip edebilecekleri, teknik/sosyal eksik yetkinliklerini analiz edebilecekleri ve doğrudan aksiyona dönüştürülebilir kişiselleştirilmiş geri bildirim alabilecekleri bütünleşik bir çözüm bulunmamaktadır.

### Çözümümüz
CareerPilot AI, yapay zekanın gücünü kullanarak aday ile iş dünyası arasındaki bu köprüyü kurar:
*   **Detaylı CV Analizi:** Güçlü yönleri ve eksikleri anında listeler, puanlama sunar.
*   **ATS Uyumluluk Ölçümü:** CV'nin kurumsal sistemlerden geçme şansını anahtar kelimeler üzerinden hesaplar.
*   **Akıllı İlan Eşleştirme:** CV ile hedeflenen ilan arasındaki semantik uyum yüzdesini çıkarır.
*   **Mülakat ve Recruiter Simülasyonu:** Gerçekçi İK geri bildirimleri ve teknik sorularla adayı mülakata hazırlar.
*   **Kariyer Yol Haritası:** Eksik yetkinlikler için sertifika, teknoloji ve eğitim önerileri sunar.

---
##  Hedef Kitle
*  Üniversite öğrencileri ve yeni mezunlar
*  Aktif olarak staj ve iş arayan adaylar
*  Sektör veya kariyer yolu değiştirmek isteyen profesyoneller

---
##  Kullanılan Teknolojiler & Mimari Yapı

# Kullanılan Teknolojiler

| Katman | Teknoloji |
|---------|-----------|
| Backend | FastAPI |
| ORM | SQLModel |
| Database | PostgreSQL |
| Frontend | Next.js |
| UI | Tailwind CSS |
| Grafik | Recharts |
| AI | OpenAI GPT-4o |
| Prompt | LangChain |
| Container | Docker |
| API Docs | Swagger |

---

# Sistem Mimarisi

```text
                +----------------------+
                |     Next.js UI       |
                +----------+-----------+
                           |
                        REST API
                           |
                +----------v-----------+
                |      FastAPI         |
                +----------+-----------+
                           |
        +------------------+-------------------+
        |                  |                   |
 Resume Service      Auth Service        AI Service
        |                  |                   |
        |                  |             OpenAI API
        |                  |
        +------------------+
               |
         PostgreSQL
```

---

# Proje Yapısı

```text
careerpilot-ai/
├── docker-compose.yml
├── README.md
├── assets/
│   ├── anasayfa.png
│   ├── cv-yukleme.png
│   ├── kayit.png
│   └── login.png
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py
│       ├── core/
│       │   ├── config.py
│       │   ├── database.py
│       │   └── security.py
│       ├── api/
│       │   ├── deps.py
│       │   └── endpoints/
│       │       ├── auth.py
│       │       └── resume.py
│       ├── models/
│       │   ├── user.py
│       │   └── resume.py
│       ├── schemas/
│       │   ├── aioutputs.py
│       │   ├── auth.py
│       │   └── resume.py
│       └── services/
│           ├── parser.py
│           └── aiservice.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── next.config.js
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── jsconfig.json
    ├── .env.local.example
    ├── app/
    │   ├── layout.jsx
    │   ├── page.jsx
    │   ├── globals.css
    │   ├── login/
    │   │   └── page.jsx
    │   ├── register/
    │   │   └── page.jsx
    │   └── dashboard/
    │       └── page.jsx
    ├── components/
    │   ├── Navbar.jsx
    │   ├── AuthForm.jsx
    │   └── CareerPilotDashboard.jsx
    └── lib/
        ├── api.js
        └── auth.js
```

---

# Ürün İş Listesi (Product Backlog)

- PB-01 Kullanıcı kayıt
- PB-02 Login & JWT Authentication
- PB-03 Yetkilendirme
- PB-04 PostgreSQL Veritabanı
- PB-05 Backend & Frontend Mimarisi
- PB-06 Docker Ortamı
- PB-07 CV Upload
- PB-08 CV Parser
- PB-09 AI CV Analizi
- PB-10 ATS Analizi
- PB-11 Recruiter Feedback
- PB-12 Career Coach
- PB-13 Dashboard
- PB-14 Analiz Geçmişi
- PB-15 AI Mülakat
- PB-16 İş İlanı Eşleştirme
- PB-17 Responsive UI
- PB-18 Swagger
- PB-19 Hata Yönetimi
- PB-20 Test & Performans

---

# Sprint Planları

## Sprint 1 (19 Haziran 2026 - 5 Temmuz 2026)

###  Proje Yönetim Araçları

- **Trello Board:** https://trello.com/invite/b/6a497c47e1be632667df4b7e/ATTI712073b993bc9c1e1e5a94df977193939D81A6B3/careerpilot
- **Sprint Planı:** https://postamuedu-my.sharepoint.com/:x:/g/personal/hayrunnisakartal_posta_mu_edu_tr/IQBfLlNPr_i2S4UOm2ToqJJqAbj-WzZUvGZrkmldr05pG-I?e=2cLwLr

> İlk sprint için plan hazırlanmış ancak süreç içerisinde karşılaşılan teknik engeller nedeniyle bazı görevlerin kapsamı ve kişiler güncellenmiştir.

---

#  Proje Durumu

### Giriş Sayfası
![Giriş Sayfası](assets/login.png)

### Kayıt Sayfası
![Kayıt Sayfası](assets/kayit.png)

### CV Yükleme
![CV Yükleme](assets/cv-yükleme.png)

### Ana Sayfa
![Ana Sayfa](assets/anasayfa.png)

---

## 🏗️ Teknik Altyapı

### Backend

- JWT Authentication
- Register / Login API
- Password Hashing (Bcrypt)
- JWT Token Servisi
- Resume Upload API
- Resume Parser
- OpenAI Structured Outputs
- AI Persona Sistemi
- Dashboard API
- CORS
- Global Exception Handling

### Frontend

- Landing Page
- Login
- Register
- Dashboard
- KPI Kartları
- Raporlama Sekmeleri
- API Katmanı
- Authentication Yönetimi

### Veritabanı

- PostgreSQL
- User Tablosu
- Resume Tablosu

---

# ✅ Sprint 1 Tamamlanan Çalışmalar

- Proje klasör yapısı oluşturuldu.
- Docker geliştirme ortamı hazırlandı.
- Backend ve Frontend temel mimarisi oluşturuldu.
- PostgreSQL veritabanı geliştirildi.
- JWT Authentication sistemi tamamlandı.
- CV Upload servisi geliştirildi.
- Resume Parser geliştirildi.
- OpenAI analiz altyapısı oluşturuldu.
- Dashboard temel bileşenleri geliştirildi.
- Landing, Login ve Register sayfaları geliştirildi.
- Trello görev yönetim sistemi oluşturuldu.
- Sprint planı hazırlandı.

---

## Sprint 2

**06 Temmuz 2026 – 19 Temmuz 2026**

> Devam ediyor...

---

## Sprint 3

**20 Temmuz 2026 – 02 Ağustos 2026**

> Planlandı.

---

# 📄 Lisans

Bu proje **Yapay Zeka ve Teknoloji Akademisi 5. Dönem Bootcamp** kapsamında eğitim amacıyla geliştirilmektedir.
