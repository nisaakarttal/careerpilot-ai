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

# Teknoloji Yığını

| Katman | Teknoloji |
|----------|------------|
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

```
                +----------------------+
                |     Next.js UI       |
                +----------+-----------+
                           |
                           |
                    REST API
                           |
                           |
                +----------v-----------+
                |      FastAPI         |
                +----------+-----------+
                           |
        +------------------+-------------------+
        |                  |                   |
        |                  |                   |
   Resume Service     Auth Service      AI Service
        |                  |                   |
        |                  |             OpenAI API
        |                  |
        +------------------+
               |
         PostgreSQL

---

#  Proje Yapısı

careerpilot-ai/
├── docker-compose.yml
├── README.md
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
    │   ├── login/page.jsx
    │   ├── register/page.jsx
    │   └── dashboard/page.jsx
    ├── components/
    │   ├── Navbar.jsx
    │   ├── AuthForm.jsx
    │   └── CareerPilotDashboard.jsx
    └── lib/
        ├── api.js
        └── auth.js

---


 Ürün İş Listesi (Product Backlog)

- PB-01: Kullanıcı kayıt (Register) modülünün geliştirilmesi.
- PB-02: Kullanıcı giriş (Login) ve JWT tabanlı kimlik doğrulama altyapısının geliştirilmesi.
- PB-03: Kullanıcı oturum yönetimi ve yetkilendirme mekanizmasının oluşturulması.
- PB-04: PostgreSQL veritabanı tasarımı ile User ve Resume tablolarının oluşturulması.
- PB-05: Backend ve Frontend temel proje mimarisinin oluşturulması.
- PB-06: Docker ve Docker Compose geliştirme ortamının yapılandırılması.
- PB-07: CV yükleme (PDF/DOCX) altyapısının geliştirilmesi.
- PB-08: CV dosyalarından metin çıkarma (Parser) servisinin geliştirilmesi.
- PB-09: Yapay zekâ destekli CV analiz modülünün geliştirilmesi.
- PB-10: ATS uyumluluk analiz modülünün geliştirilmesi.
- PB-11: Recruiter değerlendirme ve geri bildirim modülünün geliştirilmesi.
- PB-12: Kariyer koçu ve kişiselleştirilmiş öneri sisteminin geliştirilmesi.
- PB-13: Dashboard ekranı ve veri görselleştirme bileşenlerinin geliştirilmesi.
- PB-14: Analiz geçmişi yönetimi ve raporlama modülünün geliştirilmesi.
- PB-15: Yapay zekâ destekli mülakat simülasyonu modülünün geliştirilmesi.
- PB-16: CV ile iş ilanlarının semantik eşleştirme algoritmasının geliştirilmesi.
- PB-17: Responsive kullanıcı arayüzünün geliştirilmesi.
- PB-18: Swagger API dokümantasyonunun hazırlanması.
- PB-19: Hata yönetimi ve kullanıcı bildirim mekanizmalarının geliştirilmesi.
- PB-20: Sistem testleri, performans iyileştirmeleri ve son optimizasyonların gerçekleştirilmesi.
```


---

##  Sprint Planları ve Zaman Çizelgesi

###  İlk Sprint (19 Haziran 2026 - 5 Temmuz 2026)

Trello:
https://trello.com/invite/b/6a497c47e1be632667df4b7e/ATTI712073b993bc9c1e1e5a94df977193939D81A6B3/careerpilot

#### Proje Yönetimi

- Trello board'u oluşturuldu.
- Görev dağılımları ekip üyelerine yapıldı.
- Sprint planı ve zaman çizelgesi Excel üzerinde hazırlandı.

#### Teknik Altyapı ve Mimari

- FastAPI + SQLModel + PostgreSQL backend mimarisi oluşturuldu.
- Next.js + Tailwind CSS + Recharts frontend mimarisi oluşturuldu.

#### Veritabanı

- PostgreSQL veritabanı tasarlandı.

#### Backend

- JWT tabanlı kimlik doğrulama altyapısı geliştirildi.
- Register ve Login API'leri tamamlandı.
- Bcrypt ile parola hashleme sistemi eklendi.
- JWT token üretme ve doğrulama servisleri geliştirildi.
- PDF ve DOCX dosyalarından metin çıkaran parser servisi oluşturuldu.
- OpenAI Structured Outputs entegrasyonu geliştirildi.
- Dört farklı AI persona (CV Analisti, ATS Uzmanı, Recruiter, Kariyer Koçu) tasarlandı.
- `/api/resume/upload` endpoint'i oluşturuldu.
- `/api/resume/dashboard` endpoint'i oluşturuldu.
- CORS ve genel hata yönetimi yapılandırıldı.

#### Frontend

- Landing Page oluşturuldu.
- Login sayfası geliştirildi.
- Register sayfası geliştirildi.
- Authentication form bileşeni oluşturuldu.
- Dashboard arayüzünün temel iskeleti geliştirildi.
- KPI kartları oluşturuldu.
- Sekmeli raporlama yapısı oluşturuldu.
- API istek katmanı (`lib/api.js`) geliştirildi.
- Token yönetimi (`lib/auth.js`) oluşturuldu.

#### Sprint Sonunda Tamamlanan Çalışmalar

- Proje klasör yapısı oluşturuldu.
- Docker ortamı hazırlandı.
- Backend ve frontend başlangıç mimarisi tamamlandı.
- PostgreSQL veritabanı oluşturuldu.
- JWT Authentication sistemi çalışır hale getirildi.
- CV yükleme ve metin çıkarma servisi geliştirildi.
- OpenAI analiz altyapısı oluşturuldu.
- Frontend sayfa iskeletleri tamamlandı.
- Dashboard temel bileşenleri geliştirildi.
- Trello görev yönetimi sistemi kuruldu.
- Sprint planı ve zaman çizelgesi oluşturuldu.


###  2. Sprint (6 Temmuz 2026 - 19 Temmuz 2026)


###  Son Sprint (20 Temmuz 2026 - 2 Ağustos 2026)

---
 *CareerPilot, Yapay Zeka ve Teknoloji Akademisi 5. Dönem Bootcamp kapsamında, adayların iş dünyasındaki potansiyellerini en üst düzeye çıkarmak amacıyla sıfırdan geliştirilmiştir.*
