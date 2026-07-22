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

  // Palet Bazlı Yüklenme Ekranı ( image_0.png Tonları)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9E1E0] flex flex-col items-center justify-center p-4">
        {/* Ana Arka Plan: En Açık Pembe (#F9E1E0) */}

        <div className="bg-white/80 p-8 rounded-2xl border border-[#FEADB9]/50 flex flex-col items-center max-w-sm w-full text-center space-y-4 shadow-sm backdrop-blur-sm">
          {/* Kart: Beyaz ile Hafif Karışmış Yumuşak Pembe (#FEADB9) */}

          {/* Puslu Eflatun/Mavi Spinner (#9799BA) */}
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#9799BA]/30 border-t-[#9799BA]" />

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#BC85A3]">
              {/* Başlık Metni: Mat Koyu Gül (#BC85A3) */}
              Oturum Doğrulanıyor
            </h3>
            <p className="text-sm text-[#4E677F]">
              {/* Alt Metin: En Koyu Ton (Görseldeki Koyu Mavimsi-Gri) */}
              Lütfen bekleyin, yönlendiriliyorsunuz...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Ana İçerik
  return (
    <div className="min-h-screen bg-[#F9E1E0] text-[#1E2723] antialiased">
      {/* Navbar ve Dashboard bileşenlerini de bu paletle senkronize etmeyi unutmayın */}
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CareerPilotDashboard />
      </main>
    </div>
  );
}