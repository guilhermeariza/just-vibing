import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🃏 Truco Online - Jogo Multijogador",
  description: "Jogue truco online com seus amigos em tempo real. Mobile-first e multiplayer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
