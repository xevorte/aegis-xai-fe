import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Aegis XAI | Skrining Kesehatan",
  description: "Skrining kesehatan berbasis model machine learning dan penjelasan SHAP.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
