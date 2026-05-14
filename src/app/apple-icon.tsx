import { ImageResponse } from "next/og";

// iOS home-screen icon. Safari ignores SVG manifest icons, so this generates a
// proper 180×180 PNG at build time (full-bleed — iOS rounds the corners).
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
          background:
            "linear-gradient(135deg, #065f46 0%, #047857 55%, #022c22 100%)",
          color: "#e2e8f0",
          fontSize: 100,
          fontWeight: 700,
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: -6,
        }}
      >
        PK
      </div>
    ),
    { ...size },
  );
}
