import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = {
  width: 1200,
  height: 630,
};

export const alt = "Goats Heritage - Premium Cigars & Lifestyle";
export const contentType = "image/png";

export default async function OgImage() {
  // Rendered at build time, so the public folder is on disk
  const logo = await readFile(join(process.cwd(), "public/images/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

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
        <img src={logoSrc} width={470} height={470} alt="" />
        <div
          style={{
            fontSize: 28,
            color: "#FFFFFF",
            marginTop: 8,
            letterSpacing: "0.15em",
          }}
        >
          PREMIUM CIGARS & LIFESTYLE
        </div>
      </div>
    ),
    { ...size }
  );
}
