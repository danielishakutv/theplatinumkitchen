import { ImageResponse } from "next/og";

// Default site-wide Open Graph card. Next builds this once and caches the PNG,
// so it costs nothing per request. Per-page metadata can still override og:image
// via generateMetadata().
export const alt = "Platinum Kitchen — Refined Nigerian Cuisine, Abuja";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #022c22 0%, #064e3b 45%, #065f46 100%)",
          color: "#f8fafc",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* corner glows */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(16, 185, 129, 0.22)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(52, 211, 153, 0.18)",
            filter: "blur(40px)",
          }}
        />

        {/* eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#a7f3d0",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              background: "#34d399",
            }}
          />
          Platinum Kitchen · Abuja
        </div>

        {/* headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 108,
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: -3,
              color: "#f8fafc",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            A quiet revolution
          </div>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.02,
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: -2,
              color: "#6ee7b7",
            }}
          >
            of Nigerian flavour.
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 30,
              color: "#d1fae5",
              maxWidth: 720,
              lineHeight: 1.3,
            }}
          >
            Heritage recipes, prepared with care, delivered across Abuja.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 28,
              color: "#a7f3d0",
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            theplatinumkitchen.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
