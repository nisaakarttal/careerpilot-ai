"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearToken, getUser, isAuthenticated } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      setUser(getUser());
      setAuthed(isAuthenticated());
    };
    loadUser();
    window.addEventListener("profileUpdated", loadUser);
    return () => window.removeEventListener("profileUpdated", loadUser);
  }, []);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <nav className="border-b border-sky-200/50 bg-gradient-to-r from-sky-100/90 via-blue-100/90 to-cyan-100/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link href={authed ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center font-black text-sm text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            CP
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            CareerPilot{" "}
            <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              AI
            </span>
          </span>
        </Link>

        {/* Sağ Menü Linkleri & Butonlar */}
        <div className="flex items-center gap-4 sm:gap-6">
          {authed ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-slate-700 hover:text-sky-700 transition-colors"
              >
                {user?.full_name ? `Merhaba, ${user.full_name}` : "Panel"}
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname !== "/dashboard") {
                    router.push("/dashboard?tab=profile");
                  } else {
                    window.dispatchEvent(new CustomEvent("switch-tab", { detail: "profile" }));
                  }
                }}
                className="text-sm font-medium text-slate-700 hidden sm:inline cursor-pointer bg-white/70 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-sky-100 shadow-sm transition-all hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 hover:shadow-md"
              >
                Profil ve Ayarlar
              </button>
              <button
                onClick={handleLogout}
                type="button"
                className="text-sm font-semibold px-4 py-2 rounded-xl border border-sky-200/80 bg-white/50 text-slate-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-sky-700 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 transition-all duration-200 active:scale-95"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}