import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-24 text-center">
        <span className="inline-block text-xs uppercase tracking-widest text-[var(--cp-accent-light)] mb-4">
          Yapay Zeka Destekli Kariyer Asistani
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          CV'nizi <span className="cp-gradient-text">saniyeler içinde</span>{" "}
          dört farklı uzman gözüyle analiz edin
        </h1>
        <p className="text-[var(--cp-text-dim)] text-lg max-w-2xl mx-auto mb-10">
          CareerPilot AI; CV analisti, ATS optimizasyon uzmanı, ise alim
          uzmani ve kariyer koçu perspektiflerini tek bir panelde birleştirir.
          PDF veya DOCX formatinda CV'nizi yükleyin, kapsamlı raporunuzu aninda alin.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/register"
            className="px-6 py-3 rounded-lg bg-[var(--cp-accent)] hover:bg-[var(--cp-accent-light)] transition-colors font-medium"
          >
            Ücretsiz Başla
          </a>
          <a
            href="/login"
            className="px-6 py-3 rounded-lg cp-card-light hover:border-[var(--cp-accent)] transition-colors font-medium"
          >
            Giriş Yap
          </a>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-20 text-left">
          {[
            {
              title: "Genel CV Raporu",
              desc: "Bölüm bazlı skorlar, güçlü ve zayıf yönler, öncelikli iyileştirmeler.",
            },
            {
              title: "ATS Uyumluluk Raporu",
              desc: "Ayrıştırma riski, anahtar kelime eksikleri, X-Y-Z formatında madde revizyonu.",
            },
            {
              title: "İşe Alım Uzmanı Bakisi",
              desc: "İlk izlenim, kıdem algısı, olası mülakat sorulari.",
            },
            {
              title: "Kariyer Koçu Planı",
              desc: "Kariyer konumlandirma, gelişim öncelikleri, zaman çizelgeli yol haritasi.",
            },
          ].map((f, i) => (
            <div key={i} className="cp-card p-5">
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--cp-text-dim)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
