import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const alt = "Goats Heritage - Premium Cigars & Lifestyle";
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A0A0A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "3px solid #C8A84E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              color: "#C8A84E",
            }}
          >
            G
          </div>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#C8A84E",
            letterSpacing: "0.1em",
            marginTop: 32,
          }}
        >
          GOATS HERITAGE
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#FFFFFF",
            marginTop: 16,
            letterSpacing: "0.05em",
          }}
        >
          Premium Cigars & Lifestyle
        </div>
        <div
          style={{
            width: 64,
            height: 2,
            background: "#C8A84E",
            marginTop: 24,
            opacity: 0.4,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
