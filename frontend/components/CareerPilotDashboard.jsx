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
import {
  getDashboard,
  uploadResume,
  getResumeById,
  createJobPost,
  listJobPosts,
  matchResumeToJob,
  startChatSession,
  listChatSessions,
  completeChatSession,
  getSessionMessages,
  sendChatMessage,
  getChatWebSocketUrl,
  getMyProfile,
  updateMyProfile,
  deleteResume,
} from "@/lib/api";
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
  if (score >= 75) return "#0EA5E9"; // Canlı Mavi
  if (score >= 50) return "#A855F7"; // Mor
  return "#EC4899"; // Canlı Pembe
}

function KpiCard({ label, value, type = "overall" }) {
  const gradients = {
    overall: "from-[#38BDF8] to-[#0EA5E9]",
    ats: "from-[#EC4899] to-[#F9A8D4]",
    recruiter: "from-[#A855F7] to-[#7C3AED]",
    coach: "from-[#0EA5E9] to-[#7C3AED]",
  };

  const bgGradient = gradients[type] || gradients.overall;

  return (
    <div className="bg-white rounded-[24px] p-[28px] border border-gray-100 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${bgGradient}`} />
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${bgGradient} opacity-20 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold`}>
          ✓
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 mb-4">
        <span className="text-4xl font-extrabold tracking-tight text-slate-900">
          {Math.round(value)}
        </span>
        <span className="text-sm font-medium text-slate-400">/ 100</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/50">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${bgGradient}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    good: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    bad: "bg-[#FCE7F3] text-[#EC4899] border-[#F9A8D4]",
    warn: "bg-amber-50 text-amber-700 border-amber-200/60",
    neutral: "bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]",
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border ${tones[tone]} transition-all duration-200 shadow-sm`}
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
      className={`bg-white rounded-[24px] p-8 md:p-10 text-center border-2 border-dashed transition-all duration-300 shadow-xl ${
        dragging
          ? "border-[#0EA5E9] bg-[#E0F2FE]/40 scale-[1.01]"
          : "border-slate-200 hover:border-[#BAE6FD] hover:bg-[#E0F2FE]/10"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#38BDF8] to-[#0EA5E9] text-white flex items-center justify-center shadow-lg shadow-sky-200 animate-bounce">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p className="text-xl font-bold text-slate-800 mb-1">CV'nizi Yükleyin ve Analiz Edin</p>
      <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
        PDF veya DOCX formatındaki özgeçmişinizi buraya sürükleyin ya da cihazınızdan seçin.
      </p>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white font-semibold shadow-lg shadow-sky-200 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analiz Ediliyor...
          </span>
        ) : (
          "Dosya Seçin"
        )}
      </button>
      {error && (
        <div className="mt-4 text-sm text-[#EC4899] bg-[#FCE7F3] border border-[#F9A8D4] rounded-2xl px-4 py-3 inline-block font-medium">
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
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <KpiCard label="Genel Skor" value={resume.overall_score} type="overall" />
        <KpiCard label="ATS Skoru" value={resume.ats_score} type="ats" />
        <KpiCard label="İşe Alım Uzmanı Skoru" value={resume.recruiter_score} type="recruiter" />
        <KpiCard label="Kariyer Koçu Skoru" value={resume.coach_score} type="coach" />
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl hover:-translate-y-1 transition-all duration-300">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Aday Özeti</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {resume.cv_analytics.candidate_summary}
        </p>
        <div className="flex flex-wrap gap-2">
          {resume.cv_analytics.job_title_fit.map((title, i) => (
            <Badge key={i} tone="neutral">{title}</Badge>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Bölüm Skorları</h3>
          <ResponsiveContainer width="110%" height={320}>
            <RadarChart
              data={radarData}
              outerRadius="60%" //
              margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
            >
              <PolarGrid stroke="#BAE6FD" />
              <PolarAngleAxis
                dataKey="section"
                tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#94A3B8", fontSize: 10 }}
              />
              <Radar
                dataKey="score"
                stroke="#7C3AED"
                fill="rgba(124, 58, 237, 0.2)"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Güçlü ve Zayıf Yönler</h3>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Güçlü Yönler
              </p>
              <div className="flex flex-wrap gap-2">
                {resume.cv_analytics.strengths.map((s, i) => (
                  <Badge key={i} tone="good">{s}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Zayıf Yönler
            </p>
            <div className="flex flex-wrap gap-2">
              {resume.cv_analytics.weaknesses.map((w, i) => (
                <Badge key={i} tone="bad">{w}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Eksik Bölümler</h3>
          <ul className="space-y-3">
            {resume.cv_analytics.missing_sections.map((m, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-600 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
                {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Öncelikli İyileştirmeler</h3>
          <ul className="space-y-3">
            {resume.cv_analytics.top_fixes.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-600 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                <span className="font-bold text-[#0EA5E9]">{i + 1}.</span>
                {f}
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
    <div className="space-y-8 animate-fadeIn">
      <div className="grid md:grid-cols-3 gap-6">
        <KpiCard label="ATS Skoru" value={resume.ats_score} type="ats" />
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl flex flex-col justify-center items-start">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Ayrıştırma Riski
          </span>
          <Badge tone={riskTone}>{ats.parsing_risk_level.toUpperCase()}</Badge>
        </div>
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Eksik Anahtar Kelimeler
          </span>
          <span className="text-4xl font-extrabold text-[#A855F7]">
            {ats.keyword_gaps.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Biçimlendirme Sorunları</h3>
        <div className="space-y-3">
          {ats.formatting_issues.map((issue, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-[#FCE7F3]/40 border border-[#F9A8D4] rounded-2xl p-4 text-sm text-slate-800"
            >
              <span className="text-[#EC4899] font-bold">⚠</span>
              <span>{issue}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Eksik Anahtar Kelimeler</h3>
        <div className="flex flex-wrap gap-2">
          {ats.keyword_gaps.map((k, i) => (
            <Badge key={i} tone="warn">{k}</Badge>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-6">
          Yeniden Yazılmış Madde İşaretleri (X-Y-Z Formülü)
        </h3>
        <div className="space-y-6">
          {ats.revised_bullets.map((b, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 relative">
              <div className="mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 block mb-1">
                  Orijinal
                </span>
                <p className="text-sm text-slate-500 line-through decoration-rose-400/60">
                  {b.original}
                </p>
              </div>
              <div className="mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  Revize Edilmiş
                </span>
                <p className="text-sm font-medium text-slate-800">{b.revised}</p>
              </div>
              <p className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-slate-100">
                💡 {b.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-2">ATS Optimizasyon Özeti</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {ats.ats_optimization_summary}
        </p>
      </div>
    </div>
  );
}

const ASSISTANT_UI = {
  interview: {
    title: "Yapay Zeka Mülakat Simülatörü",
    exitLabel: "Simülasyondan Çık",
    loadingLabel: "Mülakat oturumu başlatılıyor, yapay zeka özgeçmişinizi inceliyor...",
    typingLabel: "İşe Alım Uzmanı yazıyor...",
    inputPlaceholder: "Cevabınızı buraya yazın...",
    completeLabel: "Mülakatı Bitir ve Değerlendir",
  },
  career_coach: {
    title: "AI Kariyer Koçu",
    exitLabel: "Koç Görüşmesinden Çık",
    loadingLabel: "Kariyer koçu özgeçmişinizi ve yol haritanızı inceliyor...",
    typingLabel: "Kariyer Koçu yazıyor...",
    inputPlaceholder: "Hedefinizi veya sorunuzu yazın...",
    completeLabel: "Görüşmeyi Bitir ve Planı Oluştur",
  },
};

function SessionResultPanel({ assistantType, result, onBack }) {
  if (assistantType === "interview") {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-xl font-bold text-slate-900">Mülakat Değerlendirmesi</h3>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white font-medium shadow-md hover:scale-105 transition-all"
          >
            Rapora Dön
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <KpiCard label="Genel Performans" value={result.overall_score} type="overall" />
          <KpiCard label="İletişim" value={result.communication_score} type="ats" />
          <KpiCard label="Teknik Derinlik" value={result.technical_depth_score} type="recruiter" />
          <KpiCard label="Somut Kanıt" value={result.evidence_score} type="coach" />
        </div>
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Değerlendirme Özeti</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{result.evaluation_summary}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
            <h3 className="text-lg font-bold text-emerald-600 mb-4">Güçlü Yönler</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {result.strengths.map((item, index) => <li key={index} className="flex gap-2"><span>✓</span>{item}</li>)}
            </ul>
          </div>
          <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
            <h3 className="text-lg font-bold text-amber-500 mb-4">Gelişim Alanları</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {result.improvement_areas.map((item, index) => <li key={index} className="flex gap-2"><span>→</span>{item}</li>)}
            </ul>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Önerilen Cevap Çerçevesi</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{result.recommended_answer_framework}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h3 className="text-xl font-bold text-slate-900">Güncellenmiş Kariyer Planı</h3>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white font-medium shadow-md hover:scale-105 transition-all"
        >
          Yol Haritasına Dön
        </button>
      </div>
      <KpiCard label="Kariyer Hazırlık Skoru" value={result.coach_score} type="coach" />
      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Kariyer Konumlandırma</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{result.career_positioning}</p>
      </div>
      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Görüşmeye Göre Yol Haritası</h3>
        <div className="space-y-6 relative pl-6 border-l-2 border-sky-100">
          {result.roadmap.map((item, index) => (
            <div key={index} className="relative">
              <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#0EA5E9] ring-4 ring-sky-100" />
              <p className="text-xs font-bold uppercase tracking-wider text-[#0EA5E9] mb-1">{item.timeframe}</p>
              <p className="text-sm font-semibold text-slate-800 mb-1">{item.action}</p>
              <p className="text-sm text-slate-500">{item.expected_outcome}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Koç Özeti</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{result.coach_summary}</p>
      </div>
    </div>
  );
}

function AssistantChat({ resume, assistantType, onBack }) {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const ui = ASSISTANT_UI[assistantType];

  function connectWebSocket(sessionId) {
    const token = getToken();
    const wsUrl = getChatWebSocketUrl(sessionId, token);

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
      const activeSessions = await listChatSessions({
        resumeId: resume.id,
        assistantType,
        status: "active",
      });
      const sess = activeSessions[0] || await startChatSession(resume.id, assistantType);
      setSession(sess);
      setSessionResult(
        sess.session_result && Object.keys(sess.session_result).length > 0
          ? sess.session_result
          : null
      );
      const msgs = await getSessionMessages(sess.id);
      setMessages(msgs);
      if (sess.status === "active") connectWebSocket(sess.id);
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
  }, [assistantType, resume.id]);

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

  async function handleComplete() {
    if (!session || completing || !messages.some((message) => message.role === "user")) return;
    setCompleting(true);
    setError("");
    try {
      const completedSession = await completeChatSession(session.id);
      setSession(completedSession);
      setSessionResult(completedSession.session_result);
      wsRef.current?.close();
    } catch (err) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  }

    if (sessionResult) {
    return (
      <SessionResultPanel
        assistantType={assistantType}
        result={sessionResult}
        onBack={onBack}
      />
    );
  }

  return (
  /* 1. Tüm alanı kaplayan ve içeriği ortalayan dış kapsayıcı */
  <div className="w-full min-h-screen py-8 px-4 flex justify-center items-center">

    {/* 2. Kartı ve ikonları bağlayan merkez konteyner */}
    <div className="w-full max-w-4xl relative">

      {/* ─── 🟢 EKRANIN SOL DIŞINDAKİ YÜZEN İKONLAR ─── */}
      <div className="absolute -left-16 top-8 z-20 pointer-events-none hidden xl:block">
        <div className="animate-bounce" style={{ animationDuration: '4s' }}>
          <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl border border-sky-200 p-2 shadow-xl flex items-center justify-center text-2xl rotate-[-12deg]">
            🚀
          </div>
        </div>
      </div>

      <div className="absolute -left-20 bottom-12 z-20 pointer-events-none hidden xl:block">
        <div className="animate-pulse" style={{ animationDuration: '2.5s' }}>
          <div className="w-11 h-11 bg-white/80 backdrop-blur-md rounded-xl border border-indigo-200 p-2 shadow-lg flex items-center justify-center text-xl rotate-[8deg]">
            ✨
          </div>
        </div>
      </div>

      {/* ─── 🟢 EKRANIN SAĞ DIŞINDAKİ YÜZEN İKONLAR ─── */}
      <div className="absolute -right-16 top-16 z-20 pointer-events-none hidden xl:block">
        <div className="animate-bounce" style={{ animationDuration: '3.5s' }}>
          <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-2xl border border-purple-200 p-2 shadow-xl flex items-center justify-center text-3xl rotate-[15deg]">
            👾
          </div>
        </div>
      </div>

      <div className="absolute -right-20 bottom-20 z-20 pointer-events-none hidden xl:block">
        <div className="animate-pulse" style={{ animationDuration: '3s' }}>
          <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl border border-pink-200 p-2 shadow-xl flex items-center justify-center text-2xl rotate-[-10deg]">
            ⭐
          </div>
        </div>
      </div>

      {/* ─── 🔵 MEVCUT SOHBET KARTI ─── */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-2xl flex flex-col h-[680px] overflow-hidden relative z-10">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <h4 className="font-bold text-slate-800 text-base">{ui.title}</h4>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleComplete}
              disabled={completing || !messages.some((message) => message.role === "user")}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full hover:bg-emerald-100 transition-all disabled:opacity-40"
            >
              {completing ? "Rapor Hazırlanıyor..." : ui.completeLabel}
            </button>
            <button
              onClick={onBack}
              className="text-xs font-semibold text-slate-500 border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-100 transition-all"
            >
              {ui.exitLabel}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {loading ? (
            <div className="text-center text-slate-400 text-sm py-20 animate-pulse">
              {ui.loadingLabel}
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isUser ? "bg-slate-800 text-white" : "bg-gradient-to-tr from-[#38BDF8] to-[#0EA5E9] text-white"}`}>
                    {isUser ? "Siz" : "AI"}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-[20px] px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white rounded-tr-none"
                        : "bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-md"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
          {sending && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#0EA5E9] text-white flex items-center justify-center text-xs font-bold shrink-0">
                AI
              </div>
              <div className="bg-white border border-slate-100 rounded-[20px] rounded-tl-none px-5 py-3.5 text-sm text-slate-400 italic shadow-md flex items-center gap-1.5">
                <span>{ui.typingLabel}</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            </div>
          )}
          {error && (
            <div className="text-xs text-rose-500 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-center">
              Hata: {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Formu */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={ui.placeholderLabel || "Mesajınızı yazın..."}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sky-400 transition-all text-slate-800"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-40"
          >
            Gönder
          </button>
        </form>

      </div>
    </div>
  </div>
);
}

function InterviewTab({ resume }) {
  const rec = resume.recruiter_analytics;
  const [openIndex, setOpenIndex] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const seniorityTone = "neutral";

  if (showSimulator) {
    return (
      <AssistantChat
        resume={resume}
        assistantType="interview"
        onBack={() => setShowSimulator(false)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">İşe Alım Uzmanı Raporu</h3>
          <p className="text-xs text-slate-500">CV'nizin IK uzmanları gözüyle detaylı değerlendirmesi</p>
        </div>
        <button
          onClick={() => setShowSimulator(true)}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#A855F7] to-[#7C3AED] text-white font-semibold shadow-lg shadow-purple-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>💬</span> Mülakat Simülasyonu Başlat
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <KpiCard label="İşe Alım Uzmanı Skoru" value={resume.recruiter_score} type="recruiter" />
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl flex flex-col justify-center items-start">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Algılanan Kıdem
          </span>
          <Badge tone={seniorityTone}>{rec.perceived_seniority}</Badge>
        </div>
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            İşe Alım Riskleri
          </span>
          <span className="text-4xl font-extrabold text-[#EC4899]">
            {rec.hiring_risks.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-2">İlk İzlenim</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {rec.first_impression}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900 mb-4">İşe Alım Riskleri</h3>
          <ul className="space-y-3">
            {rec.hiring_risks.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                <span className="text-[#EC4899] font-bold">•</span> {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Öne Çıkan Sinyaller</h3>
          <ul className="space-y-3">
            {rec.standout_signals.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <span className="text-emerald-500 font-bold">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Olası Mülakat Soruları</h3>
        <div className="space-y-3">
          {rec.interview_questions.map((q, i) => (
            <div key={i} className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-800">{q.question}</span>
                <span className="text-slate-400 font-bold text-lg">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <div className="p-5 text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Neden Sorulabilir?</span>
                  {q.reasoning}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-2">İşe Alım Uzmanı Özeti</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {rec.recruiter_summary}
        </p>
      </div>
    </div>
  );
}

function RoadmapTab({ resume }) {
  const coach = resume.coach_analytics;
  const [showCoach, setShowCoach] = useState(false);

  if (showCoach) {
    return (
      <AssistantChat
        resume={resume}
        assistantType="career_coach"
        onBack={() => setShowCoach(false)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Kişiselleştirilmiş Kariyer Planı</h3>
          <p className="text-xs text-slate-500">Gelecek hedefleriniz için AI tarafından çizilen strateji</p>
        </div>
        <button
          onClick={() => setShowCoach(true)}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#7C3AED] text-white font-semibold shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>🧭</span> AI Kariyer Koçuyla Görüş
        </button>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        <KpiCard label="Kariyer Koçu Skoru" value={resume.coach_score} type="coach" />
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Kariyer Konumlandırma</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {coach.career_positioning}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Özgüven Artırıcılar</h3>
          <ul className="space-y-3">
            {coach.confidence_boosters.map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <span className="text-emerald-500 font-bold">✓</span> {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Gelişim Öncelikleri</h3>
          <ul className="space-y-3">
            {coach.development_priorities.map((d, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <span className="text-amber-500 font-bold">→</span> {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Mülakat Hazırlık Planı</h3>
        <ol className="space-y-3">
          {coach.interview_preparation_plan.map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
              <span className="font-bold text-[#0EA5E9]">{i + 1}.</span> {p}
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-8">Kariyer Yol Haritası</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coach.roadmap.map((item, i) => (
            <div
              key={i}
              className="bg-slate-50 border border-slate-200/80 rounded-[20px] p-6 relative hover:-translate-y-1 transition-all shadow-sm overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9]" />
              <span className="inline-block px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-3">
                {item.timeframe}
              </span>
              <p className="text-base font-bold text-slate-800 mb-2">{item.action}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{item.expected_outcome}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Kariyer Koçu Özeti</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
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

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    if (jobs.length > 0) return;
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
  };

  useEffect(() => {
    fetchJobs();

    const handleClickOutside = (e) => {
      const dropdown = document.getElementById('job-dropdown');
      const button = document.getElementById('job-dropdown-button');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        if (!dropdown.contains(e.target) && button && !button.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [jobs.length]);

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
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">İş İlanı Eşleştirme</h3>
          <p className="text-xs text-slate-500">CV'nizi hedef iş ilanlarıyla karşılaştırın</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setMatchResult(null);
          }}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white font-semibold shadow-md hover:scale-105 transition-all"
        >
          {showForm ? "İlan Seçimine Dön" : "Yeni İş İlanı Ekle"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-[#EC4899] bg-[#FCE7F3] border border-[#F9A8D4] rounded-2xl px-4 py-3 font-medium">
          {error}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleCreateJob} className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-2">
            <h4 className="font-bold text-slate-800">Yeni İş İlanı Bilgileri</h4>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Hızlı Doldur:</span>
              {MOCK_LINKEDIN_JOBS.map((mj, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTitle(mj.title);
                    setCompany(mj.company);
                    setDescription(mj.description);
                  }}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#E0F2FE] text-xs text-slate-600 hover:text-[#0284C7] transition-all font-medium"
                >
                  {mj.company}
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">İlan Başlığı</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] text-sm text-slate-800"
                placeholder="Senior React Developer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Şirket Adı</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] text-sm text-slate-800"
                placeholder="TechCorp"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">İlan Detayı / Açıklaması</label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] text-sm text-slate-800"
              placeholder="Pozisyon gereksinimleri, aranan özellikler, görev tanımı..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
          >
            {loading ? "Kaydediliyor..." : "İlanı Kaydet"}
          </button>
        </form>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Eşleştirilecek İş İlanı Seçin</label>
              {jobs.length === 0 ? (
                <p className="text-sm text-slate-400">Kayıtlı iş ilanı bulunmuyor. Yeni bir tane ekleyerek başlayın.</p>
              ) : (
                <div className="relative">
                  <button
                    id="job-dropdown-button"
                    type="button"
                    onClick={() => {
                      const dd = document.getElementById('job-dropdown');
                      if (dd) dd.classList.toggle('hidden');
                    }}
                    className="w-full text-left px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] text-sm flex justify-between items-center transition-all hover:border-[#BAE6FD]"
                  >
                    <span className="text-slate-800 font-semibold truncate pr-4">
                      {jobs.find(j => j.id === selectedJobId)?.title || "İlan Seçin..."} - <span className="text-slate-400 font-normal">{jobs.find(j => j.id === selectedJobId)?.company}</span>
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  <div id="job-dropdown" className="hidden absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          onClick={() => {
                            setSelectedJobId(job.id);
                            setMatchResult(null);
                            document.getElementById('job-dropdown').classList.add('hidden');
                          }}
                          className={`px-5 py-3.5 cursor-pointer text-sm transition-all border-b border-slate-100 last:border-b-0 ${
                            selectedJobId === job.id
                              ? "bg-[#E0F2FE] border-l-4 border-l-[#0EA5E9] text-[#0284C7] font-bold"
                              : "hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <div>{job.title}</div>
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
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white font-semibold shadow-lg shadow-sky-200 hover:scale-105 active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
            >
              {matching ? "Eşleştiriliyor..." : "Özgeçmişle Eşleştir"}
            </button>
          </div>

          {selectedJob && !matchResult && (
            <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{selectedJob.title}</h4>
                  <p className="text-sm font-semibold text-[#0EA5E9]">{selectedJob.company}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(selectedJob.created_at).toLocaleDateString("tr-TR")}
                </span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 max-h-60 overflow-y-auto text-sm whitespace-pre-line text-slate-600 leading-relaxed border border-slate-100">
                {selectedJob.description}
              </div>
            </div>
          )}

          {matchResult && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Semantik Eşleşme Skoru
                  </span>
                  <div className="flex items-baseline gap-1 my-2">
                    <span
                      className="text-5xl font-black"
                      style={{ color: scoreColor(matchResult.match_score) }}
                    >
                      {Math.round(matchResult.match_score)}
                    </span>
                    <span className="text-sm font-medium text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${matchResult.match_score}%`,
                        backgroundColor: scoreColor(matchResult.match_score),
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Eşleşme Özeti
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {matchResult.match_analytics.match_summary}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
                  <h4 className="text-lg font-bold text-emerald-600 mb-4">Güçlü Eşleşmeler</h4>
                  <ul className="space-y-3">
                    {matchResult.match_analytics.strong_fits.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                        <span className="text-emerald-500 font-bold">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
                  <h4 className="text-lg font-bold text-rose-500 mb-4">Eksik Yetkinlikler / Kelimeler</h4>
                  <ul className="space-y-3">
                    {matchResult.match_analytics.missing_skills.map((m, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                        <span className="text-rose-500 font-bold">•</span> {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
                <h4 className="text-lg font-bold text-amber-500 mb-4">Özgeçmiş İyileştirme Önerileri</h4>
                <ul className="space-y-3">
                  {matchResult.match_analytics.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                      <span className="text-amber-500 font-bold">→</span> {imp}
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
    <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-slate-700">
          Özgeçmiş Analiz Ediliyor: <span className="text-[#0EA5E9]">{filename}</span>
        </span>
        <span className="font-extrabold text-[#7C3AED] text-base">{progress}%</span>
      </div>
      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#38BDF8] via-[#A855F7] to-[#EC4899] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs font-semibold text-slate-400 italic text-center animate-pulse">
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
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-xl h-full max-h-[800px] overflow-y-auto space-y-4">
      <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Geçmiş Özgeçmişler</h3>
      <div className="space-y-3">
        {history.map((h) => (
          <div key={h.id} className="group relative">
            <button
              onClick={() => onSelect(h.id)}
              className={`w-full text-left p-4 rounded-2xl transition-all border ${
                selectedId === h.id
                  ? "bg-[#E0F2FE] border-[#38BDF8] text-[#0284C7] shadow-sm font-medium"
                  : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="font-semibold text-sm truncate pr-6" title={h.original_filename || "Özgeçmiş"}>
                {h.original_filename || "İsimsiz Özgeçmiş"}
              </div>
              <div className="text-xs text-slate-400 mt-2 flex justify-between items-center">
                {h.overall_score === 0 ? (
                  <span className="text-[#0EA5E9] animate-pulse font-semibold">Analiz Ediliyor...</span>
                ) : (
                  <span>Skor: <span className="font-bold text-slate-700">{Math.round(h.overall_score)}</span></span>
                )}
                <span>{new Date(h.created_at).toLocaleDateString("tr-TR")}</span>
              </div>
            </button>

            <button
              onClick={(e) => onDelete(h.id, e)}
              className="absolute right-3 top-4 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#EC4899] p-1 text-xs transition-all focus:opacity-100"
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
    <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Geçmiş Performans</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              color: "#0F172A",
            }}
          />
          <Legend />
          <Bar dataKey="Genel" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
          <Bar dataKey="ATS" fill="#EC4899" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Ise Alim" fill="#A855F7" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Koc" fill="#38BDF8" radius={[6, 6, 0, 0]} />
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
    return <div className="text-center text-slate-400 py-16">Profil yükleniyor...</div>;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Yüklenen CV</span>
            <span className="text-3xl font-extrabold text-[#0EA5E9]">{profile.total_resumes}</span>
          </div>
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">İlanlar</span>
            <span className="text-3xl font-extrabold text-[#A855F7]">{profile.total_jobs}</span>
          </div>
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Eşleşmeler</span>
            <span className="text-3xl font-extrabold text-emerald-500">{profile.total_matches}</span>
          </div>
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">AI Chat</span>
            <span className="text-3xl font-extrabold text-[#EC4899]">{profile.total_chats}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-xl max-w-2xl mx-auto space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Profil Ayarları</h3>

        {error && (
          <div className="text-sm text-[#EC4899] bg-[#FCE7F3] border border-[#F9A8D4] rounded-2xl p-4 text-center font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Ad Soyad</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] text-sm text-slate-800"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">E-posta Adresi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] text-sm text-slate-800"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] text-sm text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white font-semibold shadow-lg shadow-sky-200 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
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

      if (selectedResume && selectedResume.id === resumeId) {
        setAnalyzingResumeId(null);

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
    setAnalyzingResumeId(null);
    try {
      const data = await getResumeById(id);
      setSelectedResume(data);
      setActiveTab("overview");

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
      <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] via-[#FCE7F3] to-white flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[24px] shadow-2xl border border-slate-100 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Kariyer Paneli Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] via-[#FCE7F3] to-white flex items-center justify-center p-6">
        <div className="text-sm text-[#EC4899] bg-white rounded-[24px] border border-[#F9A8D4] p-8 shadow-2xl max-w-xl text-center font-medium">
          {error}
        </div>
      </div>
    );
  }

  const hasResume = selectedResume !== null;
  const isSelectedResumeAnalyzing = selectedResume && (!selectedResume.cv_analytics || !selectedResume.ats_analytics || !selectedResume.recruiter_analytics || !selectedResume.coach_analytics);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] via-[#FCE7F3] to-white text-slate-800 antialiased font-sans">
      {deleteConfirm.open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setDeleteConfirm({ open: false, resumeId: null })}
        >
          <div
            className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] flex items-center justify-center flex-shrink-0 text-[#EC4899] font-bold text-xl">
                ⚠
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Özgeçmişi Sil</h3>
                <p className="text-xs text-slate-400">Bu işlem geri alınamaz</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Bu özgeçmiş ve bağlı tüm veriler (mülakat geçmişi, iş ilanı eşleşmeleri) kalıcı olarak silinecek. Devam etmek istiyor musunuz?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({ open: false, resumeId: null })}
                className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                Vazgeç
              </button>
              <button
                onClick={confirmDeleteResume}
                className="px-6 py-2.5 rounded-full bg-[#EC4899] hover:bg-rose-600 text-white font-semibold text-sm shadow-md transition-all"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}


      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
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
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kariyer Paneli</h1>
                <p className="text-sm text-slate-500 mt-1">
                  CV analizlerinizi görüntüleyin ve yeni bir analiz başlatın.
                </p>
              </div>
            </div>

            <UploadPanel onUploaded={handleUploaded} />

            {/* Navigation Tabs */}
            <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-slate-200/80 shadow-sm flex gap-1 overflow-x-auto">
              {TABS.map((tab) => {
                if (!hasResume && tab.id !== "profile") return null;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-white shadow-md scale-105"
                        : "text-slate-500 hover:text-slate-900 hover:bg-[#E0F2FE]/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Views */}
            {activeTab === "profile" ? (
              <ProfileTab />
            ) : loadingResume ? (
              <div className="bg-white rounded-[24px] p-12 text-center text-slate-400 border border-gray-100 shadow-xl">
                Seçilen CV yükleniyor...
              </div>
            ) : !hasResume ? (
              <div className="bg-white rounded-[24px] p-12 text-center text-slate-400 border border-gray-100 shadow-xl">
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
      </main>
    </div>
  );
}