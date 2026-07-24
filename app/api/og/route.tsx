import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

/**
 * Dynamic, on-brand fallback OG image — used by article/category/tag pages
 * whenever no cover image/OG image has been set, so social shares never
 * show a blank card. Also doubles as the Organization schema's `logo`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.slice(0, 140) || "Tokris Global Services";
  const category = searchParams.get("category")?.slice(0, 60) ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #0a2724 0%, #1c4f49 45%, #257a6f 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>
          TOKRIS
          <span style={{ color: "#8acfc4" }}>.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {category ? (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 600,
                color: "#b9e4dc",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {category}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -1,
              maxWidth: 950,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 20, color: "#8acfc4" }}>
          Tokris Global Services — Professional Language Solutions
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
