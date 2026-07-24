"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: only fires if the root layout itself throws (e.g.
 * before app/[locale]/error.tsx's provider tree is even mounted), so this
 * must render its own complete <html>/<body> and can't rely on next-intl,
 * Tailwind's generated stylesheet, or any other part of the app that may be
 * what's broken — inline styles only, deliberately minimal.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error in the root layout:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#0b1110",
          color: "#f7f6f2",
        }}
      >
        <p style={{ fontSize: "2rem", fontWeight: 600, margin: 0 }}>Something went wrong</p>
        <p style={{ maxWidth: "28rem", fontSize: "0.9rem", opacity: 0.8, margin: 0 }}>
          An unexpected error occurred. Please try again, or head back home.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: "999px",
              padding: "0.6rem 1.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#0b1110",
              backgroundColor: "#f7f6f2",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- deliberate:
              this boundary must be self-contained since it replaces the root
              layout entirely, so it can't depend on next/link's App Router context. */}
          <a
            href="/"
            style={{
              borderRadius: "999px",
              padding: "0.6rem 1.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#f7f6f2",
              border: "1px solid rgba(247,246,242,0.3)",
              textDecoration: "none",
            }}
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}
