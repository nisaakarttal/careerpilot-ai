# CareerPilot - Grup 79
Yapay Zekâ Destekli Kariyer ve CV Asistanı

CareerPilot AI; kullanıcıların özgeçmişlerini derinlemesine analiz eden, ATS (Applicant Tracking System) uyumluluğunu ölçümleyen, güncel iş ilanlarıyla akıllı semantik eşleştirmeler yapan ve kariyer gelişimlerine yönelik kişiselleştirilmiş yol haritaları sunan uçtan uca bir dijital kariyer asistanı platformudur.

Platform, adayların işe alım süreçlerinde daha rekabetçi ve başarılı olabilmeleri adına; CV optimizasyonu, yapay zekâ tabanlı mülakat simülasyonları ve dinamik kariyer planlaması araçları sunar.

## Takım Bilgileri: CareerPilot Team - Grup 79
Ekibimiz Yapay Zeka ve Teknoloji Akademisi bünyesinde çapraz fonksiyonlu (Cross-Functional) olarak çalışmaktadır. Akademi kuralları gereği ekibimizde tek bir lider bulunmamakta; tüm üyeler eşit sorumlulukla hem süreç yönetiminde hem de ürünün geliştirilmesinde aktif rol oynamaktadır.

- **Scrum Master (İletişim Sorumlusu):** Hayrunnisa Kartal — Ekip içi koordinasyon, Scrum eventlerinin yönetimi, engellerin kaldırılması ve Full-Stack Geliştirme.
- **Product Owner (Yedek İletişim Sorumlusu):** Utku Akkuşoğlu — Product Backlog yönetimi, user story'lerin önceliklendirilmesi ve Full-Stack Geliştirme.
- **Developer:** Yiğit Emir Saatçi — Full-Stack Geliştirme, Yapay Zeka Modelleri ve Veritabanı Mimarisi.
- **Developer:** Yusuf Yıldırım — Full-Stack Geliştirme, UI/UX Tasarım ve API Entegrasyonları.
- **Developer:** Sati Bıldırcın — Full-Stack Geliştirme, Test, Dağıtım ve Sistem Optimizasyonu.

## Problem ve Çözüm

### Problem Tanımı
- **ATS Engeli:** İş ve staj başvurusu yapan birçok nitelikli aday, hazırladıkları CV'lerin ATS (Aday Takip Sistemleri) standartlarına ve algoritmalarına uygun olmaması nedeniyle ilk aşamada elenmektedir.
- **Bütünleşik Platform Eksikliği:** Adayların kariyer gelişimlerini merkezi bir sistemden takip edebilecekleri, teknik/sosyal eksik yetkinliklerini analiz edebilecekleri ve doğrudan aksiyona dönüştürülebilir kişiselleştirilmiş geri bildirim alabilecekleri bütünleşik bir çözüm bulunmamaktadır.

### Çözümümüz
CareerPilot AI, yapay zekanın gücünü kullanarak aday ile iş dünyası arasındaki bu köprüyü kurar:

1. **Detaylı CV Analizi:** Güçlü yönleri ve eksikleri anında listeler, puanlama sunar.
2. **ATS Uyumluluk Ölçümü:** CV'nin kurumsal sistemlerden geçme şansını anahtar kelimeler üzerinden hesaplar.
3. **Akıllı İlan Eşleştirme:** CV ile hedeflenen ilan arasındaki semantik uyum yüzdesini çıkarır.
4. **Mülakat ve Recruiter Simülasyonu:** Gerçekçi İK geri bildirimleri ve teknik sorularla adayı mülakata hazırlar.
5. **Kariyer Yol Haritası:** Eksik yetkinlikler için sertifika, teknoloji ve eğitim önerileri sunar.

### Hedef Kitle
- Üniversite öğrencileri ve yeni mezunlar
- Aktif olarak staj ve iş arayan adaylar
- Sektör veya kariyer yolu değiştirmek isteyen profesyoneller

## Kullanılan Teknolojiler & Mimari Yapı

### Kullanılan Teknolojiler
| Katman | Teknoloji |
|--------|-----------|
| Backend | FastAPI |
| ORM | SQLModel |
| Database | PostgreSQL |
| Frontend | Next.js |
| UI | Tailwind CSS |
| Grafik | Recharts |
| AI | Gemini API (3.1 Flash-Lite) |
| Container | Docker |
| API Docs | Swagger |

