"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CareerPilotDashboard from "@/components/CareerPilotDashboard";
import { isAuthenticated } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // Cam & Buz Mavisi Tema Uyumlu Yüklenme Ekranı
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white/80 p-8 rounded-2xl border border-sky-100 flex flex-col items-center max-w-sm w-full text-center space-y-4 shadow-xl shadow-sky-900/5 backdrop-blur-md">
          {/* Mavi Spinner */}
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-sky-200 border-t-sky-600" />

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">
              Oturum Doğrulanıyor
            </h3>
            <p className="text-sm text-slate-600">
              Lütfen bekleyin, yönlendiriliyorsunuz...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Ana İçerik
  return (
    <div className="min-h-screen text-[#0f172a] antialiased">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CareerPilotDashboard />
      </main>
    </div>
  );
}