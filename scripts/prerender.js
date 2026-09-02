/**
 * Writes one HTML file per published route, after the bundle is built.
 *
 * The app renders in the browser, so `dist/index.html` reaches every URL with an
 * empty body and one set of head tags. A visitor never notices, because the
 * bundle rewrites both before they read anything. A crawler does: a social
 * scraper and most AI readers take the bytes the server sent and never run the
 * script, so every route shared a title, a description and a card with the home
 * page, and none of them carried any words at all.
 *
 * Each file here carries its own head and its own first screen. React mounts
 * over the shell on load, so the shell is what a reader gets before the bundle
 * arrives and what a crawler gets instead of it.
 *
 * Static routes and the area pages are known from the source. The listings are
 * not, so they are read from the database at build time -- the same set the
 * sitemap publishes, since a URL a crawler is sent to and a URL that has a
 * document have to be the same list.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { areas } from "../src/data/areas.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const origin = "https://djrxexcellence.com";

const escape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * The config is authored as ES modules with the `@` alias the bundler resolves,
 * so it is read as text and evaluated here rather than imported.
 */
async function loadConfig() {
  const source = await fs.readFile(
    path.join(root, "src/config/routeMeta.js"),
    "utf8",
  );
  const site = await fs.readFile(path.join(root, "src/config/site.js"), "utf8");
  const stripped = source.replace(
    /^import[^;]+;/m,
    site.replace(/export /g, ""),
  );
  const module = await import(
    `data:text/javascript;base64,${Buffer.from(stripped).toString("base64")}`
  );
  return { routeMeta: module.routeMeta, areaMetaFor: module.areaMetaFor };
}

/**
 * The eight area pages are published in the sitemap and their content is fixed
 * at build time, so each one is written out the same way a static route is.
 * Without this they fall through the rewrite to `dist/index.html` and answer a
 * crawler with the home page's title, description and canonical, which points
 * all eight at `/` and makes them duplicates of it.
 *
 * The head comes from `areaMetaFor` in the config rather than being composed
 * here, which is what keeps the bytes a crawler reads and the head a visitor
 * ends up with saying the same thing.
 */
function areaMeta(areaMetaFor) {
  return Object.fromEntries(
    areas.map((area) => [`/areas/${area.slug}`, areaMetaFor(area)]),
  );
}

/**
 * The same treatment for each published listing.
 *
 * A listing is in the sitemap, so a crawler is told to fetch it, and without a
 * document of its own it falls through the rewrite to `dist/index.html` and
 * answers with the home page's canonical -- which would file every listing as a
 * duplicate of the home page. The set is not knowable from the file tree the
 * way the areas are, so it comes from the same query the sitemap runs.
 *
 * Title and description match what `ListingDetail` hands `Seo`, so the bytes a
 * crawler reads and the head a visitor ends up with say the same thing. A build
 * with no credentials writes the static routes and nothing else, which is the
 * local case; the deploy that matters runs on Vercel, where both are set.
 */
async function listingMeta() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("prerender: no Supabase credentials, listings omitted");
    return {};
  }
  const { data, error } = await createClient(url, key)
    .from("listings")
    .select(
      "slug, street_address, city, description, price, beds, baths, square_feet",
    )
    .not("published_at", "is", null);
  if (error) {
    console.warn(`prerender: listings unreadable (${error.message})`);
    return {};
  }
  const money = (value) =>
    value == null
      ? "Price on request"
      : `$${Number(value).toLocaleString("en-US")}`;
  return Object.fromEntries(
    (data ?? []).map((row) => [
      `/listings/${row.slug}`,
      {
        title: `${row.street_address}, ${row.city} TX`,
        heading: `${row.street_address}, ${row.city}, Texas`,
        description:
          row.description?.slice(0, 180) ??
          `${money(row.price)} in ${row.city}, Texas. ${row.beds ?? "—"} bed, ${row.baths ?? "—"} bath, ${row.square_feet ?? "—"} square feet.`,
      },
    ]),
  );
}

const NAV = [
  ["/listings", "Listings"],
  ["/areas", "Areas"],
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/faq", "FAQ"],
];

const LEGAL = [
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms of Use"],
  ["/accessibility", "Accessibility"],
  ["/fair-housing", "Fair Housing"],
];

