import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_JSON = join(ROOT, "package.json");
const RELEASE_JSON = join(ROOT, "public", "release.json");
const README = join(ROOT, "README.md");

function isoParts(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function nextCalVer(current) {
  const { year, week } = isoParts(new Date());
  const prefix = `${year}.${String(week).padStart(2, "0")}`;
  const [cy, cw, cp] = String(current || "").split(".");
  const sameWeek = `${cy}.${cw}` === prefix;
  return `${prefix}.${sameWeek ? Number(cp || 0) + 1 : 0}`;
}

const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf8"));
const version = nextCalVer(pkg.version);

if (process.argv.includes("--dry-run")) {
  console.log(version);
  process.exit(0);
}

pkg.version = version;
writeFileSync(PACKAGE_JSON, `${JSON.stringify(pkg, null, 2)}\n`);

const release = JSON.parse(readFileSync(RELEASE_JSON, "utf8"));
release.version = version;
writeFileSync(RELEASE_JSON, `${JSON.stringify(release, null, 2)}\n`);

const readme = readFileSync(README, "utf8").replace(
  /version-[0-9][0-9A-Za-z.+-]*-/,
  `version-${version}-`,
);
writeFileSync(README, readme);

console.log(`version ${version} written`);
