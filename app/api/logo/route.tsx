import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const BROWN = "#7E4430";
const CREAM = "#DDD3C2";
const FONT_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/montserrat@latest/latin-900-normal.woff";

let cachedFont: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;
  const res = await fetch(FONT_URL);
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
  cachedFont = await res.arrayBuffer();
  return cachedFont;
}

function clampSize(raw: string | null): number {
  const n = parseInt(raw || "512", 10) || 512;
  return Math.min(Math.max(n, 16), 2048);
}

function parseRounded(raw: string | null): boolean {
  if (raw === null) return true;
  return raw !== "false" && raw !== "0";
}

// --------------- SVG output ---------------

function buildSvg(size: number, rounded: boolean): string {
  const fs = Math.round(size * 0.36);
  const y1 = Math.round(size * 0.43);
  const y2 = Math.round(size * 0.8);
  const r = rounded ? Math.round(size * 0.12) : 0;

  const clipOpen = rounded
    ? [
        `  <clipPath id="clip">`,
        `    <rect width="${size}" height="${size}" rx="${r}" ry="${r}"/>`,
        `  </clipPath>`,
      ]
    : [];

  const groupAttr = rounded ? ` clip-path="url(#clip)"` : "";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
    "  <defs>",
    `    <style>@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&amp;display=swap');</style>`,
    `    <radialGradient id="g1" cx="25%" cy="25%" r="60%">`,
    `      <stop offset="0%" stop-color="#925838" stop-opacity="0.35"/>`,
    `      <stop offset="100%" stop-color="${BROWN}" stop-opacity="0"/>`,
    "    </radialGradient>",
    `    <radialGradient id="g2" cx="80%" cy="85%" r="50%">`,
    `      <stop offset="0%" stop-color="#6B3420" stop-opacity="0.4"/>`,
    `      <stop offset="100%" stop-color="${BROWN}" stop-opacity="0"/>`,
    "    </radialGradient>",
    `    <radialGradient id="g3" cx="90%" cy="15%" r="40%">`,
    `      <stop offset="0%" stop-color="#A0603A" stop-opacity="0.2"/>`,
    `      <stop offset="100%" stop-color="${BROWN}" stop-opacity="0"/>`,
    "    </radialGradient>",
    ...clipOpen,
    "  </defs>",
    `  <g${groupAttr}>`,
    `    <rect width="${size}" height="${size}" fill="${BROWN}" rx="${r}" ry="${r}"/>`,
    `    <rect width="${size}" height="${size}" fill="url(#g1)"/>`,
    `    <rect width="${size}" height="${size}" fill="url(#g2)"/>`,
    `    <rect width="${size}" height="${size}" fill="url(#g3)"/>`,
    `    <circle cx="${size * 0.12}" cy="${size * 0.88}" r="${size * 0.25}" fill="#6B3420" opacity="0.12"/>`,
    `    <circle cx="${size * 0.92}" cy="${size * 0.08}" r="${size * 0.18}" fill="#A0603A" opacity="0.1"/>`,
    `    <text x="${size / 2}" y="${y1}" text-anchor="middle" font-family="'Montserrat', 'Arial Black', sans-serif" font-weight="900" font-size="${fs}" fill="${CREAM}">OS</text>`,
    `    <text x="${size / 2}" y="${y2}" text-anchor="middle" font-family="'Montserrat', 'Arial Black', sans-serif" font-weight="900" font-size="${fs}" fill="${CREAM}">PM</text>`,
    "  </g>",
    "</svg>",
  ].join("\n");
}

// --------------- PNG output (Satori → Resvg) ---------------

function LogoElement({ size, rounded }: { size: number; rounded: boolean }) {
  const fontSize = Math.round(size * 0.36);
  const radius = rounded ? Math.round(size * 0.12) : 0;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BROWN,
        backgroundImage:
          "radial-gradient(circle at 25% 25%, rgba(146,88,56,0.35) 0%, transparent 60%), " +
          "radial-gradient(circle at 80% 85%, rgba(107,52,32,0.4) 0%, transparent 50%), " +
          "radial-gradient(circle at 90% 15%, rgba(160,96,58,0.2) 0%, transparent 40%)",
        fontFamily: "Montserrat",
        position: "relative",
        overflow: "hidden",
        borderRadius: radius,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: "50%",
          backgroundColor: "#6B3420",
          opacity: 0.12,
          bottom: -size * 0.06,
          left: -size * 0.08,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: size * 0.35,
          height: size * 0.35,
          borderRadius: "50%",
          backgroundColor: "#A0603A",
          opacity: 0.1,
          top: -size * 0.06,
          right: -size * 0.06,
        }}
      />

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
  );
}

// --------------- Route handler ---------------

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const size = clampSize(searchParams.get("size"));
  const format = searchParams.get("format")?.toLowerCase() ?? "png";
  const rounded = parseRounded(searchParams.get("rounded"));

  if (format === "svg") {
    return new Response(buildSvg(size, rounded), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const fontData = await loadFont();

  return new ImageResponse(<LogoElement size={size} rounded={rounded} />, {
    width: size,
    height: size,
    fonts: [{ name: "Montserrat", data: fontData, weight: 900 as const, style: "normal" as const }],
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
