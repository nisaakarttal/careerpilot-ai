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
          CV'nizi <span className="cp-gradient-text">saniyeler icinde</span>{" "}
          dort farkli uzman gozuyle analiz edin
        </h1>
        <p className="text-[var(--cp-text-dim)] text-lg max-w-2xl mx-auto mb-10">
          CareerPilot AI; CV analisti, ATS optimizasyon uzmani, ise alim
          uzmani ve kariyer kocu perspektiflerini tek bir panelde birlestirir.
          PDF veya DOCX formatinda CV'nizi yukleyin, kapsamli raporunuzu aninda alin.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/register"
            className="px-6 py-3 rounded-lg bg-[var(--cp-accent)] hover:bg-[var(--cp-accent-light)] transition-colors font-medium"
          >
            Ucretsiz Basla
          </a>
          <a
            href="/login"
            className="px-6 py-3 rounded-lg cp-card-light hover:border-[var(--cp-accent)] transition-colors font-medium"
          >
            Giris Yap
          </a>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-20 text-left">
          {[
            {
              title: "Genel CV Raporu",
              desc: "Bolum bazli skorlar, guclu ve zayif yonler, oncelikli iyilestirmeler.",
            },
            {
              title: "ATS Uyumluluk Raporu",
              desc: "Ayristirma riski, anahtar kelime eksikleri, X-Y-Z formatinda madde revizyonu.",
            },
            {
              title: "Ise Alim Uzmani Bakisi",
              desc: "Ilk izlenim, kidem algisi, olasi mulakat sorulari.",
            },
            {
              title: "Kariyer Kocu Plani",
              desc: "Kariyer konumlandirma, gelisim oncelikleri, zaman cizelgeli yol haritasi.",
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
