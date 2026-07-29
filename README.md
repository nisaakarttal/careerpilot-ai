# CareerPilot - Grup 79

## Yapay Zekâ Destekli Kariyer ve CV Asistanı

CareerPilot AI; kullanıcıların özgeçmişlerini derinlemesine analiz eden, ATS (Applicant Tracking System) uyumluluğunu ölçümleyen, güncel iş ilanlarıyla akıllı semantik eşleştirmeler yapan ve kariyer gelişimlerine yönelik kişiselleştirilmiş yol haritaları sunan **uçtan uca bir dijital kariyer asistanı platformudur.**

Platform, adayların işe alım süreçlerinde daha rekabetçi ve başarılı olabilmeleri adına; CV optimizasyonu, yapay zekâ tabanlı mülakat simülasyonları ve dinamik kariyer planlaması araçları sunar.

---

## Takım Bilgileri: CareerPilot Team - Grup 79

Ekibimiz Yapay Zeka ve Teknoloji Akademisi bünyesinde çapraz fonksiyonlu (Cross-Functional) olarak çalışmaktadır. Akademi kuralları gereği ekibimizde tek bir lider bulunmamakta; tüm üyeler eşit sorumlulukla hem süreç yönetiminde hem de ürünün geliştirilmesinde aktif rol oynamaktadır.

| Role | Team Member |
|------|-------------|
| **Scrum Master (Communication Lead)** | **Hayrunnisa Kartal**<br>Scrum Master & Full Stack Developer/ AI Developer |
| **Product Owner (Deputy Communication Lead)** | **Utku Akkuşoğlu**<br>Product Owner & Full Stack Developer |
| **Developer** | **Yiğit Emir Saatçi**<br>Full Stack Developer & AI Developer |
| **Developer** | **Sati Bıldırcın**<br>Full Stack Developer, Testing, Deployment & System Optimization |

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
| AI | Google Gemini API |
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

- **Sprint Planı:** https://postamuedu-my.sharepoint.com/:x:/g/personal/hayrunnisakartal_posta_mu_edu_tr/IQBfLlNPr_i2S4UOm2ToqJJqAbj-WzZUvGZrkmldr05pG-I?e=2cLwLr

> İlk sprint için plan hazırlanmış ancak süreç içerisinde karşılaşılan teknik engeller nedeniyle bazı görevlerin kapsamı ve kişiler güncellenmiştir.

### Trello İş Planı
![Trello İş Planı](assets/trello.png)

![Trello İş Planı](assets/trello1.png)

---
# Sprint Review

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

#  Proje Durumu

### Giriş Sayfası
![Giriş Sayfası](assets/login0.png)

### Kayıt Sayfası
![Kayıt Sayfası](assets/kayit0.png)

### CV Yükleme
![CV Yükleme](assets/cv-yükleme0.png)

### Ana Sayfa
![Ana Sayfa](assets/anasayfa0.png)

---

## Sprint Retrospective

Sprint sürecinde teknik geliştirme çalışmalarında aktif olarak Hayrunnisa Kartal, Utku Akkuşoğlu ve Yiğit Emir Saatçi görev almıştır.

Sprint sürecinde takım içi iletişim ve koordinasyon açısından bazı aksaklıklar yaşanmıştır. Özellikle Daily Scrum toplantıları planlanan düzen ve sıklıkta gerçekleştirilememiş, bu nedenle ekip üyeleri arasında günlük ilerleme durumlarının paylaşılması ve görevlerin takibi istenilen seviyeye ulaşamamıştır.

Sprint başlangıcında görev dağılımının ekip üyeleriyle ortak şekilde planlanması hedeflenmiş, ancak bazı ekip üyelerinden zamanında geri dönüş alınamadığı için görev atamaları projenin ilerleyebilmesi adına mevcut durum göz önünde bulundurularak yapılmıştır. Görev dağılımlarının daha sonra ekip üyelerinin görüşleri doğrultusunda yeniden düzenlenebileceği belirtilmiş ve bu konuda gerekli esnekliğin sağlanacağı ifade edilmiştir.

Görev durumlarının düzenli olarak paylaşılmaması ve iletişim eksiklikleri nedeniyle zaman zaman koordinasyon sorunları yaşanmış, yapılan çalışmaların takibi zorlaşmıştır. Buna rağmen sprint hedeflerinin aksatılmaması için teknik geliştirme çalışmalarına plan doğrultusunda devam edilmiştir.

