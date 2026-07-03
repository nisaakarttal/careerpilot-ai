"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getUser, isAuthenticated } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setAuthed(isAuthenticated());
  }, []);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <nav className="border-b border-[var(--cp-border)] bg-[var(--cp-bg)]/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-sm text-black">
            CP
          </span>
          <span className="text-lg font-semibold tracking-tight">
            CareerPilot <span className="cp-gradient-text">AI</span>
          </span>
        </a>

        <div className="flex items-center gap-4">
          {authed ? (
            <>
              <a
                href="/dashboard"
                className="text-sm text-[var(--cp-text-dim)] hover:text-white transition-colors"
              >
                Panel
              </a>
              {user?.full_name && (
                <span className="text-sm text-[var(--cp-text-dim)] hidden sm:inline">
                  {user.full_name}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-lg border border-[var(--cp-border)] hover:border-red-400 hover:text-red-400 transition-colors"
              >
                Cikis Yap
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="text-sm text-[var(--cp-text-dim)] hover:text-white transition-colors"
              >
                Giris Yap
              </a>
              <a
                href="/register"
                className="text-sm px-4 py-2 rounded-lg bg-[var(--cp-accent)] hover:bg-[var(--cp-accent-light)] transition-colors font-medium"
              >
                Kayit Ol
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