### Sistem Mimarisi
```text
                +----------------------+
                |     Next.js UI       |
                +----------+-----------+
                           |
                        REST API & WebSockets
                           |
                +----------v-----------+
                |      FastAPI         |
                +----------+-----------+
                           |
        +------------------+-------------------+
        |                  |                   |
 Resume Service      Auth Service        AI Service
        |                  |                   |
        |                  |             Gemini API
        |                  |
        +------------------+
               |
         PostgreSQL
```

## Ürün İş Listesi (Product Backlog)
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

## Sprint Planları

### Sprint 1 (19 Haziran 2026 - 5 Temmuz 2026)
**Sprint Review:**
- Proje klasör yapısı oluşturuldu.
- Docker geliştirme ortamı hazırlandı.
- Backend ve Frontend temel mimarisi oluşturuldu.
- PostgreSQL veritabanı geliştirildi.
- JWT Authentication sistemi tamamlandı.
- CV Upload servisi geliştirildi.
- Resume Parser geliştirildi.
- AI analiz altyapısı oluşturuldu.
- Dashboard temel bileşenleri geliştirildi.
- Landing, Login ve Register sayfaları geliştirildi.
- Trello görev yönetim sistemi oluşturuldu.
- Sprint planı hazırlandı.

**Sprint Retrospective:**
Sprint boyunca teknik hedeflerin büyük kısmı tamamlanmış olsa da takım içi iletişim istenilen seviyede sağlanamadı. Görev paylaşımı ve ilerleme durumlarının düzenli olarak aktarılmaması zaman zaman koordinasyon sorunlarına neden oldu. Bir sonraki sprintte daha düzenli iletişim kurulması, görev takibinin sıklaştırılması ve ekip üyeleri arasında daha etkin iş birliği sağlanması hedeflenmektedir. Daily Scrum toplantıları istenen şekilde gerçekleşmedi.

### Trello İş Planı
![Trello İş Planı](assets/trello.png)
![Trello İş Planı](assets/trello1.png)

### Proje Durumu

**Giriş Sayfası**
![Giriş Sayfası](assets/login.png)

**Kayıt Sayfası**
![Kayıt Sayfası](assets/kayit.png)

**CV Yükleme**
![CV Yükleme](assets/cv-yükleme.png)

**Ana Sayfa**
![Ana Sayfa](assets/anasayfa.png)

**Daily Scrum**
![Daily Scrum](assets/daily-scrum.txt)

### Sprint 2 (06 Temmuz 2026 – 19 Temmuz 2026)

**Tamamlananlar:**
- **Kullanıcı Profili ve İstatistikleri:** Platform genelinde kullanım metriklerinin (CV sayısı, mülakat, ilan) görüntülenebildiği `Profil ve Ayarlar` sayfası entegre edildi.
- **Geçmiş CV Silme (Cascade Delete):** Adayların eski özgeçmişlerini tek tıkla (`✕` butonu) silmesi ve veritabanından ilişkili tüm analizlerin temizlenmesi sağlandı.
- **Gerçek Zamanlı Mülakat Simülatörü:** WebSocket mimarisine geçilerek mülakat botu ile anlık, gecikmesiz haberleşme altyapısı kuruldu.
- **LinkedIn Mock İlanları:** Hızlı eşleşme testleri için sektörel örnek iş ilanları eklendi.
- **Premium UI & UX İyileştirmeleri:** Frontend genelinde özel cam efekti pop-up onay modalı, gradient butonlar, autofill arkaplan sorunlarının giderimi ve renk paleti modernizasyonları gerçekleştirildi.

**Devam Ediyor / Gelecek Hedefler:**
- İlan eşleşme motoru algoritmalarının test süreçleri.
- Deployment ve sunucu kurulumları.

### Sprint 3 (20 Temmuz 2026 – 02 Ağustos 2026)
Planlandı.

## Lisans
Bu proje Yapay Zeka ve Teknoloji Akademisi 5. Dönem Bootcamp kapsamında eğitim amacıyla geliştirilmektedir.
