import type { Metadata } from "next";
import { baloo2, inter } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tá Resolvido",
  description: "Seu mês sob controle. Sem planilha.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${baloo2.variable} ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
