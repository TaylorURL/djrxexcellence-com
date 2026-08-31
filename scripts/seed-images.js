/**
 * Draws the sample listing artwork the seed uploads.
 *
 * These are flat illustrations rather than photographs, on purpose: a
 * photograph on a sample listing would read as a picture of a house that
 * exists. Output is deterministic from the seed number, so re-running the
 * seed reproduces the same set.
 */
import sharp from "sharp";

const W = 1600;
const H = 1200;

const skiesHouse = [
  ["#8FC4E8", "#DCEBF6"],
  ["#F6C89A", "#FBE6CE"],
  ["#9DB8D9", "#E4ECF5"],
  ["#B7CFE0", "#EFF5F9"],
  ["#E8B4A0", "#F8E3D8"],
];

const groundsHouse = [
  ["#7BA05B", "#5C7F42"],
  ["#8FAE6A", "#6B8C4C"],
  ["#A3B37A", "#7C8F58"],
];

const walls = ["#F2EDE4", "#E8DFD2", "#DCD3C6", "#EFE7DB", "#E2E8EC"];
const roofs = ["#4A4A52", "#5B4A42", "#3E4A55", "#6B5548", "#44505A"];
const doors = ["#A8121F", "#003DA5", "#3E5C3A", "#6B4423"];

function randHouse(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function pickHouse(list, r) {
  return list[Math.floor(r() * list.length) % list.length];
}

function treeHouse(x, groundY, scale, r) {
  const trunkW = 16 * scale;
  const trunkH = 70 * scale;
  const crown = 90 * scale;
  const shade = 0.85 + r() * 0.3;
  const green = `hsl(${Math.round(95 + r() * 25)}, ${Math.round(30 + r() * 15)}%, ${Math.round(28 * shade)}%)`;
  return `
    <rect x="${x - trunkW / 2}" y="${groundY - trunkH}" width="${trunkW}" height="${trunkH}" fill="#6B5136" rx="${trunkW / 3}"/>
    <circle cx="${x}" cy="${groundY - trunkH - crown * 0.45}" r="${crown * 0.62}" fill="${green}"/>
    <circle cx="${x - crown * 0.42}" cy="${groundY - trunkH - crown * 0.2}" r="${crown * 0.46}" fill="${green}" opacity="0.92"/>
    <circle cx="${x + crown * 0.44}" cy="${groundY - trunkH - crown * 0.24}" r="${crown * 0.44}" fill="${green}" opacity="0.92"/>`;
}

function windowsHouse(x, y, w, h, cols, rows, r) {
  let out = "";
  const pad = w * 0.12;
  const cw = (w - pad * (cols + 1)) / cols;
  const ch = (h - pad * (rows + 1)) / rows;
  for (let c = 0; c < cols; c += 1) {
    for (let row = 0; row < rows; row += 1) {
      const wx = x + pad + c * (cw + pad);
      const wy = y + pad + row * (ch + pad);
      const lit = r() > 0.55;
      out += `<rect x="${wx}" y="${wy}" width="${cw}" height="${ch}" rx="4"
        fill="${lit ? "#F7E6BE" : "#9FB6C6"}" stroke="#FFFFFF" stroke-width="4"/>
        <line x1="${wx + cw / 2}" y1="${wy}" x2="${wx + cw / 2}" y2="${wy + ch}" stroke="#FFFFFF" stroke-width="3"/>`;
    }
  }
  return out;
}

function sceneHouse(seed, variant) {
  const r = randHouse(seed * 7919 + variant * 104729);
  const [skyTop, skyBottom] = pickHouse(skiesHouse, r);
  const [grassTop, grassBottom] = pickHouse(groundsHouse, r);
  const wall = pickHouse(walls, r);
  const roof = pickHouse(roofs, r);
  const door = pickHouse(doors, r);

  const MARGIN = W * 0.09;
  const groundY = H * (0.64 + r() * 0.06);
  const bodyH = H * (0.24 + r() * 0.07);
  const roofH = bodyH * (0.55 + r() * 0.25);
  const gable = r() > 0.45;

  const bodyW = W * (0.34 + r() * 0.08);
  const wingW = bodyW * (0.32 + r() * 0.14);
  const wingH = bodyH * (0.7 + r() * 0.16);
  const wingRight = r() > 0.5;

  // The wing sits against one end of the house, so the pair is placed as a
  // single block and then nudged, which keeps both inside the frame at every
  // width the generator picks.
  const span = bodyW + wingW;
  const blockX = Math.min(
    Math.max(W / 2 - span / 2 + (r() - 0.5) * W * 0.06, MARGIN),
    W - MARGIN - span,
  );
  const bodyX = wingRight ? blockX : blockX + wingW;
  const wingX = wingRight ? blockX + bodyW : blockX;
  const bodyY = groundY - bodyH;
  const wingY = groundY - wingH;
  const eave = bodyW * 0.07;

  const doorW = bodyW * 0.1;
  const doorH = bodyH * 0.52;
  const doorX = bodyX + bodyW * (0.42 + r() * 0.12);
  const doorY = groundY - doorH;

  const roofShape = gable
    ? `<polygon points="${bodyX - eave},${bodyY} ${bodyX + bodyW / 2},${bodyY - roofH} ${bodyX + bodyW + eave},${bodyY}" fill="${roof}"/>`
    : `<polygon points="${bodyX - eave},${bodyY} ${bodyX + bodyW * 0.24},${bodyY - roofH} ${bodyX + bodyW * 0.76},${bodyY - roofH} ${bodyX + bodyW + eave},${bodyY}" fill="${roof}"/>`;

  const path = `<path d="M ${doorX + doorW / 2} ${groundY}
      C ${doorX + doorW / 2} ${groundY + (H - groundY) * 0.4},
        ${W * 0.5 + (r() - 0.5) * 200} ${groundY + (H - groundY) * 0.6},
        ${W * 0.5 + (r() - 0.5) * 320} ${H}
      L ${W * 0.5 + (r() - 0.5) * 320 + 190} ${H}
      C ${W * 0.5 + 190} ${groundY + (H - groundY) * 0.6},
        ${doorX + doorW / 2 + 70} ${groundY + (H - groundY) * 0.4},
        ${doorX + doorW / 2 + 55} ${groundY} Z"
      fill="#D8D2C6" opacity="0.9"/>`;

  return `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${skyTop}"/>
      <stop offset="100%" stop-color="${skyBottom}"/>
    </linearGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${grassTop}"/>
      <stop offset="100%" stop-color="${grassBottom}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="${W * (0.12 + r() * 0.7)}" cy="${H * (0.1 + r() * 0.12)}" r="${52 + r() * 26}" fill="#FFFFFF" opacity="0.5"/>
  <ellipse cx="${W * 0.24}" cy="${H * 0.2}" rx="150" ry="42" fill="#FFFFFF" opacity="0.42"/>
  <ellipse cx="${W * 0.72}" cy="${H * 0.14}" rx="190" ry="50" fill="#FFFFFF" opacity="0.36"/>

  <rect y="${groundY}" width="${W}" height="${H - groundY}" fill="url(#grass)"/>
  ${path}

  ${treeHouse(Math.min(blockX - MARGIN * 0.5, W * 0.1), groundY + 14, 1.0 + r() * 0.45, r)}
  ${treeHouse(Math.max(blockX + span + MARGIN * 0.5, W * 0.9), groundY + 20, 0.9 + r() * 0.5, r)}

  <rect x="${wingX}" y="${wingY}" width="${wingW}" height="${wingH}" fill="${wall}"/>
  <polygon points="${wingX - eave * 0.6},${wingY} ${wingX + wingW / 2},${wingY - roofH * 0.62} ${wingX + wingW + eave * 0.6},${wingY}" fill="${roof}"/>
  ${windowsHouse(wingX + wingW * 0.16, wingY + wingH * 0.2, wingW * 0.68, wingH * 0.4, 2, 1, r)}

  <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" fill="${wall}"/>
  ${roofShape}
  ${windowsHouse(bodyX + bodyW * 0.08, bodyY + bodyH * 0.16, bodyW * 0.28, bodyH * 0.42, 2, 1, r)}
  ${windowsHouse(bodyX + bodyW * 0.62, bodyY + bodyH * 0.16, bodyW * 0.3, bodyH * 0.42, 2, 1, r)}

  <rect x="${doorX}" y="${doorY}" width="${doorW}" height="${doorH}" rx="${doorW * 0.08}" fill="${door}"/>
  <circle cx="${doorX + doorW * 0.82}" cy="${doorY + doorH * 0.55}" r="5" fill="#E8D9A8"/>

  <rect x="${bodyX - eave}" y="${bodyY - 6}" width="${bodyW + eave * 2}" height="10" fill="${roof}" opacity="0.85"/>
  <ellipse cx="${blockX + span / 2}" cy="${groundY + 14}" rx="${span * 0.56}" ry="18" fill="#000000" opacity="0.1"/>
  <rect y="${groundY}" width="${W}" height="6" fill="#000000" opacity="0.07"/>
</svg>`;
}

const skiesLand = [
  ["#8FC4E8", "#DCEBF6"],
  ["#F6C89A", "#FBE6CE"],
  ["#9DB8D9", "#E4ECF5"],
  ["#B7CFE0", "#EFF5F9"],
  ["#CBD9E4", "#F1F6FA"],
];

const groundsLand = [
  ["#8AAE63", "#5C7F42"],
  ["#9CB672", "#6B8C4C"],
  ["#A9B87E", "#7C8F58"],
];

function randLand(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function pickLand(list, r) {
  return list[Math.floor(r() * list.length) % list.length];
}

function treeLand(x, groundY, scale, r) {
  const trunkW = 15 * scale;
  const trunkH = 74 * scale;
  const crown = 92 * scale;
  const green = `hsl(${Math.round(92 + r() * 28)}, ${Math.round(28 + r() * 18)}%, ${Math.round(22 + r() * 12)}%)`;
  return `
    <rect x="${x - trunkW / 2}" y="${groundY - trunkH}" width="${trunkW}" height="${trunkH}" fill="#6B5136" rx="${trunkW / 3}"/>
    <circle cx="${x}" cy="${groundY - trunkH - crown * 0.45}" r="${crown * 0.6}" fill="${green}"/>
    <circle cx="${x - crown * 0.4}" cy="${groundY - trunkH - crown * 0.18}" r="${crown * 0.44}" fill="${green}" opacity="0.93"/>
    <circle cx="${x + crown * 0.42}" cy="${groundY - trunkH - crown * 0.22}" r="${crown * 0.42}" fill="${green}" opacity="0.93"/>`;
}

function sceneLand(seed, variant) {
  const r = randLand(seed * 7919 + variant * 104729);
  const [skyTop, skyBottom] = pickLand(skiesLand, r);
  const [grassTop, grassBottom] = pickLand(groundsLand, r);
  const groundY = H * (0.56 + r() * 0.06);

  // A treeline across the back of the tract, then a few nearer trees, and a
  // fence running toward the horizon. Nothing built on it, because nothing is.
  let treeline = "";
  for (let i = 0; i < 26; i += 1) {
    const x = (W / 24) * i + (r() - 0.5) * 50;
    const h = 70 + r() * 90;
    const green = `hsl(${Math.round(96 + r() * 22)}, ${Math.round(24 + r() * 14)}%, ${Math.round(20 + r() * 8)}%)`;
    treeline += `<circle cx="${x}" cy="${groundY - h * 0.5}" r="${h * 0.55}" fill="${green}" opacity="0.9"/>`;
  }

  let fence = "";
  const posts = 9;
  for (let i = 0; i < posts; i += 1) {
    const t = i / (posts - 1);
    const x = W * 0.06 + t * W * 0.42;
    const y = groundY + 40 + t * (H - groundY) * 0.62;
    const h = 120 - t * 62;
    fence += `<rect x="${x}" y="${y - h}" width="${9 - t * 4}" height="${h}" fill="#8A7355" rx="2"/>`;
  }
  fence += `<path d="M ${W * 0.06} ${groundY + 40 - 82} L ${W * 0.48} ${H * 0.93 - 44}" stroke="#8A7355" stroke-width="7" fill="none"/>`;
  fence += `<path d="M ${W * 0.06} ${groundY + 40 - 40} L ${W * 0.48} ${H * 0.93 - 20}" stroke="#8A7355" stroke-width="7" fill="none"/>`;

  return `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${skyTop}"/>
      <stop offset="100%" stop-color="${skyBottom}"/>
    </linearGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${grassTop}"/>
      <stop offset="100%" stop-color="${grassBottom}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="${W * (0.14 + r() * 0.66)}" cy="${H * (0.09 + r() * 0.1)}" r="${50 + r() * 24}" fill="#FFFFFF" opacity="0.5"/>
  <ellipse cx="${W * 0.3}" cy="${H * 0.18}" rx="170" ry="44" fill="#FFFFFF" opacity="0.4"/>
  <ellipse cx="${W * 0.76}" cy="${H * 0.12}" rx="200" ry="52" fill="#FFFFFF" opacity="0.34"/>

  ${treeline}
  <rect y="${groundY}" width="${W}" height="${H - groundY}" fill="url(#grass)"/>
  <ellipse cx="${W * 0.5}" cy="${groundY + 6}" rx="${W * 0.7}" ry="26" fill="#FFFFFF" opacity="0.08"/>

  ${treeLand(W * (0.72 + r() * 0.1), groundY + 90, 1.5 + r() * 0.6, r)}
  ${treeLand(W * (0.9 + r() * 0.06), groundY + 150, 1.8 + r() * 0.7, r)}
  ${fence}
</svg>`;
}

async function render(svg) {
  return sharp(Buffer.from(svg), { density: 96 })
    .resize(W, H, { fit: "fill" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

/**
 * Returns `count` JPEG buffers for one listing. `kind` picks the subject:
 * a tract of land gets an open field and a treeline, everything else gets a
 * house.
 */
export async function listingPhotos({ seed, count = 5, kind = "house" }) {
  const draw = kind === "land" ? sceneLand : sceneHouse;
  return Promise.all(
    Array.from({ length: count }, (_, index) => render(draw(seed, index))),
  );
}
