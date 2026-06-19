// Generates Fluxa PWA raster assets (icons + iOS splash screens) from the
// brand "F" mark. Run with: node scripts/generate-pwa-assets.mjs
// Requires `sharp` (installed transiently: `npm i sharp --no-save`).
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = resolve(root, "public/icons");
const splashDir = resolve(root, "public/splash");
mkdirSync(iconsDir, { recursive: true });
mkdirSync(splashDir, { recursive: true });

const GRAD = `<linearGradient id="g" x1="3" y1="2" x2="29" y2="30" gradientUnits="userSpaceOnUse"><stop stop-color="#8B7CFF"/><stop offset="1" stop-color="#5B4CF0"/></linearGradient>`;

// The forward-leaning "F" in a 0 0 32 32 viewBox, optionally scaled about centre.
function fMark(scale = 1) {
  const bars = `<rect x="8.5" y="6" width="4.6" height="20" rx="2.3"/><rect x="8.5" y="6" width="13" height="4.6" rx="2.3"/><rect x="8.5" y="13.4" width="9" height="4.6" rx="2.3"/>`;
  const base = `translate(5 0) skewX(-9)`;
  const t = scale === 1 ? base : `translate(16 16) scale(${scale}) translate(-16 -16) ${base}`;
  return `<g transform="${t}" fill="#ffffff">${bars}</g>`;
}

// purpose: "any" (rounded squircle), "maskable" (full-bleed, safe-zone F),
// "apple" (full-bleed square, iOS rounds it).
function iconSvg(size, purpose) {
  const rx = purpose === "any" ? 8.5 : 0;
  const scale = purpose === "maskable" ? 0.72 : purpose === "apple" ? 0.8 : 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><defs>${GRAD}</defs><rect width="32" height="32" rx="${rx}" fill="url(#g)"/>${fMark(scale)}</svg>`;
}

function splashSvg(w, h) {
  const cx = w / 2;
  const T = Math.round(Math.min(w, h) * 0.22);
  const tileX = cx - T / 2;
  const tileY = h / 2 - T;
  const tile = `<svg x="${tileX}" y="${tileY}" width="${T}" height="${T}" viewBox="0 0 32 32"><defs>${GRAD}</defs><rect width="32" height="32" rx="8.5" fill="url(#g)"/>${fMark(1)}</svg>`;
  const font = `font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="#0b0c0f"/>
    ${tile}
    <text x="${cx}" y="${tileY + T + 70}" text-anchor="middle" ${font} font-size="44" font-weight="700" letter-spacing="-1.5" fill="#f4f4f5">Fluxa</text>
    <text x="${cx}" y="${tileY + T + 112}" text-anchor="middle" ${font} font-size="19" font-weight="500" fill="#a1a1aa">Plan. Spend. Progress.</text>
  </svg>`;
}

const png = (svg) => sharp(Buffer.from(svg)).png();

// ---- Icons ----
const icons = [
  ["icon-192.png", iconSvg(192, "any")],
  ["icon-512.png", iconSvg(512, "any")],
  ["maskable-192.png", iconSvg(192, "maskable")],
  ["maskable-512.png", iconSvg(512, "maskable")],
  ["apple-touch-icon.png", iconSvg(180, "apple")],
];

// ---- iOS splash screens (portrait): [cssW, cssH, ratio] ----
const devices = [
  [320, 568, 2], [375, 667, 2], [414, 736, 3], [375, 812, 3],
  [414, 896, 2], [414, 896, 3], [390, 844, 3], [428, 926, 3],
  [393, 852, 3], [430, 932, 3], [402, 874, 3], [440, 956, 3],
  [768, 1024, 2], [1024, 1366, 2],
];

const splashLinks = [];
for (const [cw, ch, r] of devices) {
  const w = cw * r;
  const h = ch * r;
  const file = `splash-${w}x${h}.png`;
  splashLinks.push(
    `    <link rel="apple-touch-startup-image" media="(device-width: ${cw}px) and (device-height: ${ch}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)" href="/splash/${file}" />`,
  );
  await png(splashSvg(w, h)).toFile(resolve(splashDir, file));
}

await Promise.all(
  icons.map(([name, svg]) => png(svg).toFile(resolve(iconsDir, name))),
);

writeFileSync(resolve(root, "scripts/apple-splash-links.html"), splashLinks.join("\n") + "\n");

console.log(`Generated ${icons.length} icons + ${devices.length} splash screens.`);
