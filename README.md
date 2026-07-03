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

## Ürün Özellikleri ve Modüller


---

##  Hedef Kitle
*  Üniversite öğrencileri ve yeni mezunlar
*  Aktif olarak staj ve iş arayan adaylar
*  Sektör veya kariyer yolu değiştirmek isteyen profesyoneller

---

##  Kullanılan Teknolojiler & Mimari Yapı

---

##  Proje Yönetimi ve Scrum Süreci



---

##  Ürün İş Listesi (Product Backlog)


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
- Docker Compose ile tek komutla çalışacak geliştirme ortamı hazırlandı.
- Backend ve frontend için `.env.example` dosyaları oluşturuldu.

#### Veritabanı

- PostgreSQL veritabanı tasarlandı.
- `User` modeli oluşturuldu.
- `Resume` modeli oluşturuldu.
- User–Resume bire-çok ilişkisi tanımlandı.
- CV analiz raporlarının JSONB olarak saklanacağı yapı oluşturuldu.

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
- User ve Resume tabloları geliştirildi.
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