Bir sonraki sprintte;

-Daily Scrum toplantılarının her gün düzenli olarak gerçekleştirilmesi,
-Görev dağılımlarının ekip üyelerinin aktif katılımıyla netleştirilmesi,
-Yapılan çalışmaların günlük olarak paylaşılması,
-Proje yönetim aracındaki görev durumlarının düzenli güncellenmesi,
-İletişimin daha aktif ve sürekli sürdürülmesi,
-Karşılaşılan engellerin zaman kaybetmeden ekip ile paylaşılması

hedeflenmektedir.

Bu iyileştirmeler ile ekip içi koordinasyonun güçlendirilmesi, görev dağılımlarının daha şeffaf yürütülmesi ve sprint hedeflerine planlanan süre içerisinde daha verimli şekilde ulaşılması amaçlanmaktadır.


### Daily Scrum
![Daily Scrum](assets/daily-scrum.txt)

---

### Sprint 2 (06 Temmuz 2026 – 19 Temmuz 2026)

###  Proje Yönetim Araçları

---
### Trello İş Planı
![Trello İş Planı](assets/trello2.png)

![Trello İş Planı](assets/trello3.png)

--- 

## Sprint Review
Bu sprint boyunca **CareerPilot AI** projesinde yapay zekâ altyapısı, sistem mimarisi ve kullanıcı deneyimi açısından önemli geliştirmeler gerçekleştirildi. AI servisleri Google Gemini mimarisine taşınırken, yeni kullanıcı modülleri geliştirildi ve uygulamanın performansı ile ölçeklenebilirliği artırıldı.

**Tamamlananlar:**
### Yapay Zekâ Altyapısı
- OpenAI tabanlı AI altyapısı başarıyla **Google Gemini SDK**'ya taşındı.
- Mevcut API yapısını bozmadan **Structured Output** mimarisi korunarak entegrasyon tamamlandı.
- OpenAI, LangChain ve Gemini entegrasyonları tek mimari altında birleştirildi.
- **CV Analizi**, **ATS Analizi**, **Recruiter Değerlendirmesi** ve **AI Coach** servisleri ortak AI altyapısında çalışır hale getirildi.
- **BackgroundTasks** desteği ile CV analizleri arka planda çalıştırılarak kullanıcı bekleme süresi önemli ölçüde azaltıldı.

### Kullanıcı Yönetimi
- **Profil ve Ayarlar** sayfası sisteme eklendi.
- Kullanıcıların platform kullanım istatistiklerini (CV sayısı, mülakat, iş ilanı vb.) görüntüleyebileceği profil ekranı geliştirildi.
- Geçmiş CV görüntüleme altyapısı tamamlandı.
- **Cascade Delete** desteği ile eski CV'lerin ve ilişkili tüm analiz kayıtlarının güvenli şekilde silinmesi sağlandı.

### Kariyer Modülleri
- **CV – İş İlanı Eşleştirme** sistemi geliştirildi.
- LinkedIn benzeri örnek iş ilanları sisteme entegre edilerek eşleştirme testleri desteklendi.
- Gerçek zamanlı **WebSocket tabanlı AI Mülakat Simülatörü** geliştirildi.

### UI / UX İyileştirmeleri
- Premium kullanıcı arayüzü tasarımı geliştirildi.
- Glassmorphism (cam efekti) onay modalları eklendi.
- Gradient butonlar ve modern tema sistemi oluşturuldu.
- Progress bar, dropdown ve modal bileşenleri yenilendi.
- Tarayıcı autofill (otomatik doldurma) kaynaklı arka plan sorunları giderildi.
- Renk paleti ve genel kullanıcı deneyimi modernize edildi.

### Altyapı ve DevOps
- Docker yapılandırmaları optimize edildi.
- Backend testleri başarıyla tamamlandı.
- Tüm geliştirmeler güncel **main** dalı ile birleştirildi.

### Proje Durumu

**Giriş Sayfası**
![Giriş Sayfası](assets/login.png)

**Kayıt Sayfası**
![Kayıt Sayfası](assets/kayit.png)

**Ana Sayfa**
![Ana Sayfa](assets/anasayfa.png)

**CV Yükleme**
![CV Yükleme](assets/cv-yükleme.png)

**CV Analizleri**
![CV Analizleri](assets/cv1.png)

![CV Analizleri](assets/cv2.png)

![CV Analizleri](assets/cv3.png)

