# 🚀 CareerPilot AI - Yapay Zekâ Destekli Kariyer Yönetim Platformu

CareerPilot AI, adayların özgeçmişlerini (CV) analiz eden, iş ilanları ile semantik eşleştirme sağlayan, yapay zekâ kariyer koçluğu yapan ve WebSocket üzerinden gerçek zamanlı teknik/İK mülakat simülasyonları gerçekleştiren yeni nesil bir kariyer otomasyon sistemidir.

---

## ✨ Temel Özellikler

* **📄 Gelişmiş CV Analizi & ATS Puanlama (Sprint 1):** Yüklenen PDF veya Word özgeçmişlerini asenkron arka plan görevleri ile analiz eder. ATS uyumluluk skoru, zayıf/güçlü yanlar ve iyileştirme tavsiyeleri sunar.
* **📈 Dinamik İlerleme Çubuğu:** CV analizi aşama aşama gerçekleştirilir ve kullanıcıya canlı yüzdelik ilerleme durumları verilir.
* **📂 Sidebar Geçmiş Özgeçmişler & Silme:** Geçmişte yüklenen özgeçmişlere sidebar listesinden anında erişim sağlanabilir veya "✕" butonu ile tüm ilişkili verileriyle birlikte tek tıkla silinebilir.
* **🤝 İş İlanı Eşleştirme Motoru (Sprint 2):** Kaydedilen iş ilanlarının niteliklerini adayın özgeçmişiyle karşılaştırır, Recharts grafik destekli semantik uyum analizi üretir.
* **📋 LinkedIn Hızlı Doldurma Şablonları:** İş ilanı ekleme formunda Trendyol, Aselsan ve Getir gibi popüler firmaların LinkedIn ilan mock verileri tek tıkla yüklenebilir.
* **💬 WebSocket Mülakat Simülatörü (Sprint 3):** Adayın özgeçmiş verilerine ve zayıf yönlerine odaklanarak kıdemli bir İK yöneticisi rolünde WebSocket üzerinden gerçek zamanlı, çift yönlü mülakat gerçekleştirir.
* **👤 Kullanıcı Profili ve İstatistikleri (Polish Sprint):** Kullanıcının platform üzerindeki toplam yüklenen CV, yapılan eşleşme ve mülakat istatistiklerini raporlar; profil adı ve şifre güncellemelerini yönetir.

---

## 🛠️ Teknoloji Yığını

* **Backend:** Python, FastAPI, SQLModel, SQLAlchemy (Async), PostgreSQL (asyncpg)
* **Frontend:** React, Next.js, Axios, Tailwind CSS, Recharts
* **AI Engine:** Google GenAI SDK (`gemini-3.1-flash-lite`)
* **Deployment:** Docker, Docker Compose

---

## 🚀 Hızlı Başlangıç (Docker Compose - Tavsiye Edilen)

Tüm servisleri (PostgreSQL, Backend API ve Next.js Frontend) tek bir komutla ayağa kaldırabilirsiniz:

```bash
# Servisleri derleyin ve arka planda çalıştırın
docker compose up --build -d

# Konteyner loglarını takip etmek için
docker compose logs -f
```

* **Frontend Arayüzü:** `http://localhost:3000`
* **Backend API adresi:** `http://localhost:8000`
* **Swagger API Dokümantasyonu:** `http://localhost:8000/docs`

---

## ⚙️ Çevre Değişkenleri (.env)

Projeyi çalıştırmadan önce `backend/` dizini içerisinde bir `.env` dosyası oluşturarak aşağıdaki çevre değişkenlerini ayarlamanız gerekmektedir:

```env
PROJECT_NAME=CareerPilot AI
API_V1_PREFIX=/api
DATABASE_URL=postgresql+asyncpg://careerpilot:careerpilot@db:5432/careerpilot

# Güvenlik & JWT
JWT_SECRET_KEY=kendi-guvenli-anahtariniz
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Yapay Zeka Servisi (Google Gemini API Key)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.1-flash-lite

CORS_ORIGINS=http://localhost:3000
MAX_UPLOAD_SIZE_MB=10
```

---

## 🔌 API Endpoint Listesi

### 🔐 Kimlik Doğrulama (Auth)
* `POST /api/auth/register` - Yeni kullanıcı kaydı
* `POST /api/auth/login` - Kullanıcı girişi & token alma
* `GET /api/auth/me` - Kullanıcı profili & istatistikleri
* `PUT /api/auth/me` - Profil adı, e-posta veya şifre güncelleme

### 📄 Özgeçmiş (Resume)
* `POST /api/resume/upload` - CV PDF/Word yükleme (Arka planda asenkron analiz başlatır)
* `GET /api/resume/dashboard` - Genel dashboard ve geçmiş analizlerin listesi
* `GET /api/resume/{resume_id}` - Detaylı analiz sonucunu getirme
* `DELETE /api/resume/{resume_id}` - Özgeçmişi ve ilişkili tüm verileri silme

### 💼 İş İlanı Eşleştirme (Jobs)
* `POST /api/jobs` - Yeni iş ilanı kaydetme
* `GET /api/jobs` - Kayıtlı tüm iş ilanlarını listeleme
* `POST /api/jobs/{job_id}/match/{resume_id}` - CV ile iş ilanını karşılaştırıp analiz etme
* `GET /api/jobs/{job_id}/matches` - İlanın eşleşme geçmişi

### 💬 Mülakat Simülatörü (Chat)
* `POST /api/chat/sessions` - Yeni mülakat seansı başlatma
* `GET /api/chat/sessions/{session_id}/messages` - Mesaj geçmişini getirme
* `POST /api/chat/sessions/{session_id}/message` - HTTP REST üzerinden mesaj gönderme
* `WS /api/chat/ws/{session_id}` - **WebSocket** üzerinden anlık, gerçek zamanlı çift yönlü mülakat
