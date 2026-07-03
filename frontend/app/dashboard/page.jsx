"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CareerPilotDashboard from "@/components/CareerPilotDashboard";
import { isAuthenticated } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-16 text-center text-[var(--cp-text-dim)]">
          Yonlendiriliyor...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CareerPilotDashboard />
    </>
  );
}