![CV Analizleri](assets/cv4.png)

![CV Analizleri](assets/cv5.png)

![CV Analizleri](assets/cv6.png)


---

## Sprint Retrospective

### Neler İyi Gitti?

- AI altyapısı başarıyla modernize edildi.
- Google Gemini geçişi sorunsuz tamamlandı.
- Kullanıcı deneyimini artıran yeni modüller geliştirildi.
- WebSocket tabanlı gerçek zamanlı iletişim başarıyla çalıştırıldı.
- Backend ve frontend entegrasyonu büyük ölçüde tamamlandı.
- Takım içerisinde Git branch yönetimi sorunsuz ilerledi.

### Karşılaşılan Zorluklar

- CV yükleme sırasında 502 Bad Gateway hatası.
- OpenAI SDK ile httpx sürüm uyumsuzluğu.
- Gemini API geçişi nedeniyle AI servis katmanının yeniden düzenlenmesi.
- PostgreSQL timezone problemi.
- Çoklu AI analizlerinde performans optimizasyonu ihtiyacı.

## Takım Süreci Değerlendirmesi

Sprint sürecindeki teknik geliştirme ve kalite güvence çalışmalarında Hayrunnisa Kartal, Utku Akkuşoğlu, Yiğit Emir Saatçi ve Sati Bıldırcın aktif olarak görev almıştır.

Sprint sürecinde Daily Scrum toplantıları planlanan düzen ve sıklıkta gerçekleştirilememiştir. Bunun sonucunda ekip üyeleri arasında günlük ilerleme durumlarının paylaşılması ve görev takibi istenilen seviyeye ulaşamamıştır. Bir sonraki sprintte düzenli Daily Scrum toplantılarının yapılması, görev durumlarının daha sık güncellenmesi ve ekip içi iletişimin güçlendirilmesi hedeflenmektedir.


### Öğrenilenler

- Sağlayıcı bağımsız AI mimarisi geliştirme sürecini kolaylaştırmaktadır.
- Structured Output veri tutarlılığını artırmaktadır.
- BackgroundTasks ve WebSocket mimarileri kullanıcı deneyimini iyileştirmektedir.
- Merkezi konfigürasyon yönetimi bakım maliyetini azaltmaktadır.
- Erken aşamada yazılan testler geliştirme sürecini hızlandırmaktadır.

### Bir Sonraki Sprint

- İş ilanı eşleşme algoritmalarının test edilmesi.
- Embedding performansının optimize edilmesi.
- Deployment ve production ortamının hazırlanması.
- CI/CD pipeline kurulması.
- Performans ve yük testlerinin gerçekleştirilmesi.
- AI servisleri için monitoring ve loglama altyapısının geliştirilmesi.
---

### Daily Scrum
![Daily Scrum](assets/daily-scrum.txt)

### Sprint 3 (20 Temmuz 2026 – 02 Ağustos 2026)

## Backlog Düzeni ve Story Seçimleri

Proje süresince Product Backlog, iş önceliği ve bağımlılıklar dikkate alınarak düzenlenmiştir. Öncelikle kullanıcı kayıt, giriş, yetkilendirme, veritabanı altyapısı ve temel sistem mimarisi gibi platformun çalışması için gerekli temel kullanıcı hikâyeleri geliştirilmiş ve tamamlanmıştır. Ardından yapay zekâ analiz altyapısı, ATS uyumluluk analizi, recruiter geri bildirimi, raporlama ve kullanıcı arayüzü geliştirmeleri gerçekleştirilmiştir. Son aşamada ise Career Coach, CV yükleme ve ayrıştırma (Parser), dashboard ekranları, analiz geçmişi, mülakat simülasyonu ve CV–iş ilanı eşleştirme gibi kullanıcıya doğrudan değer sağlayan özellikler tamamlanmıştır.

Story seçimleri yapılırken kullanıcıya en fazla değer sağlayacak, sistemin temel işlevlerini oluşturacak ve birbirine bağımlı geliştirmeler önceliklendirilmiştir. İlk olarak altyapı ve kimlik doğrulama süreçleri tamamlanmış, ardından yapay zekâ destekli analiz modülleri ve raporlama özellikleri geliştirilmiş, son olarak ise kullanıcı deneyimini iyileştiren gelişmiş analiz, kariyer koçluğu ve eşleştirme modülleri geliştirilmiştir. Her kullanıcı hikâyesi bağımsız olarak test edilebilir ve tamamlandığında kullanıcıya anlamlı bir iş değeri sunacak şekilde planlanmıştır.

