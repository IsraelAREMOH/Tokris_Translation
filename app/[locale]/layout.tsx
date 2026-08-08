import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Fraunces, Inter } from "next/font/google";
import { notFound } from "next/navigation";

import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";

import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const DEFAULT_DESCRIPTION =
  "Breaking language barriers, creating global opportunities, certified translation, sworn translation, interpretation, localization, transcription, and language training.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tokris Global Services. Professional Language Solutions",
    template: "%s · Tokris Global Services",
  },
  description: DEFAULT_DESCRIPTION,
  // Page-level metadata (blog posts, category/tag archives) overrides these —
  // this is only the fallback for pages that don't set their own openGraph/
  // twitter block (About, Services, Contact, Quote, Home).
  openGraph: {
    type: "website",
    siteName: "Tokris Global Services",
    title: "Tokris Global Services. Professional Language Solutions",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tokris Global Services. Professional Language Solutions",
    description: DEFAULT_DESCRIPTION,
    images: ["/api/og"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1110" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
