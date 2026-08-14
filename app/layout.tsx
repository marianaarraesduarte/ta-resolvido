import type { Metadata, Viewport } from "next";
import { baloo2, inter } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tá Resolvido",
  description: "Seu mês sob controle. Sem planilha.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tá Resolvido",
  },
  icons: {
    icon: "/icon-512.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F3A3D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${baloo2.variable} ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
