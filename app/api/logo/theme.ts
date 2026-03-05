export const BROWN = "#7E4430";
export const CREAM = "#DDD3C2";
export const FONT_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/montserrat@5.1.1/latin-900-normal.woff";

let cachedFont: ArrayBuffer | null = null;

export async function loadFont(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;
  const res = await fetch(FONT_URL);
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
  cachedFont = await res.arrayBuffer();
  return cachedFont;
}
