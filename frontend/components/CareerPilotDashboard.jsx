"use client";

import { useEffect, useRef, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getDashboard, uploadResume } from "@/lib/api";

const TABS = [
  { id: "overview", label: "Genel Bakis" },
  { id: "ats", label: "ATS Raporu" },
  { id: "interview", label: "Mulakat Simulatoru" },
  { id: "roadmap", label: "Kariyer Yol Haritasi" },
];

function scoreColor(score) {
  if (score >= 75) return "var(--cp-good)";
  if (score >= 50) return "var(--cp-warn)";
  return "var(--cp-bad)";
}

function KpiCard({ label, value }) {
  return (
    <div className="cp-card p-5">
      <div className="text-sm text-[var(--cp-text-dim)] mb-2">{label}</div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-3xl font-bold"
          style={{ color: scoreColor(value) }}
        >
          {Math.round(value)}
        </span>
        <span className="text-sm text-[var(--cp-text-dim)]">/ 100</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-[var(--cp-border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            backgroundColor: scoreColor(value),
          }}
        />
      </div>
    </div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    good: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    bad: "bg-red-500/10 text-red-400 border-red-500/30",
    warn: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    neutral: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  };
  return (
    <span
      className={`inline-block text-xs px-3 py-1 rounded-full border ${tones[tone]} mr-2 mb-2`}
    >
      {children}
    </span>
  );
}

