/**
 * Renders public/social-card.png, the 1200x630 image a link preview shows.
 *
 * Run with `npm run social-card` when the headline, the agent details or the
 * headshot change, and commit what it writes. Rendering happens here rather
 * than at build time so the card is reviewable in a diff.
 */
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "social-card.png");
const headshot = path.join(root, "public", "agent", "dylan-jordan.jpg");
const wordmark = path.join(root, "public", "brand", "remax-logo-light.svg");

const WIDTH = 1200;
const HEIGHT = 630;
const PORTRAIT_W = 440;
// How far the portrait's left edge fades, so it sits on the ground rather than
// in a box on top of it.
const FEATHER = 210;

const eyebrow = "DAYTON · LIBERTY COUNTY · TEXAS";
const headline = ["Homes in Dayton, and seven", "towns either side of it."];
const sub = [
  "Search what is on the market, save what fits, and find",
  "out what your own home would sell for.",
];
const agentName = "Dylan Jordan";
const agentTitle = "Real Estate Agent, RE/MAX Excellence";
const domain = "djrxexcellence.com";

/** Escapes the characters that would otherwise open or close an SVG node. */
function xml(text) {
  const escapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  };
  return text.replace(/[&<>"']/g, (char) => escapes[char]);
}

async function portrait() {
  const cropped = await sharp(headshot)
    .resize(PORTRAIT_W, HEIGHT, { fit: "cover", position: "top" })
    .toBuffer();

  // dest-in reads the mask's alpha, not its lightness, so the ramp has to be
  // in stop-opacity. A black-to-white ramp at full alpha keeps every pixel.
  const fade = Buffer.from(
    `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="${PORTRAIT_W}" height="${HEIGHT}">
       <defs>
         <linearGradient id="fade" x1="0" x2="1">
           <stop offset="0" stop-color="#fff" stop-opacity="0"/>
           <stop offset="${FEATHER / PORTRAIT_W}" stop-color="#fff" stop-opacity="1"/>
         </linearGradient>
       </defs>
       <rect width="${PORTRAIT_W}" height="${HEIGHT}" fill="url(#fade)"/>
     </svg>`,
  );

  return sharp(cropped)
    .composite([{ input: fade, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function main() {
  const ground = Buffer.from(
    `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
       <defs>
         <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#001640"/>
           <stop offset="1" stop-color="#000e35"/>
         </linearGradient>
         <radialGradient id="glow" cx="0.05" cy="0.9" r="0.75">
           <stop offset="0" stop-color="#e01000" stop-opacity="0.22"/>
           <stop offset="1" stop-color="#e01000" stop-opacity="0"/>
         </radialGradient>
         <pattern id="plat" width="56" height="56" patternUnits="userSpaceOnUse">
           <path d="M56 0H0V56" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
         </pattern>
         <radialGradient id="platMask" cx="0.08" cy="0" r="1.15">
           <stop offset="0.3" stop-color="#fff"/>
           <stop offset="0.75" stop-color="#000"/>
         </radialGradient>
         <mask id="platFade">
           <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#platMask)"/>
         </mask>
       </defs>
       <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#ground)"/>
       <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#plat)" mask="url(#platFade)"/>
       <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
     </svg>`,
  );

  const logo = await sharp(await readFile(wordmark), { density: 900 })
    .resize({ height: 40 })
    .png()
    .toBuffer();

  const text = Buffer.from(
    `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
       <style>
         .eyebrow { font-family: "Work Sans", sans-serif; font-size: 19px; font-weight: 700; letter-spacing: 3.2px; fill: #ff7a6c; }
         .headline { font-family: "National Park", serif; font-size: 58px; font-weight: 600; fill: #ffffff; overflow-wrap: anywhere; }
         .sub { font-family: "Work Sans", sans-serif; font-size: 23px; font-weight: 400; fill: #ffffff; fill-opacity: 0.74; }
         .name { font-family: "National Park", serif; font-size: 26px; font-weight: 600; fill: #ffffff; }
         .title { font-family: "Work Sans", sans-serif; font-size: 17px; font-weight: 400; fill: #ffffff; fill-opacity: 0.62; }
         .domain { font-family: "Work Sans", sans-serif; font-size: 18px; font-weight: 600; fill: #ffffff; fill-opacity: 0.78; }
       </style>
       <text class="eyebrow" x="80" y="126">${xml(eyebrow)}</text>
       <text class="headline" x="80" y="216">${xml(headline[0])}</text>
       <text class="headline" x="80" y="286">${xml(headline[1])}</text>
       <text class="sub" x="80" y="352">${xml(sub[0])}</text>
       <text class="sub" x="80" y="386">${xml(sub[1])}</text>
       <line x1="80" y1="502" x2="640" y2="502" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1"/>
       <text class="name" x="80" y="552">${xml(agentName)}</text>
       <text class="title" x="80" y="580">${xml(agentTitle)}</text>
       <text class="domain" x="80" y="62">${xml(domain)}</text>
     </svg>`,
  );

  await sharp(ground)
    .composite([
      { input: await portrait(), left: WIDTH - PORTRAIT_W, top: 0 },
      { input: text, left: 0, top: 0 },
      { input: logo, left: 80, top: 428 },
    ])
    .png({ compressionLevel: 9, palette: true, quality: 82 })
    .toFile(out);

  console.log(`wrote ${path.relative(root, out)} (${WIDTH}x${HEIGHT})`);
}

await main();
