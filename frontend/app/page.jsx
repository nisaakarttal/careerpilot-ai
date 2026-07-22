"use client";

import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F9E1E0] text-[#4E677F] antialiased selection:bg-[#FEADB9] selection:text-[#4E677F] relative overflow-x-hidden">

      {/* Master Arka Plan Işık (Glow & Mesh) Efektleri */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#FEADB9]/50 via-[#BC85A3]/20 to-transparent blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[600px] right-0 w-[400px] h-[400px] bg-[#9799BA]/20 blur-3xl -z-10 pointer-events-none" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-28 text-center">

        {/* Master Rozet (Badge) */}
        <div className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-wider text-[#BC85A3] bg-white/70 hover:bg-white px-4 py-2 rounded-full mb-8 border border-[#FEADB9]/60 shadow-sm backdrop-blur-md transition-all cursor-pointer group">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BC85A3] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BC85A3]"></span>
          </span>
          <span>CareerPilot AI v2.0 Yayında</span>
          <span className="text-[#9799BA] group-hover:translate-x-0.5 transition-transform">→</span>
        </div>

        {/* Hero Başlık */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 text-[#2E3E4E] leading-[1.1] max-w-5xl mx-auto">
          CV'nizi{" "}
          <span className="bg-gradient-to-r from-[#BC85A3] via-[#9799BA] to-[#4E677F] bg-clip-text text-transparent underline decoration-[#FEADB9]/50 underline-offset-8">
            saniyeler içinde
          </span>{" "}
          4 farklı uzmanla analiz edin
        </h1>

        {/* Sub-headline */}
        <p className="text-[#4E677F]/90 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          CareerPilot AI; CV analisti, ATS optimizasyon uzmanı, işe alım
          uzmanı ve kariyer koçu perspektiflerini tek bir panelde birleştirir.
          Kariyerinizdeki eksik halkayı anında keşfedin.
        </p>

        {/* CTA Butonları */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="/register"
            className="w-full sm:w-auto bg-[#BC85A3] hover:bg-[#a6718d] text-white font-semibold px-9 py-4 rounded-2xl shadow-lg shadow-[#BC85A3]/25 hover:shadow-xl hover:shadow-[#BC85A3]/35 transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 text-base"
          >
            <span>Ücretsiz Başla</span>
            <svg className="w-5 h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <a
            href="/login"
            className="w-full sm:w-auto bg-white/60 hover:bg-white text-[#4E677F] border border-[#9799BA]/40 font-semibold px-9 py-4 rounded-2xl transition-all duration-200 backdrop-blur-md shadow-sm active:scale-95 text-base"
          >
            Giriş Yap
          </a>
        </div>

        {/* 🚀 Master Önizleme (Header & Body Aynı Açık Ton: bg-[#FEADB9]/40) */}
        <div className="relative max-w-4xl mx-auto mb-24 p-3 bg-white/50 rounded-3xl border border-white shadow-2xl backdrop-blur-xl">
          <div className="bg-[#FEADB9]/40 rounded-2xl overflow-hidden border border-[#FEADB9]/60 text-left">

            {/* Mockup Header Bar (Aynı Açık Renk + Altı Kesik Çizgili) */}
            <div className="bg-[#FEADB9]/40 px-6 py-3.5 flex items-center justify-between border-b border-[#BC85A3]/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#BC85A3]/40" />
                <div className="w-3 h-3 rounded-full bg-[#BC85A3]/60" />
                <div className="w-3 h-3 rounded-full bg-[#BC85A3]" />
                <span className="text-xs font-mono text-[#2E3E4E]/80 font-semibold ml-2">careerpilot_report.pdf</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#BC85A3] text-white shadow-sm">
                Skor: 92/100 (Harika)
              </span>
            </div>

            {/* Mockup Body Content (Header ile Tamamen Aynı Açık Renk) */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 p-4 rounded-xl border border-white/80 shadow-sm">
                <div className="text-xs text-[#BC85A3] font-bold uppercase">ATS Uyum Skoru</div>
                <div className="text-2xl font-black text-[#2E3E4E] mt-1">%94 Pass</div>
                <p className="text-xs text-[#4E677F]/80 mt-1">12 Kritik anahtar kelime eşleşti.</p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-white/80 shadow-sm">
                <div className="text-xs text-[#BC85A3] font-bold uppercase">İşe Alımcı Görüşü</div>
                <div className="text-sm font-bold text-[#2E3E4E] mt-1">"Kıdem seviyesi net"</div>
                <p className="text-xs text-[#4E677F]/80 mt-1">Liderlik vurgusu güçlendirilmeli.</p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-white/80 shadow-sm">
                <div className="text-xs text-[#BC85A3] font-bold uppercase">Aksiyon Planı</div>
                <div className="text-sm font-bold text-[#BC85A3] mt-1">3 Öncelikli Adım</div>
                <p className="text-xs text-[#4E677F]/80 mt-1">X-Y-Z ölçülebilir metrik ekle.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Sosyal Kanıt & İstatistik Şeridi */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-24 p-6 bg-white/50 rounded-2xl border border-[#FEADB9]/40 shadow-sm backdrop-blur-md">
          {[
            { label: "Analiz Edilen CV", value: "10,000+" },
            { label: "Mülakat Çağrı Artışı", value: "3.2x" },
            { label: "ATS Uyum Başarısı", value: "%94" },
            { label: "Kullanıcı Puanı", value: "4.9 / 5.0" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#BC85A3]">{stat.value}</div>
              <div className="text-xs text-[#4E677F]/80 font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Modüller / Özellik Kartları Başlığı */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2E3E4E]">
            Tek Bir Rapor, Dört Farklı Perspektif
          </h2>
          <p className="text-[#4E677F]/80 text-sm mt-2">
            Yapay zeka modellerimiz CV'nizi farklı uzmanlık disiplinleriyle inceler.
          </p>
        </div>

        {/* Disiplin Kartları Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left mb-24">
          {[
            {
              badge: "Disiplin 01",
              title: "Genel CV Raporu",
              desc: "Bölüm bazlı skorlar, güçlü ve zayıf yönler, öncelikli iyileştirmeler.",
              svg: (
                <svg className="w-5 h-5 text-[#BC85A3] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
            },
            {
              badge: "Disiplin 02",
              title: "ATS Uyumluluk Raporu",
              desc: "Ayrıştırma riski, anahtar kelime eksikleri, X-Y-Z formatında madde revizyonu.",
              svg: (
                <svg className="w-5 h-5 text-[#BC85A3] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              badge: "Disiplin 03",
              title: "İşe Alım Uzmanı Bakışı",
              desc: "İlk izlenim, kıdem algısı, olası mülakat soruları ve yanıt stratejileri.",
              svg: (
                <svg className="w-5 h-5 text-[#BC85A3] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ),
            },
            {
              badge: "Disiplin 04",
              title: "Kariyer Koçu Planı",
              desc: "Kariyer konumlandırma, gelişim öncelikleri, zaman çizelgeli yol haritası.",
              svg: (
                <svg className="w-5 h-5 text-[#BC85A3] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
            },
          ].map((f, i) => (
            <div
              key={i}
              className="group bg-white/70 hover:bg-white/95 backdrop-blur-md p-7 rounded-2xl border border-[#FEADB9]/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#BC85A3] bg-[#FEADB9]/25 px-2.5 py-1 rounded-md">
                    {f.badge}
                  </span>

                  {/* Simgeli İkon Kutusu */}
                  <div className="w-10 h-10 rounded-xl bg-[#FEADB9]/30 border border-[#FEADB9]/50 flex items-center justify-center group-hover:bg-[#BC85A3] group-hover:border-[#BC85A3] transition-colors">
                    {f.svg}
                  </div>
                </div>

                <h3 className="font-bold text-xl text-[#2E3E4E] mb-3 group-hover:text-[#BC85A3] transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-[#4E677F]/85 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Master Testimonial (Kullanıcı Yorumu) */}
        <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-[#FEADB9]/50 shadow-sm text-center space-y-4">
          <div className="flex justify-center gap-1 text-[#BC85A3]">
            {"★".repeat(5)}
          </div>
          <p className="text-base sm:text-lg italic text-[#2E3E4E] font-medium leading-relaxed">
            "CareerPilot AI sayesinde ATS sisteminde takılan noktaları tek tek tespit ettim.
            CV'mi güncelledikten 3 gün sonra hedeflediğim şirketten mülakat daveti aldım!"
          </p>
          <div>
            <div className="font-bold text-sm text-[#BC85A3]">Merve Y.</div>
            <div className="text-xs text-[#4E677F]/70">Senior Product Designer</div>
          </div>
        </div>

      </main>
    </div>
  );
}