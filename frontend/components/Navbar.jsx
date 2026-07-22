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
    <nav className="border-b border-[#FEADB9]/50 bg-[#F9E1E0]/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#BC85A3] to-[#FEADB9] flex items-center justify-center font-black text-sm text-white shadow-sm group-hover:scale-105 transition-transform">
            CP
          </span>
          <span className="text-xl font-extrabold tracking-tight text-[#2E3E4E]">
            CareerPilot{" "}
            <span className="bg-gradient-to-r from-[#BC85A3] to-[#9799BA] bg-clip-text text-transparent">
              AI
            </span>
          </span>
        </a>

        {/* Sağ Menü Linkleri & Butonlar */}
        <div className="flex items-center gap-4 sm:gap-6">
          {authed ? (
            <>
              <a
                href="/dashboard"
                className="text-sm font-semibold text-[#4E677F] hover:text-[#BC85A3] transition-colors"
              >
                Panel
              </a>
              {user?.full_name && (
                <span className="text-sm font-medium text-[#4E677F]/80 hidden sm:inline cursor-default bg-white/50 px-3 py-1.5 rounded-xl border border-[#FEADB9]/40">
                  {user.full_name}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-sm font-semibold px-4 py-2 rounded-xl border border-[#FEADB9] text-[#4E677F] hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition-all active:scale-95"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="text-sm font-semibold text-[#4E677F] hover:text-[#BC85A3] transition-colors"
              >
                Giriş Yap
              </a>
              <a
                href="/register"
                className="bg-[#BC85A3] hover:bg-[#a6718d] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-[#BC85A3]/20 hover:shadow-lg transition-all active:scale-95"
              >
                Kayıt Ol
              </a>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}