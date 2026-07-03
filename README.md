# CareerPilot

## Yapay Zekâ Destekli Kariyer ve CV Asistanı

CareerPilot AI; kullanıcıların özgeçmişlerini derinlemesine analiz eden, ATS (Applicant Tracking System) uyumluluğunu ölçümleyen, güncel iş ilanlarıyla akıllı semantik eşleştirmeler yapan ve kariyer gelişimlerine yönelik kişiselleştirilmiş yol haritaları sunan **uçtan uca bir dijital kariyer asistanı platformudur.**

Platform, adayların işe alım süreçlerinde daha rekabetçi ve başarılı olabilmeleri adına; CV optimizasyonu, yapay zekâ tabanlı mülakat simülasyonları ve dinamik kariyer planlaması araçları sunar.

---

## Takım Bilgileri: CareerPilot Team

Ekibimiz Yapay Zeka ve Teknoloji Akademisi bünyesinde çapraz fonksiyonlu (Cross-Functional) olarak çalışmaktadır. Akademi kuralları gereği ekibimizde tek bir lider bulunmamakta; tüm üyeler eşit sorumlulukla hem süreç yönetiminde hem de ürünün geliştirilmesinde aktif rol oynamaktadır.

*   **Scrum Master (İletişim Sorumlusu):** [İsim Soyisim] — Ekip içi koordinasyon, Scrum eventlerinin yönetimi, engellerin kaldırılması ve aktif yazılım geliştirme.
*   **Product Owner (Yedek İletişim Sorumlusu):** [İsim Soyisim] — Product Backlog yönetimi, user story'lerin önceliklendirilmesi ve aktif yazılım geliştirme.
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

##  Ürün İş Listesi (Product Backlog)

| ID | Kullanıcı Hikayesi | Öncelik | Story Point | Durum |
|:--:|--------------------|:--------:|:-----------:|:------:|
| PB-01 | Kullanıcı olarak sisteme kayıt olabilmeliyim. | Yüksek | 3 | Tamamlandı |
| PB-02 | Kullanıcı olarak güvenli şekilde giriş yapabilmeliyim. | Yüksek | 3 | Tamamlandı |
| PB-03 | Kullanıcı oturumlarının JWT ile güvenli şekilde yönetilmesini istiyorum. | Yüksek | 2 | Tamamlandı |
| PB-04 | Kullanıcı ve CV verilerinin PostgreSQL veritabanında güvenli şekilde saklanmasını istiyorum. | Yüksek | 5 | Tamamlandı |
| PB-05 | Proje için Docker tabanlı geliştirme ortamının oluşturulmasını istiyorum. | Orta | 3 | Tamamlandı |
| PB-06 | Backend ve Frontend temel proje mimarisinin oluşturulmasını istiyorum. | Yüksek | 5 | Tamamlandı |
| PB-07 | Kullanıcı olarak PDF veya DOCX formatındaki CV'mi sisteme yükleyebilmeliyim. | Yüksek | 5 | Temel Seviye |
| PB-08 | Sistem yüklediğim CV'den metni otomatik olarak çıkarabilmeli. | Yüksek | 5 | Temel Seviye |
| PB-09 | Yapay zekâ CV'mi analiz ederek güçlü ve geliştirilmesi gereken yönlerimi göstermeli. | Yüksek | 8 | Geliştiriliyor |
| PB-10 | CV'min ATS uyumluluk puanını görebilmeliyim. | Yüksek | 5 | Planlandı |
| PB-11 | Recruiter bakış açısıyla değerlendirme ve geri bildirim alabilmeliyim. | Orta | 5 | Planlandı |
| PB-12 | Kariyer gelişimime yönelik kişiselleştirilmiş öneriler alabilmeliyim. | Orta | 5 | Planlandı |
| PB-13 | Dashboard üzerinde analiz sonuçlarını grafiklerle görüntüleyebilmeliyim. | Yüksek | 8 | Geliştiriliyor |
| PB-14 | Geçmiş CV analizlerime erişebilmeliyim. | Orta | 5 | Planlandı |
| PB-15 | Yapay zekâ destekli mülakat simülasyonu yapabilmeliyim. | Orta | 5 | Planlandı |
| PB-16 | CV'min iş ilanlarıyla semantik uyumunu görebilmeliyim. | Orta | 8 | Planlandı |
| PB-17 | Mobil cihazlarda da sorunsuz çalışan responsive bir arayüz kullanabilmeliyim. | Düşük | 3 | Planlandı |
| PB-18 | Sistemin Docker ile tek komutla çalıştırılabilmesini istiyorum. | Orta | 5 | Tamamlandı |
| PB-19 | API dokümantasyonuna Swagger üzerinden erişebilmeliyim. | Düşük | 2 | Planlandı |
| PB-20 | Hatalı dosya yüklemelerinde kullanıcıya anlamlı hata mesajları gösterilmesini istiyorum. | Orta | 3 | Planlandı |

---

##  Sprint Planları ve Zaman Çizelgesi

###  İlk Sprint (19 Haziran 2026 - 5 Temmuz 2026)

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
