"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = isRegister
        ? await registerUser({ email, fullName, password })
        : await loginUser({ email, password });

      setToken(data.access_token);
      setUser(data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="cp-card p-8">
        <h1 className="text-2xl font-semibold mb-1">
          {isRegister ? "Hesap Oluştur" : "Tekrar Hoş Geldiniz"}
        </h1>
        <p className="text-sm text-[var(--cp-text-dim)] mb-6">
          {isRegister
            ? "CV'nizi analiz etmeye başlamak için kayıt olun."
            : "Kariyer panelinize erişmek için giriş yapın."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm mb-1.5 text-[var(--cp-text-dim)]">
                Ad Soyad
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg cp-card-light focus:outline-none focus:ring-2 focus:ring-[var(--cp-accent)] text-sm"
                placeholder="Ada Lovelace"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1.5 text-[var(--cp-text-dim)]">
              E-posta
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg cp-card-light focus:outline-none focus:ring-2 focus:ring-[var(--cp-accent)] text-sm"
              placeholder="ornek@eposta.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5 text-[var(--cp-text-dim)]">
              Şifre
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg cp-card-light focus:outline-none focus:ring-2 focus:ring-[var(--cp-accent)] text-sm"
              placeholder="En az 8 karakter"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cp-btn-primary w-full"
          >
            {loading
              ? "İşleniyor..."
              : isRegister
              ? "Kayıt Ol"
              : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-[var(--cp-text-dim)]">
          {isRegister ? (
            <>
              Zaten hesabınız var mı?{" "}
              <a href="/login" className="text-[var(--cp-accent-light)] hover:underline">
                Giriş yapın
              </a>
            </>
          ) : (
            <>
              Hesabınız yok mu?{" "}
              <a href="/register" className="text-[var(--cp-accent-light)] hover:underline">
                Kayıt olun
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
