import type { Metadata } from "next";
import { Unbounded } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Portal Inmobiliario",
    template: "%s | Portal Inmobiliario",
  },
  description: "Base de portal inmobiliario con web publica y panel administrativo.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${unbounded.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
