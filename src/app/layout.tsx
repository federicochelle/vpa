import type { Metadata } from "next";
import { Unbounded } from "next/font/google";
import {
  buildAbsoluteUrl,
  openGraphImage,
  siteDescription,
  siteLocale,
  siteName,
  siteUrl,
} from "@/lib/seo";
import { getPublicLocale } from "@/i18n/public/locale.server";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: siteLocale,
    siteName,
    title: siteName,
    description: siteDescription,
    ...(siteUrl ? { url: siteUrl.toString() } : {}),
    images: [
      {
        url: buildAbsoluteUrl(openGraphImage.path),
        width: openGraphImage.width,
        height: openGraphImage.height,
        type: openGraphImage.type,
        alt: openGraphImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: buildAbsoluteUrl(openGraphImage.path),
        width: openGraphImage.width,
        height: openGraphImage.height,
        alt: openGraphImage.alt,
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getPublicLocale();

  return (
    <html lang={locale} className={`${unbounded.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
