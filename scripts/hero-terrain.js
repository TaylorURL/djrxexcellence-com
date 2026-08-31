/**
 * Draws public/art/terrain.svg, the contour lines behind the hero.
 *
 * Run with `npm run terrain` and commit the result. The field is seeded, so the
 * same seed always draws the same land and the file only changes when someone
 * means it to.
 *
 * The lines are real contours rather than stacked waves: a value-noise height
 * field is sampled on a grid, and marching squares walks each iso level to
 * produce the nested closed loops a topographic map actually has. Waves read as
 * a pattern; contours read as ground.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "art", "terrain.svg");

const WIDTH = 1600;
const HEIGHT = 900;

// Samples across the field. Higher reads smoother and costs bytes.
const COLS = 170;
const ROWS = 96;

const SEED = 20260826;
const OCTAVES = 4;
// Cells across the coarsest octave. Lower means broader landforms.
const BASE_FREQUENCY = 2;
const LEVELS = 11;
const DECIMALS = 0;

/** Deterministic 32-bit PRNG, so the field never depends on Math.random. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smoothstep = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/** One octave of value noise, sampled at unit coordinates. */
function valueNoise(random, frequency) {
  const size = frequency + 1;
  const grid = Array.from({ length: size * size }, () => random());

  return (x, y) => {
    const gx = x * frequency;
    const gy = y * frequency;
    const x0 = Math.min(Math.floor(gx), frequency - 1);
    const y0 = Math.min(Math.floor(gy), frequency - 1);
    const tx = smoothstep(gx - x0);
    const ty = smoothstep(gy - y0);

    const top = lerp(grid[y0 * size + x0], grid[y0 * size + x0 + 1], tx);
    const bottom = lerp(
      grid[(y0 + 1) * size + x0],
      grid[(y0 + 1) * size + x0 + 1],
      tx,
    );
    return lerp(top, bottom, ty);
  };
}

function heightField() {
  const random = mulberry32(SEED);
  const octaves = [];
  let frequency = BASE_FREQUENCY;
  let amplitude = 1;
  let total = 0;

  for (let i = 0; i < OCTAVES; i += 1) {
    octaves.push({ sample: valueNoise(random, frequency), amplitude });
    total += amplitude;
    frequency *= 2;
    amplitude /= 2;
  }

  const values = new Float64Array(COLS * ROWS);
  let min = Infinity;
  let max = -Infinity;

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const x = col / (COLS - 1);
      const y = row / (ROWS - 1);
      let value = 0;
      for (const octave of octaves) {
        value += octave.sample(x, y) * octave.amplitude;
      }
      value /= total;
      values[row * COLS + col] = value;
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }

  // Stretched to the full range so the iso levels are evenly spread through the
  // land rather than bunched wherever the noise happened to sit.
  const span = max - min || 1;
  for (let i = 0; i < values.length; i += 1) {
    values[i] = (values[i] - min) / span;
  }
  return values;
}

const px = (col) => (col / (COLS - 1)) * WIDTH;
const py = (row) => (row / (ROWS - 1)) * HEIGHT;
const key = (point) => `${point[0].toFixed(3)},${point[1].toFixed(3)}`;

/** Where an edge between two corners crosses the level. */
function crossing(iso, a, b, pointA, pointB) {
  const t = (iso - a) / (b - a || 1e-9);
  return [lerp(pointA[0], pointB[0], t), lerp(pointA[1], pointB[1], t)];
}

