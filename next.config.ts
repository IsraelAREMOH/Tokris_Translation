import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// The Media Library serves its files straight from the Supabase Storage
// public URL — computed from the project URL so this stays correct if the
// project ever changes, rather than hardcoding the hostname.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Hide the floating dev-tools indicator (bottom-left) in development —
  // the WhatsApp button is the only floating widget the site should show.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // National flag assets for the language cards
        protocol: "https",
        hostname: "flagcdn.com",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
            },
          ]
        : []),
    ],
  },
  experimental: {
    serverActions: {
      // Quote uploads: up to 5 files x 10 MB each, plus form overhead
      bodySizeLimit: "60mb",
    },
  },
};

export default withNextIntl(nextConfig);
