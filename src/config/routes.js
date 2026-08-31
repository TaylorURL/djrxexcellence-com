/**
 * Every route the router mounts, as data.
 *
 * `scripts/sitemap.js` reads this file to build the sitemap, so a view that is
 * not mounted here is never published, and a route added here without a
 * component in `App.jsx` fails the build rather than shipping a dead link.
 */
export const routes = [
  { key: "home", path: "/", priority: 1, changefreq: "daily" },
  { key: "listings", path: "/listings", priority: 0.9, changefreq: "daily" },
  {
    key: "listingDetail",
    path: "/listings/:slug",
    expand: "listings",
    priority: 0.8,
    changefreq: "weekly",
  },
  { key: "areas", path: "/areas", priority: 0.8, changefreq: "monthly" },
  {
    key: "areaDetail",
    path: "/areas/:slug",
    expand: "areas",
    priority: 0.7,
    changefreq: "monthly",
  },
  { key: "compare", path: "/compare", sitemap: false },
  { key: "about", path: "/about", priority: 0.7, changefreq: "monthly" },
  { key: "contact", path: "/contact", priority: 0.7, changefreq: "monthly" },
  { key: "faq", path: "/faq", priority: 0.6, changefreq: "monthly" },
  { key: "privacy", path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { key: "terms", path: "/terms", priority: 0.3, changefreq: "yearly" },
  {
    key: "accessibility",
    path: "/accessibility",
    priority: 0.3,
    changefreq: "yearly",
  },
  {
    key: "fairHousing",
    path: "/fair-housing",
    priority: 0.4,
    changefreq: "yearly",
  },
  { key: "signIn", path: "/sign-in", sitemap: false },
  { key: "signUp", path: "/sign-up", sitemap: false },
  { key: "saved", path: "/saved", sitemap: false, guard: "member" },
  { key: "account", path: "/account", sitemap: false, guard: "member" },
  {
    key: "savedSearches",
    path: "/account/searches",
    sitemap: false,
    guard: "member",
  },
  {
    key: "questions",
    path: "/account/questions",
    sitemap: false,
    guard: "member",
  },
  { key: "dashboard", path: "/admin", sitemap: false, guard: "agent" },
  { key: "adminLeads", path: "/admin/leads", sitemap: false, guard: "agent" },
  {
    key: "adminComments",
    path: "/admin/comments",
    sitemap: false,
    guard: "agent",
  },
  {
    key: "adminTestimonials",
    path: "/admin/testimonials",
    sitemap: false,
    guard: "agent",
  },
  {
    key: "listingEditor",
    path: "/admin/listings/:id",
    sitemap: false,
    guard: "agent",
  },
  { key: "notFound", path: "*", sitemap: false },
];

export const sitemapRoutes = routes.filter((route) => route.sitemap !== false);
