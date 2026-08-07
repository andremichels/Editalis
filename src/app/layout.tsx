import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Editalis — Diário Oficial da União",
  description: "Busca no Diário Oficial da União. Pesquise portarias, licitações, nomeações e outros atos oficiais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
