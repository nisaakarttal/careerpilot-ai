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
import { getDashboard, uploadResume, getResumeById, createJobPost, listJobPosts, matchResumeToJob, startChatSession, getSessionMessages, sendChatMessage, getMyProfile, updateMyProfile, deleteResume } from "@/lib/api";
import { getToken } from "@/lib/auth";

const TABS = [
  { id: "overview", label: "Genel Bakış" },
  { id: "ats", label: "ATS Raporu" },
  { id: "jobmatch", label: "İş İlanı Eşleştirme" },
  { id: "interview", label: "Mülakat Simülatörü" },
  { id: "roadmap", label: "Kariyer Yol Haritası" },
  { id: "profile", label: "Profil ve Ayarlar" },
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
      <p className="font-medium mb-1">CV'nizi yükleyin</p>
      <p className="text-sm text-[var(--cp-text-dim)] mb-4">
        PDF veya DOCX formatında dosyanızı sürükleyip bırakın ya da seçin
      </p>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="cp-btn-primary"
      >
        {uploading ? "Analiz Ediliyor..." : "Dosya Seç"}
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
        <KpiCard label="İşe Alım Uzmanı Skoru" value={resume.recruiter_score} />
        <KpiCard label="Kariyer Koçu Skoru" value={resume.coach_score} />
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-1">Aday Özeti</h3>
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
          <h3 className="font-semibold mb-4">Bölüm Skorları</h3>
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
          <h3 className="font-semibold mb-4">Güçlü ve Zayıf Yönler</h3>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wide text-[var(--cp-text-dim)] mb-2">
              Güçlü Yönler
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
              Zayıf Yönler
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
          <h3 className="font-semibold mb-3">Eksik Bölümler</h3>
          <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
            {resume.cv_analytics.missing_sections.map((m, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-400">•</span> {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-3">Öncelikli İyileştirmeler</h3>
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
            Ayrıştırma Riski
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
        <h3 className="font-semibold mb-3">Biçimlendirme Sorunları</h3>
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
          Yeniden Yazılmış Madde İşaretleri (X-Y-Z Formülü)
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
                Revize Edilmiş
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
        <h3 className="font-semibold mb-2">ATS Optimizasyon Özeti</h3>
        <p className="text-sm text-[var(--cp-text-dim)]">
          {ats.ats_optimization_summary}
        </p>
      </div>
    </div>
  );
}


function InterviewSimulator({ resume, onBack }) {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  function connectWebSocket(sessionId) {
    const token = getToken();
    const wsUrl = `ws://localhost:8000/api/chat/ws/${sessionId}?token=${token}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const reply = JSON.parse(event.data);
        if (reply.error) {
          setError(reply.error);
        } else {
          setMessages((prev) => {
            if (prev.some((m) => m.id === reply.id)) return prev;
            return [...prev, reply];
          });
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      } finally {
        setSending(false);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("Gerçek zamanlı bağlantı kurulamadı. HTTP istekleri kullanılıyor.");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
  }

  async function initSimulator() {
    setLoading(true);
    setError("");
    try {
      const sess = await startChatSession(resume.id);
      setSession(sess);
      const msgs = await getSessionMessages(sess.id);
      setMessages(msgs);
      connectWebSocket(sess.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    initSimulator();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [resume.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!inputText.trim() || sending || !session) return;
    setError("");
    setSending(true);
    const userText = inputText;
    setInputText("");

    const tempUserMsg = {
      id: "temp-user-" + Date.now(),
      role: "user",
      content: userText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content: userText }));
    } else {
      try {
        const response = await sendChatMessage(session.id, userText);
        setMessages((prev) => [...prev, response]);
      } catch (err) {
        setError(err.message);
      } finally {
        setSending(false);
      }
    }
  }

  return (
    <div className="cp-card flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--cp-border)] flex justify-between items-center bg-[var(--cp-panel-light)] rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h4 className="font-semibold text-sm">Yapay Zeka Mülakat Simülatörü</h4>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-[var(--cp-text-dim)] hover:text-white border border-[var(--cp-border)] px-3 py-1.5 rounded-lg hover:bg-[var(--cp-panel)] transition-colors"
        >
          Simülasyondan Çık
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 cp-scrollbar bg-[var(--cp-panel-dark)]/30">
        {loading ? (
          <div className="text-center text-[var(--cp-text-dim)] text-sm py-10 animate-pulse">
            Mülakat oturumu başlatılıyor, yapay zeka özgeçmişinizi inceliyor...
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-gradient-to-br from-emerald-500 to-cyan-600 text-white rounded-br-none"
                      : "bg-[var(--cp-panel-light)] border border-[var(--cp-border)] text-white rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-[var(--cp-panel-light)] border border-[var(--cp-border)] rounded-xl rounded-bl-none px-4 py-3 text-sm text-[var(--cp-text-dim)] italic animate-pulse">
              İşe Alım Uzmanı yazıyor...
            </div>
          </div>
        )}
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-center">
            Hata: {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-[var(--cp-border)] flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading || sending || !session}
          placeholder="Cevabınızı buraya yazın..."
          className="flex-1 px-4 py-2.5 rounded-lg cp-card-light focus:outline-none focus:ring-2 focus:ring-[var(--cp-accent)] text-sm disabled:opacity-60 bg-[var(--cp-panel-light)] text-white"
        />
        <button
          type="submit"
          disabled={loading || sending || !inputText.trim() || !session}
          className="cp-btn-primary"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}

function InterviewTab({ resume }) {
  const rec = resume.recruiter_analytics;
  const [openIndex, setOpenIndex] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const seniorityTone = "neutral";

  if (showSimulator) {
    return <InterviewSimulator resume={resume} onBack={() => setShowSimulator(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h3 className="font-semibold text-lg">İşe Alım Uzmanı Raporu</h3>
        <button
          onClick={() => setShowSimulator(true)}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950/20"
        >
          <span>💬</span> Mülakat Simülasyonu Başlat
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <KpiCard label="İşe Alım Uzmanı Skoru" value={resume.recruiter_score} />
        <div className="cp-card p-5">
          <div className="text-sm text-[var(--cp-text-dim)] mb-2">
            Algılanan Kıdem
          </div>
          <Badge tone={seniorityTone}>{rec.perceived_seniority}</Badge>
        </div>
        <div className="cp-card p-5">
          <div className="text-sm text-[var(--cp-text-dim)] mb-2">
            İşe Alım Riskleri
          </div>
          <div className="text-3xl font-bold text-red-400">
            {rec.hiring_risks.length}
          </div>
        </div>
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-2">İlk İzlenim</h3>
        <p className="text-sm text-[var(--cp-text-dim)]">
          {rec.first_impression}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-3">İşe Alım Riskleri</h3>
          <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
            {rec.hiring_risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-400">•</span> {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-3">Öne Çıkan Sinyaller</h3>
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
        <h3 className="font-semibold mb-4">Olası Mülakat Soruları</h3>
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
        <h3 className="font-semibold mb-2">İşe Alım Uzmanı Özeti</h3>
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
        <KpiCard label="Kariyer Koçu Skoru" value={resume.coach_score} />
      </div>

      <div className="cp-card p-6">
        <h3 className="font-semibold mb-2">Kariyer Konumlandırma</h3>
        <p className="text-sm text-[var(--cp-text-dim)]">
          {coach.career_positioning}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-3">Özgüven Artırıcılar</h3>
          <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
            {coach.confidence_boosters.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span> {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="cp-card p-6">
          <h3 className="font-semibold mb-3">Gelişim Öncelikleri</h3>
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
        <h3 className="font-semibold mb-3">Mülakat Hazırlık Planı</h3>
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
        <h3 className="font-semibold mb-4">Kariyer Yol Haritası</h3>
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
        <h3 className="font-semibold mb-2">Kariyer Koçu Özeti</h3>
        <p className="text-sm text-[var(--cp-text-dim)]">
          {coach.coach_summary}
        </p>
      </div>
    </div>
  );
}




const MOCK_LINKEDIN_JOBS = [
  {
    title: "Yazılım Geliştirme Mühendisi (Full Stack)",
    company: "Trendyol Group",
    description: "Trendyol olarak milyonlarca müşteriye hizmet veren yüksek trafikli microservices mimarilerinde görev alacak Full Stack Mühendisler arıyoruz.\n\nGenel Nitelikler:\n- React, Next.js ve modern frontend teknolojilerinde en az 3 yıl deneyim\n- Node.js, Python, Java veya benzeri backend dillerinden birinde tecrübe\n- PostgreSQL, Redis, Elasticsearch ve NoSQL veritabanı deneyimi\n- Docker, Kubernetes, CI/CD süreçlerine hakimiyet\n- RESTful API tasarımı ve mikroservis mimarisi bilgisi\n- Problem çözme yeteneği gelişmiş ve takım çalışmasına yatkın."
  },
  {
    title: "Yapay Zeka & Veri Bilimci",
    company: "Aselsan",
    description: "Aselsan bünyesinde savunma sanayii ve sivil alanlarda yapay zeka tabanlı sistemlerin araştırma ve geliştirme süreçlerinde görev alacak çalışma arkadaşları arıyoruz.\n\nAranan Nitelikler:\n- Python dilinde ileri seviye kodlama becerisi\n- PyTorch, TensorFlow veya JAX kütüphaneleri ile derin öğrenme projeleri geliştirmiş\n- LLM (Large Language Models), RAG, Prompt Engineering alanlarında pratik bilgi sahibi\n- SQL, PostgreSQL ve vektör veritabanları (Chroma, PGVector, Pinecone) tecrübesi\n- Büyük veri işleme teknolojilerine (Spark, Hadoop) aşinalık\n- İyi derecede İngilizce bilgisi."
  },
  {
    title: "Frontend Developer",
    company: "Getir",
    description: "Getir bünyesinde hızlı teslimat operasyonlarımızın kullanıcı arayüzlerini geliştirecek Frontend Geliştiriciler arıyoruz.\n\nNitelikler:\n- HTML5, CSS3, TailwindCSS ve Vanilla Javascript konularında uzmanlaşmış\n- React, Redux, Next.js teknolojilerinde en az 2 yıl aktif deneyim\n- Responsive Web Design, Cross-Browser Compatibility konularına hakim\n- REST API entegrasyonu, JSON yapıları ve WebSocket iletişim süreçlerinde tecrübeli\n- Git versiyon kontrol sistemi kullanımı ve CI/CD süreçleri bilgisi\n- UX/UI tasarımlarını piksel kusursuzluğunda koda dökebilen."
  }
];

function JobMatchTab({ resume }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function fetchJobs() {
    setLoading(true);
    try {
      const data = await listJobPosts();
      setJobs(data);
      if (data.length > 0) {
        setSelectedJobId(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [resume.id]);

  async function handleCreateJob(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const newJob = await createJobPost({ title, company, description });
      setJobs((prev) => [newJob, ...prev]);
      setSelectedJobId(newJob.id);
      setShowForm(false);
      setTitle("");
      setCompany("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMatch() {
    if (!selectedJobId) return;
    setError("");
    setMatching(true);
    setMatchResult(null);
    try {
      const result = await matchResumeToJob(selectedJobId, resume.id);
      setMatchResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setMatching(false);
    }
  }

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">İş İlanı Eşleştirme</h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setMatchResult(null);
          }}
          className="cp-btn-primary"
        >
          {showForm ? "İlan Seçimine Dön" : "Yeni İş İlanı Ekle"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleCreateJob} className="cp-card p-6 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[var(--cp-border)] pb-3 flex-wrap gap-2">
            <h4 className="font-semibold text-white">Yeni İş İlanı Bilgileri</h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-[var(--cp-text-dim)] font-medium">Hızlı Doldur (Mock İlanlar):</span>
              {MOCK_LINKEDIN_JOBS.map((mj, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTitle(mj.title);
                    setCompany(mj.company);
                    setDescription(mj.description);
                  }}
                  className="px-2.5 py-1 rounded bg-[var(--cp-panel-light)] hover:bg-[var(--cp-accent)]/20 border border-[var(--cp-border)] hover:border-[var(--cp-accent)] text-xs text-[var(--cp-text-dim)] hover:text-white transition-all font-medium"
                >
                  {mj.company}
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5 text-[var(--cp-text-dim)]">İlan Başlığı</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg cp-card-light focus:outline-none focus:ring-2 focus:ring-[var(--cp-accent)] text-sm"
                placeholder="Senior React Developer"
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5 text-[var(--cp-text-dim)]">Şirket Adı</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg cp-card-light focus:outline-none focus:ring-2 focus:ring-[var(--cp-accent)] text-sm"
                placeholder="TechCorp"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1.5 text-[var(--cp-text-dim)]">İlan Detayı / Açıklaması</label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg cp-card-light focus:outline-none focus:ring-2 focus:ring-[var(--cp-accent)] text-sm"
              placeholder="Pozisyon gereksinimleri, aranan özellikler, görev tanımı..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "İlanı Kaydet"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="cp-card p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1 bg-transparent">
              <label className="block text-sm mb-1.5 text-[var(--cp-text-dim)]">Eşleştirilecek İş İlanı Seçin</label>
              {jobs.length === 0 ? (
                <p className="text-sm text-[var(--cp-text-dim)]">Kayıtlı iş ilanı bulunmuyor. Yeni bir tane ekleyerek başlayın.</p>
              ) : (
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => {
                       const dd = document.getElementById('job-dropdown');
                       if (dd) dd.classList.toggle('hidden');
                    }} 
                    className="w-full text-left px-4 py-3 rounded-lg cp-card-light focus:outline-none focus:ring-2 focus:ring-[var(--cp-accent)] text-sm border border-[var(--cp-border)] flex justify-between items-center transition-colors hover:border-[var(--cp-accent)]"
                  >
                    <span className="text-white font-medium truncate pr-4">
                      {jobs.find(j => j.id === selectedJobId)?.title || "İlan Seçin..."} - <span className="text-[var(--cp-text-dim)] font-normal">{jobs.find(j => j.id === selectedJobId)?.company}</span>
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--cp-text-dim)]"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                  <div id="job-dropdown" className="hidden absolute z-50 w-full mt-2 bg-[var(--cp-panel-light)] border border-[var(--cp-border)] rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                    <div className="max-h-60 overflow-y-auto cp-scrollbar">
                      {jobs.map((job) => (
                        <div 
                          key={job.id} 
                          onClick={() => { 
                            setSelectedJobId(job.id); 
                            setMatchResult(null); 
                            document.getElementById('job-dropdown').classList.add('hidden');
                          }}
                          className={`px-4 py-3 cursor-pointer text-sm transition-colors border-b border-[var(--cp-border)] last:border-0 ${
                            selectedJobId === job.id 
                              ? "bg-gradient-to-r from-[#10b981]/15 to-[#06b6d4]/15 border-l-2 border-l-[#10b981] text-white" 
                              : "hover:bg-[var(--cp-panel)] text-[var(--cp-text-dim)] hover:text-white border-l-2 border-l-transparent"
                          }`}
                        >
                          <div className="font-medium">{job.title}</div>
                          <div className="text-xs opacity-70 mt-0.5">{job.company}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleMatch}
              disabled={matching || !selectedJobId}
              className="cp-btn-primary whitespace-nowrap"
            >
              {matching ? "Eşleştiriliyor..." : "Özgeçmişle Eşleştir"}
            </button>
          </div>

          {selectedJob && !matchResult && (
            <div className="cp-card p-6">
              <h4 className="font-semibold text-md mb-2">{selectedJob.title} @ {selectedJob.company}</h4>
              <p className="text-xs text-[var(--cp-text-dim)] mb-4">
                Kayıt Tarihi: {new Date(selectedJob.created_at).toLocaleDateString("tr-TR")}
              </p>
              <div className="bg-[var(--cp-panel-light)] rounded-lg p-4 max-h-60 overflow-y-auto cp-scrollbar text-sm whitespace-pre-line text-[var(--cp-text-dim)]">
                {selectedJob.description}
              </div>
            </div>
          )}

          {matchResult && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="cp-card p-5">
                  <div className="text-sm text-[var(--cp-text-dim)] mb-2">Semantik Eşleşme Skoru</div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: scoreColor(matchResult.match_score) }}
                    >
                      {Math.round(matchResult.match_score)}
                    </span>
                    <span className="text-sm text-[var(--cp-text-dim)]">/ 100</span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-[var(--cp-border)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${matchResult.match_score}%`,
                        backgroundColor: scoreColor(matchResult.match_score),
                      }}
                    />
                  </div>
                </div>

                <div className="cp-card p-5 md:col-span-2">
                  <div className="text-sm text-[var(--cp-text-dim)] mb-2">Eşleşme Özeti</div>
                  <p className="text-sm text-[var(--cp-text-dim)] leading-relaxed">
                    {matchResult.match_analytics.match_summary}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="cp-card p-6">
                  <h4 className="font-semibold mb-3 text-emerald-400">Güçlü Eşleşmeler</h4>
                  <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
                    {matchResult.match_analytics.strong_fits.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="cp-card p-6">
                  <h4 className="font-semibold mb-3 text-red-400">Eksik Yetkinlikler / Kelimeler</h4>
                  <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
                    {matchResult.match_analytics.missing_skills.map((m, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400">•</span> {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="cp-card p-6">
                <h4 className="font-semibold mb-3 text-amber-400">Özgeçmiş İyileştirme Önerileri</h4>
                <ul className="space-y-2 text-sm text-[var(--cp-text-dim)]">
                  {matchResult.match_analytics.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400">→</span> {imp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function AnalysisProgressPanel({ progress, filename }) {
  return (
    <div className="cp-card p-6 space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-[var(--cp-text-dim)]">
          Özgeçmiş Analiz Ediliyor: <span className="text-white font-semibold">{filename}</span>
        </span>
        <span className="font-semibold text-[var(--cp-accent-light)]">{progress}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-[var(--cp-border)] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-[var(--cp-text-dim)] italic text-center animate-pulse">
        {progress < 25 && "Yapay zeka profilinizi inceliyor..."}
        {progress >= 25 && progress < 50 && "Genel CV raporu tamamlandı. ATS uyumluluğu kontrol ediliyor..."}
        {progress >= 50 && progress < 75 && "ATS uyumluluğu tamamlandı. İşe alım uzmanı gözüyle değerlendiriliyor..."}
        {progress >= 75 && progress < 100 && "İşe alım uzmanı değerlendirmesi tamamlandı. Kariyer planı hazırlanıyor..."}
        {progress === 100 && "Analiz başarıyla tamamlandı!"}
      </p>
    </div>
  );
}

function HistorySidebar({ history, selectedId, onSelect, onDelete }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="cp-card p-5 h-full max-h-[800px] overflow-y-auto cp-scrollbar animate-fadeIn">
      <h3 className="font-semibold mb-4 text-lg border-b border-[var(--cp-border)] pb-2 text-white">Geçmiş Özgeçmişler</h3>
      <div className="space-y-3">
        {history.map((h) => (
          <div key={h.id} className="group relative">
            <button
              onClick={() => onSelect(h.id)}
              className={`w-full text-left p-3 pr-8 rounded-lg transition-colors border ${
                selectedId === h.id
                  ? "bg-[var(--cp-accent)]/10 border-[var(--cp-accent)] text-[var(--cp-accent-light)]"
                  : "border-[var(--cp-border)] hover:bg-[var(--cp-panel-light)]"
              }`}
            >
              <div className="font-medium text-sm truncate text-white" title={h.original_filename || "Özgeçmiş"}>
                {h.original_filename || "İsimsiz Özgeçmiş"}
              </div>
              <div className="text-xs text-[var(--cp-text-dim)] mt-1 flex justify-between">
                {h.overall_score === 0 ? (
                  <span className="text-[var(--cp-accent-light)] animate-pulse font-semibold">Analiz Ediliyor...</span>
                ) : (
                  <span>Skor: <span className="font-semibold">{Math.round(h.overall_score)}</span></span>
                )}
                <span>{new Date(h.created_at).toLocaleDateString("tr-TR")}</span>
              </div>
            </button>
            
            <button
              onClick={(e) => onDelete(h.id, e)}
              className="absolute right-2.5 top-3.5 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 text-xs transition-opacity focus:opacity-100 bg-transparent border-0 cursor-pointer"
              title="Sil"
            >
              ✕
            </button>
          </div>
        ))}
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
      <h3 className="font-semibold mb-4">Geçmiş Performans</h3>
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


function ProfileTab() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [updating, setUpdating] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const data = await getMyProfile();
      setProfile(data);
      setFullName(data.full_name);
      setEmail(data.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setUpdating(true);

    const payload = {};
    if (fullName !== profile.full_name) payload.full_name = fullName;
    if (email !== profile.email) payload.email = email;
    if (password) payload.password = password;

    if (Object.keys(payload).length === 0) {
      setUpdating(false);
      return;
    }

    try {
      const updated = await updateMyProfile(payload);
      setProfile(updated);
      setSuccessMsg("Profil bilgileriniz başarıyla güncellendi.");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <div className="text-center text-[var(--cp-text-dim)] py-10">Profil yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
          <div className="cp-card p-5 text-center">
            <span className="text-xs text-[var(--cp-text-dim)] block mb-1">Yüklenen CV Sayısı</span>
            <span className="text-2xl font-bold text-[var(--cp-accent-light)]">{profile.total_resumes}</span>
          </div>
          <div className="cp-card p-5 text-center">
            <span className="text-xs text-[var(--cp-text-dim)] block mb-1">Eklenen İlanlar</span>
            <span className="text-2xl font-bold text-indigo-400">{profile.total_jobs}</span>
          </div>
          <div className="cp-card p-5 text-center">
            <span className="text-xs text-[var(--cp-text-dim)] block mb-1">Yapılan Eşleşmeler</span>
            <span className="text-2xl font-bold text-emerald-400">{profile.total_matches}</span>
          </div>
          <div className="cp-card p-5 text-center">
            <span className="text-xs text-[var(--cp-text-dim)] block mb-1">Mülakat Oturumları</span>
            <span className="text-2xl font-bold text-pink-400">{profile.total_chats}</span>
          </div>
        </div>
      )}

      <div className="cp-card p-6 max-w-2xl mx-auto space-y-6 animate-fadeIn">
        <h3 className="font-semibold text-lg border-b border-[var(--cp-border)] pb-3">Profil Ayarları</h3>
        
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-xs text-[var(--cp-text-dim)] font-medium block mb-1.5 font-semibold text-white">Ad Soyad</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cp-accent)] text-sm bg-[var(--cp-panel-light)] border border-[var(--cp-border)] text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs text-[var(--cp-text-dim)] font-medium block mb-1.5 font-semibold text-white">E-posta Adresi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cp-accent)] text-sm bg-[var(--cp-panel-light)] border border-[var(--cp-border)] text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs text-[var(--cp-text-dim)] font-medium block mb-1.5 font-semibold text-white">Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cp-accent)] text-sm bg-[var(--cp-panel-light)] border border-[var(--cp-border)] text-white"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="cp-btn-primary w-full"
          >
            {updating ? "Güncelleniyor..." : "Profil Bilgilerini Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CareerPilotDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedResume, setSelectedResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [analyzingResumeId, setAnalyzingResumeId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, resumeId: null });
  const [analysisProgress, setAnalysisProgress] = useState(0);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const data = await getDashboard();
      setDashboard(data);
      if (data && data.latest) {
        setSelectedResume(data.latest);
        // If the latest resume is still being analyzed
        let isAnalyzing = !data.latest.cv_analytics || !data.latest.ats_analytics || !data.latest.recruiter_analytics || !data.latest.coach_analytics;
        if (isAnalyzing) {
          setAnalyzingResumeId(data.latest.id);
          let progress = 0;
          if (data.latest.cv_analytics) progress += 25;
          if (data.latest.ats_analytics) progress += 25;
          if (data.latest.recruiter_analytics) progress += 25;
          if (data.latest.coach_analytics) progress += 25;
          setAnalysisProgress(progress);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // Poll for analyzing resume progress
  useEffect(() => {
    if (!analyzingResumeId) return;

    let intervalId = setInterval(async () => {
      try {
        const data = await getResumeById(analyzingResumeId);
        
        let progress = 0;
        if (data.cv_analytics) progress += 25;
        if (data.ats_analytics) progress += 25;
        if (data.recruiter_analytics) progress += 25;
        if (data.coach_analytics) progress += 25;

        setAnalysisProgress(progress);
        setSelectedResume(data);

        // Update in dashboard local state so history gets updated scores
        setDashboard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            history: prev.history.map((h) => {
              if (h.id === data.id) {
                return {
                  ...h,
                  overall_score: data.overall_score,
                  ats_score: data.ats_score,
                  recruiter_score: data.recruiter_score,
                  coach_score: data.coach_score,
                };
              }
              return h;
            }),
          };
        });

        if (progress === 100) {
          setAnalyzingResumeId(null);
          // Complete reload to make sure everything is in sync
          const dashData = await getDashboard();
          setDashboard(dashData);
        }
      } catch (err) {
        console.error("Error polling resume progress:", err);
        setAnalyzingResumeId(null);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [analyzingResumeId]);

  function handleDeleteResume(resumeId, e) {
    if (e) e.stopPropagation();
    setDeleteConfirm({ open: true, resumeId });
  }

  async function confirmDeleteResume() {
    const resumeId = deleteConfirm.resumeId;
    setDeleteConfirm({ open: false, resumeId: null });

    try {
      await deleteResume(resumeId);
      
      // Update local state history
      setDashboard((prev) => {
        if (!prev) return prev;
        const newHistory = prev.history.filter((h) => h.id !== resumeId);
        let newLatest = prev.latest;
        if (prev.latest && prev.latest.id === resumeId) {
          newLatest = newHistory.length > 0 ? newHistory[0] : null;
        }
        return {
          ...prev,
          latest: newLatest,
          history: newHistory
        };
      });

      // Update selectedResume if it was the one deleted
      if (selectedResume && selectedResume.id === resumeId) {
        setAnalyzingResumeId(null);
        
        // Find if we have another resume left to select
        const remaining = dashboard.history.filter((h) => h.id !== resumeId);
        if (remaining.length > 0) {
          handleSelectHistory(remaining[0].id);
        } else {
          setSelectedResume(null);
        }
      }
    } catch (err) {
      alert("Özgeçmiş silinirken bir hata oluştu: " + err.message);
    }
  }

  async function handleSelectHistory(id) {
    setLoadingResume(true);
    setError("");
    setAnalyzingResumeId(null); // Stop current polling if user clicks another CV
    try {
      const data = await getResumeById(id);
      setSelectedResume(data);
      setActiveTab("overview");
      
      // If the selected CV is still being analyzed, start polling it
      let isAnalyzing = !data.cv_analytics || !data.ats_analytics || !data.recruiter_analytics || !data.coach_analytics;
      if (isAnalyzing) {
        setAnalyzingResumeId(data.id);
        let progress = 0;
        if (data.cv_analytics) progress += 25;
        if (data.ats_analytics) progress += 25;
        if (data.recruiter_analytics) progress += 25;
        if (data.coach_analytics) progress += 25;
        setAnalysisProgress(progress);
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingResume(false);
    }
  }

  function handleUploaded(resume) {
    setDashboard((prev) => ({
      latest: resume,
      history: prev
        ? [
            {
              id: resume.id,
              original_filename: resume.original_filename,
              overall_score: 0.0,
              ats_score: 0.0,
              recruiter_score: 0.0,
              coach_score: 0.0,
              created_at: resume.created_at,
            },
            ...prev.history,
          ]
        : [
            {
              id: resume.id,
              original_filename: resume.original_filename,
              overall_score: 0.0,
              ats_score: 0.0,
              recruiter_score: 0.0,
              coach_score: 0.0,
              created_at: resume.created_at,
            },
          ],
    }));
    setSelectedResume(resume);
    setAnalyzingResumeId(resume.id);
    setAnalysisProgress(0);
    setActiveTab("overview");
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-[var(--cp-text-dim)]">
        Panel yükleniyor...
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

  const hasResume = selectedResume !== null;
  const isSelectedResumeAnalyzing = selectedResume && (!selectedResume.cv_analytics || !selectedResume.ats_analytics || !selectedResume.recruiter_analytics || !selectedResume.coach_analytics);

  return (
    <>
      {deleteConfirm.open && (
        <div className="cp-modal-backdrop" onClick={() => setDeleteConfirm({ open: false, resumeId: null })}>
          <div className="cp-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Özgeçmişi Sil</h3>
                <p className="text-xs text-[var(--cp-text-dim)]">Bu işlem geri alınamaz</p>
              </div>
            </div>
            <p className="text-sm text-[var(--cp-text-dim)] leading-relaxed mb-6">
              Bu özgeçmiş ve bağlı tüm veriler (mülakat geçmişi, iş ilanı eşleşmeleri) kalıcı olarak silinecek. Devam etmek istiyor musunuz?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({ open: false, resumeId: null })}
                className="cp-btn-secondary"
              >
                Vazgeç
              </button>
              <button
                onClick={confirmDeleteResume}
                className="cp-btn-danger"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        {dashboard && dashboard.history && dashboard.history.length > 0 && (
          <div className="w-full md:w-1/4 shrink-0">
            <HistorySidebar 
              history={dashboard.history} 
              selectedId={selectedResume?.id} 
              onSelect={handleSelectHistory} 
              onDelete={handleDeleteResume}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 space-y-8 min-w-0">
          <div>
            <h1 className="text-2xl font-semibold">Kariyer Paneli</h1>
            <p className="text-sm text-[var(--cp-text-dim)]">
              CV analizlerinizi görüntüleyin ve yeni bir analiz başlatın.
            </p>
          </div>

          <UploadPanel onUploaded={handleUploaded} />

          <div className="flex gap-2 overflow-x-auto cp-scrollbar pb-1 border-b border-[var(--cp-border)] pt-2">
            {TABS.map((tab) => {
              // Hide tabs that require a resume if there isn't one
              if (!hasResume && tab.id !== "profile") return null;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "cp-tab-active"
                      : "cp-card-light text-[var(--cp-text-dim)] hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "profile" ? (
            <ProfileTab />
          ) : loadingResume ? (
            <div className="cp-card p-10 text-center text-[var(--cp-text-dim)]">
              Seçilen CV yükleniyor...
            </div>
          ) : !hasResume ? (
            <div className="cp-card p-10 text-center text-[var(--cp-text-dim)]">
              Henüz bir CV analizi yok. Başlamak için yukarıdan bir dosya yükleyin.
            </div>
          ) : isSelectedResumeAnalyzing ? (
            <AnalysisProgressPanel 
              progress={analysisProgress} 
              filename={selectedResume.original_filename} 
            />
          ) : (
            <>
              {activeTab === "overview" && <OverviewTab resume={selectedResume} />}
              {activeTab === "ats" && <AtsTab resume={selectedResume} />}
              {activeTab === "jobmatch" && <JobMatchTab resume={selectedResume} />}
              {activeTab === "interview" && <InterviewTab resume={selectedResume} />}
              {activeTab === "roadmap" && <RoadmapTab resume={selectedResume} />}

              {dashboard && dashboard.history.length > 1 && (
                <HistoryChart history={dashboard.history} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
