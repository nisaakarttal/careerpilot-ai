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

Platformumuz temiz kod prensiplerine uygun, ölçeklenebilir ve jüri değerlendirme kriterlerinde yer alan teknik bileşenleri (AI Agent mimarisi, hafıza ve orkestrasyon) tam karşılayacak şekilde tasarlanmıştır:

*   **Frontend:** `React` / `Next.js`
*   **Backend:** `Python` / `FastAPI`
*   **Veritabanı & Güvenlik:** `PostgreSQL` / `JWT Authentication`
*   **Kapsayıcılaştırma / Dağıtım:** `Docker` (Ürün canlıya alınabilecek yapıda geliştirilmektedir)
*   **Yapay Zeka Modeli & Orkestrasyon:** `OpenAI API` & `LangChain`
    *   *Teknik Detay:* Projede akıllı yönlendirmeler ve çoklu analiz süreçleri için **AI Agent'lar, bellek (memory) yapıları ve gelişmiş orkestrasyon teknikleri** aktif olarak kullanılmaktadır.

---

##  Proje Yönetimi ve Scrum Süreci

Projemiz, **Scrum** metodolojisine sıkı sıkıya bağlı kalınarak toplam **3 Sprint** halinde yönetilmektedir. Süreç boyunca şeffaflık, denetleme ve uyum ilkeleri gözetilir:

*   **Görev Takibi:** Tüm süreç ve iş listeleri **GitHub Projects** (Sprint Board) panoları üzerinden anlık olarak yönetilmektedir.
*   **Daily Scrum:** Günlük toplantılar zamansal sebeplerden dolayı Slack üzerinden gerçekleştirilmekte ve Daily Scrum özet notları düzenli olarak bu repository üzerinde arşivlenmektedir.
*   **Sprint Çıktıları:** Her sprint sonunda **Sprint Review** ve **Sprint Retrospective** süreçleri işletilerek dokümantasyonu buraya eklenecektir.

---

##  Ürün İş Listesi (Product Backlog)

1. Kullanıcı Giriş ve Kimlik Doğrulama Sistemi (`JWT`)
2. CV Yükleme ve Metin Çıkarım Modülü (Parser)
3. AI CV Analiz ve Puanlama Motoru
4. ATS Uyumluluk Ölçüm Sistemi
5. İş İlanı Semantik Eşleştirme Modülü
6. AI Recruiter Simülasyon Arayüzü
7. AI Career Coach Yol Haritası Geliştirme
8. Kullanıcı Dashboard ve Analitik Grafik Paneli
9. AI Mülakat Asistanı Soru-Cevap Motoru
10. Sistem Optimizasyonu, Test ve Canlıya Alma

---

##  Sprint Planları ve Zaman Çizelgesi

###  İlk Sprint (19 Haziran 2026 - 5 Temmuz 2026)


###  2. Sprint (6 Temmuz 2026 - 19 Temmuz 2026)


###  Son Sprint (20 Temmuz 2026 - 2 Ağustos 2026)

---
 *CareerPilot, Yapay Zeka ve Teknoloji Akademisi 5. Dönem Bootcamp kapsamında, adayların iş dünyasındaki potansiyellerini en üst düzeye çıkarmak amacıyla sıfırdan geliştirilmiştir.*
