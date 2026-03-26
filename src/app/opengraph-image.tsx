import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const alt = "Goats Heritage - Premium Cigars & Lifestyle";
export const contentType = "image/png";

export default async function Image() {
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
            fontSize: 64,
            fontWeight: 700,
            color: "#C8A84E",
            letterSpacing: "0.05em",
          }}
        >
          GOATS HERITAGE
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#FFFFFF",
            marginTop: 20,
            letterSpacing: "0.02em",
          }}
        >
          Premium Cigars & Lifestyle
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
