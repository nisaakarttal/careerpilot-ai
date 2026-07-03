import "./globals.css";

export const metadata = {
  title: "CareerPilot AI",
  description: "Yapay Zeka Destekli Kariyer ve CV Asistani",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