function UploadPanel({ onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const result = await uploadResume(file);
      onUploaded(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={`cp-card p-8 text-center border-dashed transition-colors ${
        dragging ? "border-[var(--cp-accent)]" : ""
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="text-4xl mb-3">📄</div>
      <p className="font-medium mb-1">CV'nizi yukleyin</p>
      <p className="text-sm text-[var(--cp-text-dim)] mb-4">
        PDF veya DOCX formatinda dosyanizi surukleyip birakin ya da secin
      </p>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-5 py-2.5 rounded-lg bg-[var(--cp-accent)] hover:bg-[var(--cp-accent-light)] disabled:opacity-60 transition-colors text-sm font-medium"
      >
        {uploading ? "Analiz Ediliyor..." : "Dosya Sec"}
      </button>
      {error && (
        <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 inline-block">
          {error}
        </div>
      )}
    </div>
  );
}

function OverviewTab({ resume }) {
  const radarData = resume.cv_analytics.section_scores.map((s) => ({
    section: s.section_name,
    score: s.score,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Genel Skor" value={resume.overall_score} />
        <KpiCard label="ATS Skoru" value={resume.ats_score} />
        <KpiCard label="Ise Alim Uzmani Skoru" value={resume.recruiter_score} />
        <KpiCard label="Kariyer Kocu Skoru" value={resume.coach_score} />
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-1">Aday Ozeti</h3>
        <p className="text-sm text-[var(--cp-text-dim)] mb-4">
          {resume.cv_analytics.candidate_summary}
        </p>
        <div className="flex flex-wrap">
          {resume.cv_analytics.job_title_fit.map((title, i) => (
            <Badge key={i}>{title}</Badge>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-4">Bolum Skorlari</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--cp-border)" />
              <PolarAngleAxis
                dataKey="section"
                tick={{ fill: "var(--cp-text-dim)", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "var(--cp-text-dim)", fontSize: 10 }}
              />
              <Radar
                dataKey="score"
                stroke="var(--cp-accent-light)"
                fill="var(--cp-accent)"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="cp-card p-6">
          <h3 className="font-semibold mb-4">Guclu ve Zayif Yonler</h3>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wide text-[var(--cp-text-dim)] mb-2">
              Guclu Yonler
            </p>
            <div className="flex flex-wrap">
              {resume.cv_analytics.strengths.map((s, i) => (
                <Badge key={i} tone="good">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--cp-text-dim)] mb-2">
              Zayif Yonler
            </p>
            <div className="flex flex-wrap">
              {resume.cv_analytics.weaknesses.map((w, i) => (
                <Badge key={i} tone="bad">
                  {w}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-3">Eksik Bolumler</h3>
          <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
            {resume.cv_analytics.missing_sections.map((m, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-400">•</span> {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-3">Oncelikli Iyilestirmeler</h3>
          <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
            {resume.cv_analytics.top_fixes.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400">{i + 1}.</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function AtsTab({ resume }) {
  const ats = resume.ats_analytics;
  const riskTone =
    ats.parsing_risk_level === "low"
      ? "good"
      : ats.parsing_risk_level === "medium"
      ? "warn"
      : "bad";

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <KpiCard label="ATS Skoru" value={resume.ats_score} />
        <div className="cp-card p-5">
          <div className="text-sm text-[var(--cp-text-dim)] mb-2">
            Ayristirma Riski
          </div>
          <Badge tone={riskTone}>{ats.parsing_risk_level.toUpperCase()}</Badge>
        </div>
        <div className="cp-card p-5">
          <div className="text-sm text-[var(--cp-text-dim)] mb-2">
            Eksik Anahtar Kelimeler
          </div>
          <div className="text-3xl font-bold text-amber-400">
            {ats.keyword_gaps.length}
          </div>
        </div>
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-3">Bicimlendirme Sorunlari</h3>
        <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
          {ats.formatting_issues.map((issue, i) => (
            <li
              key={i}
              className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2"
            >
              <span className="text-red-400">⚠</span> {issue}
            </li>
          ))}
        </ul>
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-3">Eksik Anahtar Kelimeler</h3>
        <div className="flex flex-wrap">
          {ats.keyword_gaps.map((k, i) => (
            <Badge key={i} tone="warn">
              {k}
            </Badge>
          ))}
        </div>
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-4">
          Yeniden Yazilmis Madde Isaretleri (X-Y-Z Formulu)
        </h3>
        <div className="space-y-4">
          {ats.revised_bullets.map((b, i) => (
            <div key={i} className="cp-card-light p-4">
              <p className="text-xs uppercase tracking-wide text-red-400 mb-1">
                Orijinal
              </p>
              <p className="text-sm text-[var(--cp-text-dim)] mb-3 line-through decoration-red-500/50">
                {b.original}
              </p>
              <p className="text-xs uppercase tracking-wide text-emerald-400 mb-1">
                Revize Edilmis
              </p>
              <p className="text-sm mb-3">{b.revised}</p>
              <p className="text-xs text-[var(--cp-text-dim)] italic">
                {b.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-2">ATS Optimizasyon Ozeti</h3>
        <p className="text-sm text-[var(--cp-text-dim)]">
          {ats.ats_optimization_summary}
        </p>
      </div>
    </div>
  );
}

function InterviewTab({ resume }) {
  const rec = resume.recruiter_analytics;
  const [openIndex, setOpenIndex] = useState(null);
  const seniorityTone = "neutral";

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <KpiCard label="Ise Alim Uzmani Skoru" value={resume.recruiter_score} />
        <div className="cp-card p-5">
          <div className="text-sm text-[var(--cp-text-dim)] mb-2">
            Algilanan Kidem
          </div>
          <Badge tone={seniorityTone}>{rec.perceived_seniority}</Badge>
        </div>
        <div className="cp-card p-5">
          <div className="text-sm text-[var(--cp-text-dim)] mb-2">
            Ise Alim Riskleri
          </div>
          <div className="text-3xl font-bold text-red-400">
            {rec.hiring_risks.length}
          </div>
        </div>
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-2">Ilk Izlenim</h3>
        <p className="text-sm text-[var(--cp-text-dim)]">
          {rec.first_impression}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-3">Ise Alim Riskleri</h3>
          <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
            {rec.hiring_risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-400">•</span> {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-3">One Cikan Sinyaller</h3>
          <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
            {rec.standout_signals.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-4">Olasi Mulakat Sorulari</h3>
        <div className="space-y-2">
          {rec.interview_questions.map((q, i) => (
            <div key={i} className="cp-card-light overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-4"
              >
                <span className="text-sm font-medium">{q.question}</span>
                <span className="text-[var(--cp-text-dim)]">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-sm text-[var(--cp-text-dim)] border-t border-[var(--cp-border)] pt-3">
                  {q.reasoning}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-2">Ise Alim Uzmani Ozeti</h3>
        <p className="text-sm text-[var(--cp-text-dim)]">
          {rec.recruiter_summary}
        </p>
      </div>
    </div>
  );
}

function RoadmapTab({ resume }) {
  const coach = resume.coach_analytics;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-1 gap-4">
        <KpiCard label="Kariyer Kocu Skoru" value={resume.coach_score} />
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-2">Kariyer Konumlandirma</h3>
        <p className="text-sm text-[var(--cp-text-dim)]">
          {coach.career_positioning}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-3">Ozguven Artiricilar</h3>
          <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
            {coach.confidence_boosters.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span> {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-3">Gelisim Oncelikleri</h3>
          <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
            {coach.development_priorities.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400">→</span> {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-3">Mulakat Hazirlik Plani</h3>
        <ol className="space-y-2 text-sm text-[var(--cp-text-dim)]">
          {coach.interview_preparation_plan.map((p, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[var(--cp-accent-light)] font-semibold">
                {i + 1}.
              </span>{" "}
              {p}
            </li>
          ))}
        </ol>
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-4">Kariyer Yol Haritasi</h3>
        <div className="relative pl-6 border-l-2 border-[var(--cp-border)] space-y-6">
          {coach.roadmap.map((item, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-[var(--cp-accent)]" />
              <p className="text-xs uppercase tracking-wide text-[var(--cp-accent-light)] mb-1">
                {item.timeframe}
              </p>
              <p className="text-sm font-medium mb-1">{item.action}</p>
              <p className="text-sm text-[var(--cp-text-dim)]">
                {item.expected_outcome}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-2">Kariyer Kocu Ozeti</h3>
        <p className="text-sm text-[var(--cp-text-dim)]">
          {coach.coach_summary}
        </p>
      </div>
    </div>
  );
}

function HistoryChart({ history }) {
  const data = [...history]
    .reverse()
    .map((h, i) => ({
      name: `#${i + 1}`,
      Genel: h.overall_score,
      ATS: h.ats_score,
      "Ise Alim": h.recruiter_score,
      Koc: h.coach_score,
    }));

  return (
    <div className="cp-card p-6">
      <h3 className="font-semibold mb-4">Gecmis Performans</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--cp-border)" />
          <XAxis dataKey="name" tick={{ fill: "var(--cp-text-dim)", fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "var(--cp-text-dim)", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--cp-panel-light)",
              border: "1px solid var(--cp-border)",
              borderRadius: 8,
              color: "var(--cp-text)",
            }}
          />
          <Legend />
          <Bar dataKey="Genel" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ATS" fill="#34d399" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Ise Alim" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Koc" fill="#f87171" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CareerPilotDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function handleUploaded(resume) {
    setDashboard((prev) => ({
      latest: resume,
      history: prev
        ? [
            {
              id: resume.id,
              original_filename: resume.original_filename,
              overall_score: resume.overall_score,
              ats_score: resume.ats_score,
              recruiter_score: resume.recruiter_score,
              coach_score: resume.coach_score,
              created_at: resume.created_at,
            },
            ...prev.history,
          ]
        : [
            {
              id: resume.id,
              original_filename: resume.original_filename,
              overall_score: resume.overall_score,
              ats_score: resume.ats_score,
              recruiter_score: resume.recruiter_score,
              coach_score: resume.coach_score,
              created_at: resume.created_at,
            },
          ],
    }));
    setActiveTab("overview");
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-[var(--cp-text-dim)]">
        Panel yukleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 max-w-xl mx-auto text-center">
          {error}
        </div>
      </div>
    );
  }

  const hasResume = dashboard && dashboard.latest;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kariyer Paneli</h1>
          <p className="text-sm text-[var(--cp-text-dim)]">
            CV analizlerinizi goruntuleyin ve yeni bir analiz baslatin.
          </p>
        </div>
      </div>

      <UploadPanel onUploaded={handleUploaded} />

      {!hasResume ? (
        <div className="cp-card p-10 text-center text-[var(--cp-text-dim)]">
          Henuz bir CV analizi yok. Baslamak icin yukaridan bir dosya yukleyin.
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto cp-scrollbar pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-[var(--cp-accent)] text-white"
                    : "cp-card-light text-[var(--cp-text-dim)] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <OverviewTab resume={dashboard.latest} />
          )}
          {activeTab === "ats" && <AtsTab resume={dashboard.latest} />}
          {activeTab === "interview" && (
            <InterviewTab resume={dashboard.latest} />
          )}
          {activeTab === "roadmap" && (
            <RoadmapTab resume={dashboard.latest} />
          )}

          {dashboard.history.length > 1 && (
            <HistoryChart history={dashboard.history} />
          )}
        </>
      )}
    </div>
  );
}