/** Marching squares over one iso level, returning unordered segments. */
function segmentsAt(values, iso) {
  const segments = [];

  for (let row = 0; row < ROWS - 1; row += 1) {
    for (let col = 0; col < COLS - 1; col += 1) {
      const tl = values[row * COLS + col];
      const tr = values[row * COLS + col + 1];
      const br = values[(row + 1) * COLS + col + 1];
      const bl = values[(row + 1) * COLS + col];

      const index =
        (tl > iso ? 8 : 0) |
        (tr > iso ? 4 : 0) |
        (br > iso ? 2 : 0) |
        (bl > iso ? 1 : 0);
      if (index === 0 || index === 15) continue;

      const cornerTL = [px(col), py(row)];
      const cornerTR = [px(col + 1), py(row)];
      const cornerBR = [px(col + 1), py(row + 1)];
      const cornerBL = [px(col), py(row + 1)];

      const top = () => crossing(iso, tl, tr, cornerTL, cornerTR);
      const right = () => crossing(iso, tr, br, cornerTR, cornerBR);
      const bottom = () => crossing(iso, bl, br, cornerBL, cornerBR);
      const left = () => crossing(iso, tl, bl, cornerTL, cornerBL);

      switch (index) {
        case 1:
        case 14:
          segments.push([left(), bottom()]);
          break;
        case 2:
        case 13:
          segments.push([bottom(), right()]);
          break;
        case 3:
        case 12:
          segments.push([left(), right()]);
          break;
        case 4:
        case 11:
          segments.push([top(), right()]);
          break;
        case 6:
        case 9:
          segments.push([top(), bottom()]);
          break;
        case 7:
        case 8:
          segments.push([left(), top()]);
          break;
        // The saddles, where the cell holds two separate crossings.
        case 5:
          segments.push([left(), top()], [bottom(), right()]);
          break;
        case 10:
          segments.push([left(), bottom()], [top(), right()]);
          break;
        default:
          break;
      }
    }
  }

  return segments;
}

/**
 * Chains segments end to end into polylines.
 *
 * Emitting each segment as its own path would repeat both endpoints for every
 * step of every contour, which is most of the file.
 */
function chain(segments) {
  const ends = new Map();
  for (const segment of segments) {
    for (const point of [segment[0], segment[1]]) {
      const k = key(point);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(segment);
    }
  }

  const used = new Set();
  const lines = [];

  const walk = (segment, from) => {
    const points = [from];
    let current = segment;
    let head = from;

    while (current && !used.has(current)) {
      used.add(current);
      const next = key(current[0]) === key(head) ? current[1] : current[0];
      points.push(next);
      head = next;
      current = (ends.get(key(next)) ?? []).find((s) => !used.has(s));
    }
    return points;
  };

  for (const segment of segments) {
    if (used.has(segment)) continue;
    lines.push(walk(segment, segment[0]));
  }

  return lines;
}

function pathData(points) {
  const round = (n) => Number(n.toFixed(DECIMALS));
  const closed =
    points.length > 3 && key(points[0]) === key(points[points.length - 1]);
  const body = points
    .slice(1, closed ? -1 : undefined)
    .map((p) => `${round(p[0])} ${round(p[1])}`)
    .join(" ");
  return `M${round(points[0][0])} ${round(points[0][1])}L${body}${closed ? "Z" : ""}`;
}

async function main() {
  const values = heightField();
  const groups = [];
  let total = 0;

  for (let i = 1; i <= LEVELS; i += 1) {
    const iso = i / (LEVELS + 1);
    const lines = chain(segmentsAt(values, iso)).filter(
      (points) => points.length > 3,
    );
    if (!lines.length) continue;
    total += lines.length;

    // Every fifth line is an index contour, the heavier one a topographic map
    // draws to make the spacing readable.
    const index = i % 5 === 0;
    groups.push(
      `<g stroke-width="${index ? 1.9 : 1}" opacity="${index ? 0.85 : 0.5}">` +
        lines.map((points) => `<path d="${pathData(points)}"/>`).join("") +
        `</g>`,
    );
  }

  const svg =
    `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" ` +
    `preserveAspectRatio="xMidYMid slice" fill="none" stroke="#ffffff" ` +
    `stroke-linecap="round" stroke-linejoin="round">` +
    groups.join("") +
    `</svg>\n`;

  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, svg);
  console.log(
    `wrote ${path.relative(root, out)} (${LEVELS} levels, ${total} contours, ${Math.round(svg.length / 1024)}KB)`,
  );
}

await main();
