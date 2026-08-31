import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { routeMeta } from "../src/config/routeMeta.js";
import { sitemapRoutes } from "../src/config/routes.js";
import { areas } from "../src/data/areas.js";

const dist = path.join(process.cwd(), "dist");
const built = fs.existsSync(path.join(dist, "index.html"));

const documentFor = (route) =>
  route === "/"
    ? path.join(dist, "index.html")
    : path.join(dist, route.slice(1), "index.html");

/**
 * Read back from the sitemap the build wrote rather than derived from the route
 * config, because the listing routes are only knowable from the database and a
 * check that cannot see them cannot guard them. This is the set a crawler is
 * actually told to fetch.
 */
const sitemapFile = path.join(process.cwd(), "public", "sitemap.xml");
const published = fs.existsSync(sitemapFile)
  ? [...fs.readFileSync(sitemapFile, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((match) => match[1].replace("https://djrxexcellence.com", ""))
      .map((route) => route || "/")
  : sitemapRoutes.flatMap((route) =>
      route.expand === "areas"
        ? areas.map((area) => route.path.replace(":slug", area.slug))
        : [route.path],
    );

/**
 * A crawler reads what the build wrote and never runs the bundle, so these
 * assertions are the only thing standing between a change to the prerender and
 * ten routes quietly sharing the home page's card again.
 */
describe.skipIf(!built)("prerendered routes", () => {
  for (const [route, meta] of Object.entries(routeMeta)) {
    const file =
      route === "/"
        ? path.join(dist, "index.html")
        : path.join(dist, route.slice(1), "index.html");

    it(`${route} carries its own head and first screen`, () => {
      const html = fs.readFileSync(file, "utf8");
      const url = `https://djrxexcellence.com${route}`;

      expect(html).toContain(`<link rel="canonical" href="${url}" />`);
      expect(html).toContain(`content="${url}"`);
      expect(html).toContain(meta.description);
      expect(html).toMatch(/<title>[^<]+<\/title>/);
      expect(html).toContain('id="prerender"');
      expect(html).toContain(`<h1>`);
    });
  }

  it("gives every route a title of its own", () => {
    const titles = Object.keys(routeMeta).map((route) => {
      const file =
        route === "/"
          ? path.join(dist, "index.html")
          : path.join(dist, route.slice(1), "index.html");
      return fs.readFileSync(file, "utf8").match(/<title>([^<]+)<\/title>/)[1];
    });
    expect(new Set(titles).size).toBe(titles.length);
  });
});

/**
 * A published URL with no document of its own falls through the rewrite to
 * `dist/index.html` and answers with the home page's canonical, which makes it
 * a duplicate of the home page rather than a page in its own right.
 */
describe.skipIf(!built)("every sitemap URL is a document of its own", () => {
  for (const route of published) {
    it(`${route} canonicalises to itself`, () => {
      const file = documentFor(route);
      expect(fs.existsSync(file)).toBe(true);
      expect(fs.readFileSync(file, "utf8")).toContain(
        `<link rel="canonical" href="https://djrxexcellence.com${route}" />`,
      );
    });
  }
});