Proje sonunda Product Backlog'da yalnızca Hata Yönetimi ve Bildirimler ile Sistem Testleri, Performans İyileştirmeleri ve Son Optimizasyonlar maddeleri bırakılmıştır. Bu çalışmalar, temel fonksiyonların tamamlanmasının ardından gerçekleştirilecek kalite güvence ve sistem iyileştirme faaliyetleri kapsamında değerlendirilmiştir. Böylece öncelik sıralaması, çalışan bir ürünün erken aşamada ortaya çıkarılması ve sonraki aşamalarda kalite ile performansın artırılması hedefi doğrultusunda oluşturulmuştur.

### Trello İş Planı

![Trello İş Planı](assets/trello4.png)

### Sprint Retrospective

# Başarılı Olan Noktalar

- Yapay zekâ destekli Career Coach ve Interview Assistant modülleri başarıyla tamamlandı.
- Kullanıcı arayüzü modernleştirilerek uygulamanın profesyonel görünümü önemli ölçüde iyileştirildi.
- Dashboard ve navigasyon yapısı daha kullanıcı dostu hale getirildi.
- LangChain tabanlı sohbet altyapısı başarıyla sisteme entegre edildi.
- PostgreSQL üzerinde kalıcı sohbet yönetimi başarıyla gerçekleştirildi.
- Docker ve CI süreçleri geliştirilerek dağıtım süreci daha güvenilir hale getirildi.
- Test süreçleri genişletilerek sistem kararlılığı artırıldı.

# Karşılaşılan Zorluklar

- Gemini model değişikliklerinden kaynaklanan yapılandırma uyumsuzlukları giderildi.
- Responsive arayüz geliştirmeleri sırasında bazı görsel uyumluluk problemleri çözüldü.
- Radar grafiklerinde uzun metinlerden kaynaklanan görüntüleme sorunları giderildi.
- AI servisleri ile frontend entegrasyonu sırasında oturum yönetimi optimize edildi.
- Docker ve production ortamlarında platform bağımlılıklarına yönelik düzenlemeler gerçekleştirildi.

# Takım Süreci Değerlendirmesi

- Sprint sürecindeki teknik geliştirme ve kalite güvence çalışmalarında Hayrunnisa Kartal, Utku Akkuşoğlu, Yiğit Emir Saatçi ve Sati Bıldırcın aktif olarak görev almıştır.
- Sprint boyunca ekip üyeleri planlanan görevleri zamanında tamamlayarak koordineli bir çalışma yürütmüştür. Günlük iletişim ve düzenli kod entegrasyonları sayesinde karşılaşılan teknik sorunlar hızlı bir şekilde çözülmüş, geliştirme süreci kesintisiz ilerlemiştir. Sprint hedefleri başarıyla tamamlanmış olup ekip içi iş birliği ve görev paylaşımı verimli bir şekilde gerçekleştirilmiştir.

# Öğrenilenler

- Ortak AI servis mimarisi sayesinde farklı sağlayıcıların tek yapı üzerinden yönetilmesi sürdürülebilirliği artırmaktadır.
- LangChain Memory kullanımı uzun süreli sohbet yönetiminde önemli avantaj sağlamaktadır.
- UI/UX çalışmalarının kullanıcı deneyimine doğrudan olumlu katkı sağladığı gözlemlenmiştir.
- CI/CD süreçlerinin erken aşamada kurulması yazılım kalitesini artırmaktadır.
- Docker tabanlı geliştirme ortamı ekip üyeleri arasında tutarlı çalışma ortamı oluşturmaktadır.

### Test ve Kalite Güvencesi

- 26 Temmuz 2026 tarihli sistem, CV parser, AI servis, chat ve frontend derleme kontrolleri tamamlandı.
- Şifreli PDF yükleme senaryosu güvenli `422` yanıtıyla ele alındı.
- Gemini kota ve embedding yapılandırma hataları kullanıcı dostu Türkçe mesajlara dönüştürüldü.
- Ayrıntılı sonuçlar: [Sistem Test Raporu](docs/TEST_REPORT_2026-07-26.md)

## Lisans
Bu proje Yapay Zeka ve Teknoloji Akademisi 5. Dönem Bootcamp kapsamında eğitim amacıyla geliştirilmektedir.
