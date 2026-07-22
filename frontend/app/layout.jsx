import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: {
    default: "CareerPilot AI — Yapay Zekâ Destekli Kariyer Asistanı",
    template: "%s | CareerPilot AI",
  },
  description:
    "Yapay zeka ile CV'nizi analiz edin, mülakat simülasyonlarına katılın ve kariyerinizi optimize edin.",
  keywords: [
    "Kariyer",
    "CV Analiz",
    "Yapay Zeka",
    "Mülakat Simülasyonu",
    "CareerPilot",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="h-full">
      <body
        className={`${inter.variable} min-h-screen text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}