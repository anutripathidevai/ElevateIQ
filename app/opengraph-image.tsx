import { ImageResponse } from "next/og";

/**
 * Social share card (Open Graph + Twitter). A branded 1200×630 image rendered at
 * build time — dark background, the `</>` mark, the wordmark, and the tagline.
 */
export const alt =
  "Compile Ready — AI-powered interview preparation for software engineers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0e1a",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "rgba(59,130,246,0.12)",
              border: "2px solid rgba(59,130,246,0.35)",
              fontFamily: "monospace",
              fontSize: 46,
              fontWeight: 700,
              letterSpacing: -3,
              color: "#3b82f6",
            }}
          >
            &lt;/&gt;
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: -1,
            }}
          >
            Compile Ready
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 800,
              color: "#f8fafc",
              lineHeight: 1.1,
              letterSpacing: -2,
              maxWidth: 960,
            }}
          >
            AI-powered interview preparation for software engineers
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#93c5fd",
              fontWeight: 500,
            }}
          >
            DSA · System Design · LLD · Generative AI · AI Mock Interviews
          </div>
        </div>

        {/* Footer URL */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          compileready.com
        </div>
      </div>
    ),
    { ...size },
  );
}
