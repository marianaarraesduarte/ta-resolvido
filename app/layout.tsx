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
    // Tela de abertura do iOS antes do app carregar (fora do nosso
    // controle depois disso — nenhuma tela de espera nossa aparece antes
    // disso, é o próprio sistema quem mostra).
    startupImage: "/icon-512.png",
  },
  icons: {
    icon: "/icon-512.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5EDE0" },
    { media: "(prefers-color-scheme: dark)", color: "#14201F" },
  ],
};

// Aplica o tema escolhido (Configurações > Aparência) antes da página
// pintar — sem isso, a tela pisca no tema errado por um instante toda vez
// que abre o app, já que o localStorage só é lido depois do JS carregar.
const THEME_INIT_SCRIPT = `
try {
  var theme = localStorage.getItem("theme-preference");
  if (theme === "light" || theme === "dark") {
    document.documentElement.setAttribute("data-theme", theme);
  }
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${baloo2.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
