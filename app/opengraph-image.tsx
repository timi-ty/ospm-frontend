import { ImageResponse } from "next/og";
import { BROWN, CREAM, loadFont } from "./api/logo/theme";

export const runtime = "edge";
export const alt = "OSPM – Open Source Prediction Markets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const fontData = await loadFont();

  const logoSize = 400;
  const fontSize = Math.round(logoSize * 0.36);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BROWN,
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(146,88,56,0.35) 0%, transparent 55%), " +
            "radial-gradient(circle at 85% 75%, rgba(107,52,32,0.4) 0%, transparent 50%), " +
            "radial-gradient(circle at 75% 10%, rgba(160,96,58,0.2) 0%, transparent 40%)",
          fontFamily: "Montserrat",
          gap: 60,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft accent circles */}
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            backgroundColor: "#6B3420",
            opacity: 0.12,
            bottom: -60,
            left: -40,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            backgroundColor: "#A0603A",
            opacity: 0.1,
            top: -50,
            right: -30,
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: logoSize,
            height: logoSize,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize,
                color: CREAM,
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-0.01em",
              }}
            >
              OS
            </span>
            <span
              style={{
                fontSize,
                color: CREAM,
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-0.01em",
              }}
            >
              PM
            </span>
          </div>
        </div>

        {/* Title text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: CREAM,
              letterSpacing: "-0.02em",
            }}
          >
            Open Source
          </span>
          <span
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: CREAM,
              letterSpacing: "-0.02em",
            }}
          >
            Prediction Markets
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Montserrat",
          data: fontData,
          weight: 900 as const,
          style: "normal" as const,
        },
      ],
    },
  );
}
