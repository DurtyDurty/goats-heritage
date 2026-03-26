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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://goats-heritage.vercel.app/images/logo.png"
          alt="Goats Heritage"
          height={150}
          style={{ height: 150 }}
        />
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#C8A84E",
            letterSpacing: "0.05em",
            marginTop: 24,
          }}
        >
          GOATS HERITAGE
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#FFFFFF",
            marginTop: 16,
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
