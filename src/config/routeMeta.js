import { agent, brokerage, market } from "@/config/site";

/**
 * The title, description and opening line for every route that can be written
 * ahead of a request.
 *
 * Two things read this. `Seo` sets the head as a visitor moves between routes,
 * and `scripts/prerender.js` writes the same values into each route's HTML at
 * build time. Sharing one table is what keeps a crawler and a visitor reading
 * the same page: a social scraper never runs the bundle, so whatever the build
 * wrote is the whole of what it sees.
 *
 * A route whose title depends on data it has to fetch first is absent here, and
 * `Seo` is the only thing that sets it.
 */
export const routeMeta = {
  "/": {
    title: "Homes for Sale in Dayton, TX",
    heading: "Homes in Dayton, and seven towns either side of it.",
    description: `Buy and sell in Dayton, Texas and Liberty County with ${agent.name} of ${brokerage.name}. Search current listings, save your favorites, and find out what your home is worth.`,
  },
  "/listings": {
    title: "Listings",
    heading: "Every active listing, one place",
    description:
      "Search every active listing across Dayton, Liberty, Cleveland, Hardin, Crosby, Huffman, Mont Belvieu and Baytown, with map view, saved searches and side by side comparison.",
  },
  "/areas": {
    title: "Areas Served",
    heading: "Areas served",
    description:
      "Dayton, Liberty, Cleveland, Hardin, Crosby, Huffman, Mont Belvieu and Baytown: tax rates, insurance, MUD and HOA fees, school districts, and what the same price costs to own in each one.",
  },
  "/about": {
    title: `About ${agent.name}`,
    heading: `About ${agent.name}`,
    description: `${agent.name} represents buyers and sellers across ${market.county} and the towns around it, out of ${brokerage.name} in ${market.primary}.`,
  },
  "/contact": {
    title: "Contact",
    heading: "Get in touch",
    description: `Reach ${agent.name} at ${brokerage.name} in ${market.primary}. Buying, selling, or still deciding, send the question and get the next step back.`,
  },
  "/faq": {
    title: "Buyer and Seller FAQ",
    heading: "Buyer and seller questions",
    description:
      "Down payments, option periods, surveys, flood insurance, asking price and closing timelines, answered for Dayton and Liberty County.",
  },
  "/privacy": {
    title: "Privacy Policy",
    heading: "Privacy Policy",
    description:
      "What this site collects, why it collects it, how long it is kept, and how to have it deleted.",
  },
  "/terms": {
    title: "Terms of Use",
    heading: "Terms of Use",
    description:
      "The terms that apply to using this site, its listing information, its accounts and its comment threads.",
  },
  "/accessibility": {
    title: "Accessibility Statement",
    heading: "Accessibility Statement",
    description:
      "The accessibility standard this site is built to, what is known to fall short of it, and how to report a barrier.",
  },
  "/fair-housing": {
    title: "Fair Housing",
    heading: "Fair Housing",
    description:
      "The fair housing commitment this office operates under, what it means in practice, and where to file a complaint.",
  },
};

export function metaFor(path) {
  return routeMeta[path] ?? null;
}

/**
 * The head for one area page.
 *
 * The eight area pages are not listed in `routeMeta` because their text is
 * derived from `areas.js` rather than written out. `AreaDetail` and
 * `scripts/prerender.js` both call this rather than each composing the
 * sentence: when those two copies drifted, the build wrote one description
 * into the HTML and the bundle replaced it with another, so a crawler and a
 * visitor read different pages.
 */
export function areaMetaFor(area) {
  return {
    title: `${area.name}, TX Real Estate`,
    heading: `${area.name}, Texas`,
    description: `Homes for sale in ${area.name}, ${area.county}. ${area.schoolDistrict}, ZIP ${area.zips.join(" and ")}, the tax and insurance rates that set the monthly payment, and what to check before an offer goes in.`,
  };
}
