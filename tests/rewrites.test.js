import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { routes } from "@/config/routes";

const config = JSON.parse(
  readFileSync(join(process.cwd(), "vercel.json"), "utf8"),
);

// `app.html` rather than `index.html`. index.html is the home page, so naming
// it here served the home document - its canonical, its card, and its hero's
// two high-priority image preloads - to Compare, to the sign-in pages, to every
// member and agent page, and to every URL with no page at all. app.html is the
// same shell with the hero's hints and the home page's claims taken out.
const spaRewrite = config.rewrites.find(
  (rewrite) => rewrite.destination === "/app.html",
);

const matches = new RegExp(`^${spaRewrite.source}$`);

// A path the rewrite swallows is answered with the shell and a 200, whatever
// the file was. For a build asset that means an HTML body under a JavaScript
// MIME type, which is an uncaught TypeError rather than a load failure the
// browser can recover from on the next reload.
const servedFromDisk = [
  "/assets/index-DkQ1x2.js",
  "/assets/index-DkQ1x2.css",
  "/fonts/worksans-latin-var.woff2",
  "/agent/dylan-jordan.webp",
  "/art/house.svg",
  "/brand/remax-logo.svg",
  "/favicon.svg",
  "/icon-192.png",
  "/social-card.png",
  "/robots.txt",
  "/sitemap.xml",
  "/site.webmanifest",
  "/release.json",
];

describe("the single-page rewrite", () => {
  it("routes every path the router serves to the shell", () => {
    const paths = routes
      .filter((route) => route.path !== "*")
      .map((route) => route.path.replace(/:[a-zA-Z]+/g, "sample-value"));

    for (const path of paths) {
      expect(matches.test(path), path).toBe(true);
    }
  });

  it("routes a path the router does not know to the shell", () => {
    expect(matches.test("/no-such-page")).toBe(true);
  });

  it("leaves static files to the filesystem", () => {
    for (const path of servedFromDisk) {
      expect(matches.test(path), path).toBe(false);
    }
  });
});
