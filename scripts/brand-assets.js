/**
 * Derives every brand file the site serves from public/brand/remax-2025.svg.
 *
 * Run with `npm run brand` and commit what it writes. The lockup splits into a
 * pin and a wordmark, and the pin alone is what a browser tab, a home screen
 * icon and a PWA icon get: the full lockup is five times wider than it is tall,
 * so a square crop of it renders as a smear at 16px.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public", "brand", "remax-2025.svg");
const brandDir = path.join(root, "public", "brand");
const publicDir = path.join(root, "public");

const MATRIX = "matrix(3.7558685,0,0,3.7558685,-4.1314554,-3.0046948)";

// The pin's extent inside the source viewBox, and the lockup's own bounds.
const PIN = { w: 101.2, h: 113.6 };
const LOCKUP = { w: 800, h: 219.34273 };

// Padding around the pin in the square icons, as a share of the icon edge.
const ICON_PAD = 0.11;

/** Returns the top-level `<g>` children of `svg`'s outermost transformed group. */
function groupChildren(svg) {
  const open = svg.indexOf(`transform="${MATRIX}"`);
  if (open < 0)
    throw new Error(
      "the source lockup no longer carries the expected transform",
    );

  const body = svg.slice(svg.indexOf(">", open) + 1);
  const tags = body.matchAll(/<(\/?)g\b[^>]*?(\/?)>/g);
  const children = [];
  let depth = 0;
  let start = 0;

  for (const tag of tags) {
    if (tag[2] === "/") continue;
    if (tag[1]) {
      depth -= 1;
      if (depth === 0)
        children.push(body.slice(start, tag.index + tag[0].length));
      if (depth < 0) break;
    } else {
      if (depth === 0) start = tag.index;
      depth += 1;
    }
  }

  if (children.length !== 2) {
    throw new Error(
      `expected a wordmark and a pin, found ${children.length} groups`,
    );
  }
  return { wordmark: children[0], pin: children[1] };
}

function styleBlock(svg) {
  const match = svg.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  if (!match) throw new Error("the source lockup carries no style block");
  return match[1].trim();
}

function document({ viewBox, style, body, label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${label}">
<title>${label}</title>
<style>${style}</style>
<g transform="${MATRIX}">${body}</g>
</svg>
`;
}

/** Paints the wordmark letterforms, which carry no fill of their own. */
function inkWordmark(wordmark, colour) {
  return wordmark.replace(/<path\s+d=/g, `<path fill="${colour}" d=`);
}

async function squareIcon(pinSvg, size, background) {
  const inner = Math.round(size * (1 - ICON_PAD * 2));
  const pin = await sharp(Buffer.from(pinSvg), { density: 2400 })
    .resize({ height: inner })
    .png()
    .toBuffer();
  const { width } = await sharp(pin).metadata();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: pin,
        left: Math.round((size - width) / 2),
        top: Math.round((size - inner) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function main() {
  const svg = await readFile(source, "utf8");
  const style = styleBlock(svg);
  const { wordmark, pin } = groupChildren(svg);

  const pinSvg = document({
    viewBox: `0 0 ${PIN.w} ${PIN.h}`,
    style,
    body: pin,
    label: "RE/MAX",
  });

  const lockup = (colour) =>
    document({
      viewBox: `0 0 ${LOCKUP.w} ${LOCKUP.h}`,
      style,
      body: `${inkWordmark(wordmark, colour)}${pin}`,
      label: "RE/MAX",
    });

  await mkdir(brandDir, { recursive: true });

  const files = [
    [path.join(brandDir, "remax-pin.svg"), pinSvg],
    [path.join(brandDir, "remax-logo.svg"), lockup("#000e35")],
    [path.join(brandDir, "remax-logo-light.svg"), lockup("#ffffff")],
    [path.join(publicDir, "favicon.svg"), pinSvg],
  ];

  for (const [file, contents] of files) {
    await writeFile(file, contents);
    console.log(`wrote ${path.relative(root, file)}`);
  }

  const white = { r: 255, g: 255, b: 255, alpha: 1 };
  const rasters = [
    ["icon-192.png", 192, null],
    ["icon-512.png", 512, null],
    ["apple-touch-icon.png", 180, white],
  ];

  for (const [name, size, background] of rasters) {
    const file = path.join(publicDir, name);
    await writeFile(file, await squareIcon(pinSvg, size, background));
    console.log(`wrote ${path.relative(root, file)} (${size}x${size})`);
  }
}

await main();
