import { ImageResponse } from "next/og";

/** Apple touch icon — the `</>` brand mark rendered at 180×180. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0e1a",
          borderRadius: 40,
          fontFamily: "monospace",
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: -6,
          color: "#3b82f6",
        }}
      >
        &lt;/&gt;
      </div>
    ),
    { ...size },
  );
}
