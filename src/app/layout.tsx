import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Kenya TVET Project Studio & Academic Repository`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "KNEC business plan",
    "Kenya TVET projects",
    "TVET Hub",
    "KNEC diploma project",
    "KNEC craft certificate business plan",
    "Nutrition and Dietetics business plan",
    "TVET past papers Kenya",
    "TVET lecture notes",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo/TVETHub_320px.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Kenya TVET Project Studio & Academic Repository`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Kenya TVET Project Studio & Academic Repository`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased text-slate-800 bg-[#f4f7fb]">
        <Suspense fallback={<div className="min-h-screen bg-[#f4f7fb]" aria-label="Loading" />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