function shell(route, meta) {
  const links = (rows) =>
    rows
      .filter(([href]) => href !== route)
      .map(([href, label]) => `<a href="${href}">${escape(label)}</a>`)
      .join("\n          ");

  return `<div id="prerender">
        <nav aria-label="Primary">
          ${links(NAV)}
        </nav>
        <main>
          <h1>${escape(meta.heading)}</h1>
          <p>${escape(meta.description)}</p>
        </main>
        <footer>
          ${links(LEGAL)}
        </footer>
      </div>`;
}

/**
 * Runs the bundle after the first frame rather than before it.
 *
 * Every route written here is a finished document, so its first frame owes
 * the bundle nothing. A module script is deferred, which only means it waits
 * for the parser: it runs the moment parsing ends, and on a slow phone that
 * moment arrives before the browser has found a frame to paint the document
 * in. The page then sits blank while the bundle adopts markup nobody has been
 * shown, and the whole download is charged to the first paint.
 *
 * The entry keeps its early fetch, as a module preload, and loses its script
 * tag. An inline module in its place asks for the bundle one frame after the
 * first, which is the first frame the document can have been painted in and
 * the earliest the bundle can no longer hold it back.
 */
function paintFirst(html) {
  const entry = html.match(
    /^[ \t]*<script type="module" crossorigin src="([^"]+)"><\/script>\n/m,
  );
  if (!entry) throw new Error("prerender: the shell carries no module entry");
  const [tag, src] = entry;
  const preload = `    <link rel="modulepreload" crossorigin href="${src}" />\n`;
  const boot = `    <script type="module">requestAnimationFrame(() => requestAnimationFrame(() => import(${JSON.stringify(src)})))</script>\n`;
  return html.replace(tag, `${preload}${boot}`);
}

function head(route, meta) {
  const url = `${origin}${route === "/" ? "/" : route}`;
  const title = `${meta.title} | Dylan Jordan, RE/MAX Excellence`;
  return { url, title };
}

async function main() {
  const { routeMeta, areaMetaFor } = await loadConfig();
  const meta = {
    ...routeMeta,
    ...areaMeta(areaMetaFor),
    ...(await listingMeta()),
  };
  const template = paintFirst(
    await fs.readFile(path.join(dist, "index.html"), "utf8"),
  );
  let written = 0;

  for (const [route, entry] of Object.entries(meta)) {
    const { url, title } = head(route, entry);
    let html = template
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
      .replace(
        /<meta\s+name="description"[\s\S]*?\/>/,
        `<meta name="description" content="${escape(entry.description)}" />`,
      )
      .replace(
        /<link rel="canonical"[^>]*>/,
        `<link rel="canonical" href="${url}" />`,
      )
      .replace(
        /<meta property="og:url"[^>]*>/,
        `<meta property="og:url" content="${url}" />`,
      )
      .replace(
        /<meta\s+property="og:title"[\s\S]*?\/>/,
        `<meta property="og:title" content="${escape(title)}" />`,
      )
      .replace(
        /<meta\s+property="og:description"[\s\S]*?\/>/,
        `<meta property="og:description" content="${escape(entry.description)}" />`,
      )
      .replace(
        '<div id="root"></div>',
        `<div id="root">${shell(route, entry)}</div>`,
      );

    if (!html.includes('name="twitter:title"')) {
      html = html.replace(
        '<meta name="twitter:card" content="summary_large_image" />',
        `<meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="${escape(title)}" />\n    <meta name="twitter:description" content="${escape(entry.description)}" />`,
      );
    }

    // The contour texture is the home hero's alone. Preloaded on any other
    // route it is 28 KB fetched for nothing on the page and a warning in the
    // console once the browser notices nothing drew it.
    if (route !== "/") {
      html = html.replace(
        /(?:[ \t]*<!--(?:(?!-->)[\s\S])*?-->\n)?[ \t]*<link\s[^>]*?\/art\/terrain\.svg[^>]*?>\n\n?/,
        "",
      );
    }

    const target =
      route === "/"
        ? path.join(dist, "index.html")
        : path.join(dist, route.slice(1), "index.html");
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, html);
    written += 1;
  }

  console.log(`prerendered ${written} route(s)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
