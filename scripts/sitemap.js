import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sitemapRoutes } from "../src/config/routes.js";
import { areas } from "../src/data/areas.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const SITE = "https://djrxexcellence.com";
const today = new Date().toISOString().slice(0, 10);

/**
 * Reads the slug of every published listing, newest first.
 *
 * A listing page exists because a row was published, so the set cannot be known
 * from the file tree the way the area pages can. Only published rows are
 * readable with the publishable key, which is the same fence the site itself
 * sits behind, so the query cannot leak a draft into the sitemap.
 *
 * A build without credentials is the local case, and it writes the static
 * routes rather than failing: the deploy that matters runs on Vercel, where
 * both values are set.
 */
async function publishedListings() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("sitemap: no Supabase credentials, listing pages omitted");
    return [];
  }
  const { data, error } = await createClient(url, key)
    .from("listings")
    .select("slug, updated_at")
    .not("published_at", "is", null)
    .order("updated_at", { ascending: false });
  if (error) {
    console.warn(`sitemap: listings unreadable (${error.message})`);
    return [];
  }
  return data ?? [];
}

const listings = await publishedListings();
const lastmodBySlug = new Map(
  listings.map((row) => [row.slug, (row.updated_at ?? today).slice(0, 10)]),
);

const expansions = {
  areas: areas.map((area) => area.slug),
  listings: listings.map((row) => row.slug),
};

function expand(route) {
  if (!route.expand) return [route.path];
  const values = expansions[route.expand] ?? [];
  return values.map((value) => route.path.replace(/:[a-zA-Z]+/, value));
}

const entries = sitemapRoutes.flatMap((route) =>
  expand(route).map((path) => ({
    loc: `${SITE}${path === "/" ? "/" : path}`,
    priority: route.priority ?? 0.5,
    changefreq: route.changefreq ?? "monthly",
    // A listing carries the date its row last moved. Everything else is a
    // static document, so it is as fresh as the build that wrote it.
    lastmod: lastmodBySlug.get(path.split("/").pop()) ?? today,
  })),
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync(join(PUBLIC, "sitemap.xml"), sitemap);

const llms = `# Dylan Jordan, RE/MAX Excellence

> Real estate agent serving Dayton, Texas and Liberty County. Buyers and sellers
> search listings, save homes and searches, ask questions on a listing, and
> request a valuation. Version ${pkg.version}.

## Market

Dayton and Liberty, Texas in Liberty County; Cleveland and Hardin in the north
of the same county; Crosby and Huffman in Harris County; Mont Belvieu in
Chambers County; and Baytown across Harris and Chambers. Listings come through
the Houston Association of REALTORS.

## Pages

${entries.map((entry) => `- ${entry.loc}`).join("\n")}

## Listings

Individual listings live under ${SITE}/listings/{slug} and are linked from
${SITE}/listings. They are published from the agent dashboard, so the set
changes between builds; every one published at build time is listed above and
in sitemap.xml.

## Contact

RE/MAX Excellence, 605 West Clayton Ste A, Dayton, TX 77535. Office 936-340-2300.

## Notes

Listing data is deemed reliable but not guaranteed and should be independently
verified. Equal Housing Opportunity.
`;

writeFileSync(join(PUBLIC, "llms.txt"), llms);

console.log(
  `sitemap: ${entries.length} urls (${listings.length} listings), llms.txt written`,
);
