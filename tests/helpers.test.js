import { describe, expect, it } from "vitest";
import { buildThread } from "@/services/comments";
import {
  describeFilters,
  paramsToFilters,
  paramsToRecord,
  recordToParams,
} from "@/lib/listingFilters";
import {
  agentPhone,
  contactPhone,
  officePhone,
  phoneLines,
  resolved,
  socialLinks,
} from "@/config/site";
import { areaByCity, areaBySlug, areas } from "@/data/areas";
import { routes, sitemapRoutes } from "@/config/routes";
import { listingSchema, breadcrumbSchema } from "@/lib/schema";
import { price, number, address } from "@/lib/format";

describe("buildThread", () => {
  it("nests replies under their parent", () => {
    const thread = buildThread([
      { id: "a", parent_id: null },
      { id: "b", parent_id: "a" },
      { id: "c", parent_id: "b" },
      { id: "d", parent_id: null },
    ]);

    expect(thread.map((node) => node.id)).toEqual(["a", "d"]);
    expect(thread[0].replies[0].id).toBe("b");
    expect(thread[0].replies[0].replies[0].id).toBe("c");
    expect(thread[1].replies).toEqual([]);
  });

  it("keeps a reply whose parent is not in the set as a root", () => {
    const thread = buildThread([{ id: "orphan", parent_id: "missing" }]);
    expect(thread.map((node) => node.id)).toEqual(["orphan"]);
  });
});

describe("listing filters", () => {
  it("reads numbers from search params and drops junk", () => {
    const params = new URLSearchParams(
      "q=oak&city=Dayton&min=abc&max=400000&beds=3",
    );
    const filters = paramsToFilters(params);

    expect(filters.search).toBe("oak");
    expect(filters.city).toBe("Dayton");
    expect(filters.minPrice).toBeUndefined();
    expect(filters.maxPrice).toBe(400000);
    expect(filters.minBeds).toBe(3);
  });

  it("round trips a saved search record", () => {
    const params = new URLSearchParams("city=Liberty&beds=4&sort=price_asc");
    const record = paramsToRecord(params);

    expect(record).toEqual({ city: "Liberty", beds: "4", sort: "price_asc" });
    expect(recordToParams(record).toString()).toBe(
      "city=Liberty&beds=4&sort=price_asc",
    );
  });

  it("describes a record without leaking the sort key", () => {
    expect(describeFilters({ city: "Dayton", beds: "3", sort: "newest" })).toBe(
      "Area Dayton, Beds 3",
    );
    expect(describeFilters({})).toBe("Every listing");
  });
});

describe("site config placeholders", () => {
  it("treats an unfilled token as absent", () => {
    expect(resolved("AGENT_EMAIL")).toBeNull();
    expect(resolved("SOCIAL_FACEBOOK_URL")).toBeNull();
    expect(resolved("")).toBeNull();
    expect(resolved("dylan@example.com")).toBe("dylan@example.com");
  });

  it("publishes only social links that have a real URL", () => {
    socialLinks.forEach((entry) => {
      expect(entry.url).toMatch(/^https?:\/\//);
    });
  });
});

describe("areas", () => {
  it("gives every area a slug, district and coordinates", () => {
    areas.forEach((area) => {
      expect(area.slug).toMatch(/^[a-z-]+$/);
      expect(area.schoolDistrict).toBeTruthy();
      expect(area.zips.length).toBeGreaterThan(0);
      expect(Number.isFinite(area.center.lat)).toBe(true);
      expect(Number.isFinite(area.center.lng)).toBe(true);
    });
  });

  it("looks an area up by slug and by city name", () => {
    expect(areaBySlug("dayton").name).toBe("Dayton");
    expect(areaByCity("  dayton ").slug).toBe("dayton");
    expect(areaBySlug("nowhere")).toBeNull();
    expect(areaByCity("")).toBeNull();
  });
});

describe("routes", () => {
  it("keeps every key unique", () => {
    const keys = routes.map((route) => route.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("keeps private routes out of the sitemap", () => {
    const paths = sitemapRoutes.map((route) => route.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/fair-housing");
    expect(paths).not.toContain("/admin");
    expect(paths).not.toContain("/account");
    expect(paths).not.toContain("*");
  });

  it("gives every dynamic route in the sitemap something to expand from", () => {
    // A `:param` path is only publishable because the sitemap script knows
    // where its values come from. One without an expansion would be written
    // into sitemap.xml with the placeholder still in it.
    sitemapRoutes
      .filter((route) => route.path.includes(":"))
      .forEach((route) => {
        expect(
          route.expand,
          `${route.path} declares no expansion`,
        ).toBeTruthy();
      });
  });
});

describe("schema", () => {
  const listing = {
    id: "1",
    slug: "123-oak",
    title: "123 Oak St",
    status: "active",
    price: 325000,
    street_address: "123 Oak St",
    city: "Dayton",
    state: "TX",
    zip: "77535",
    beds: 3,
    baths: 2,
    square_feet: 1850,
    year_built: 2015,
  };

  it("builds an offer only when there is a price", () => {
    expect(listingSchema(listing).offers.price).toBe(325000);
    expect(listingSchema({ ...listing, price: null }).offers).toBeUndefined();
  });

  it("marks a sold listing as unavailable", () => {
    expect(
      listingSchema({ ...listing, status: "sold" }).offers.availability,
    ).toBe("https://schema.org/SoldOut");
  });

  it("numbers breadcrumb positions from one", () => {
    const crumbs = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Listings", path: "/listings" },
    ]);
    expect(crumbs.itemListElement.map((item) => item.position)).toEqual([1, 2]);
  });
});

describe("format", () => {
  it("falls back when a listing has no price", () => {
    expect(price(325000)).toBe("$325,000");
    expect(price(null)).toBe("Call for price");
    expect(number(null)).toBe("—");
  });

  it("joins an address without stray separators", () => {
    expect(
      address({
        streetAddress: "123 Oak St",
        city: "Dayton",
        state: "TX",
        zip: "77535",
      }),
    ).toBe("123 Oak St Dayton, TX 77535");
    expect(address(null)).toBe("");
  });
});

describe("the numbers a caller is given", () => {
  it("ends on the office line, whether or not the cell is filled", () => {
    expect(phoneLines.at(-1)).toEqual({
      key: "office",
      label: "Office",
      number: officePhone,
    });
  });

  it("puts the cell first when there is one, and only then", () => {
    expect(phoneLines[0].number).toBe(contactPhone);
    expect(phoneLines).toHaveLength(agentPhone ? 2 : 1);
    if (agentPhone) expect(phoneLines[0].key).toBe("direct");
  });

  it("never prints an unfilled placeholder as a number", () => {
    for (const line of phoneLines) {
      expect(line.number).toMatch(/\d/);
      expect(resolved(line.number)).toBe(line.number);
    }
  });
});
