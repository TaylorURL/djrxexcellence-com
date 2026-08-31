import { describe, expect, it } from "vitest";
import {
  communityMonthly,
  compareCommunities,
  costSegments,
  costSpread,
  costViews,
  districtMonthly,
  viewByKey,
} from "@/lib/carryingCost";
import { duesRange } from "@/lib/format";
import { communityCosts, costsBySlug } from "@/data/carryingCosts";
import { areas } from "@/data/areas";
import { monthlyPrincipalAndInterest } from "@/lib/mortgage";

const inputs = { homePrice: 300000, downPercent: 20, rate: 6.5, years: 30 };

describe("the cost data", () => {
  it("covers every town the site has a page for", () => {
    expect(communityCosts.map((entry) => entry.slug).sort()).toEqual(
      areas.map((area) => area.slug).sort(),
    );
  });

  it("carries a rate, an insurance figure and a district to verify against", () => {
    for (const entry of communityCosts) {
      expect(entry.taxRate).toBeGreaterThan(0);
      expect(entry.insuranceRate).toBeGreaterThan(0);
      expect(entry.taxingUnits.length).toBeGreaterThan(0);
      expect(entry.verify.url).toMatch(/^https:\/\//);
    }
  });
});

describe("communityMonthly", () => {
  it("adds the town's tax and insurance rates to the loan payment", () => {
    const entry = costsBySlug("dayton");
    const row = communityMonthly({ ...inputs, entry, districts: "none" });

    expect(row.loan).toBeCloseTo(
      monthlyPrincipalAndInterest(240000, 6.5, 30),
      6,
    );
    expect(row.taxes).toBeCloseTo((300000 * 0.0142) / 12, 6);
    expect(row.insurance).toBeCloseTo((300000 * 0.0125) / 12, 6);
    expect(row.districts).toBe(0);
    expect(row.total).toBeCloseTo(row.loan + row.taxes + row.insurance, 6);
  });

  it("charges nothing for districts a town does not have", () => {
    const hardin = costsBySlug("hardin");
    expect(districtMonthly(hardin, 300000, "typical").total).toBe(0);
  });

  it("charges more for a new subdivision than for the town's middle", () => {
    const cleveland = costsBySlug("cleveland");
    const typical = districtMonthly(cleveland, 300000, "typical").total;
    const high = districtMonthly(cleveland, 300000, "high").total;

    expect(typical).toBeGreaterThan(0);
    expect(high).toBeGreaterThan(typical);
  });
});

describe("compareCommunities", () => {
  it("costs every town and sorts them cheapest first", () => {
    const rows = compareCommunities(inputs);

    expect(rows).toHaveLength(areas.length);
    for (let i = 1; i < rows.length; i += 1) {
      expect(rows[i].total).toBeGreaterThanOrEqual(rows[i - 1].total);
    }
  });

  it("names each town from the area data rather than the slug", () => {
    const dayton = compareCommunities(inputs).find(
      (row) => row.slug === "dayton",
    );
    expect(dayton.name).toBe("Dayton");
    expect(dayton.schoolDistrict).toBe("Dayton ISD");
  });

  it("reports the gap between the cheapest and dearest town", () => {
    const rows = compareCommunities(inputs);
    const spread = costSpread(rows);

    expect(spread.monthly).toBeCloseTo(
      rows[rows.length - 1].total - rows[0].total,
      6,
    );
    expect(spread.annual).toBeCloseTo(spread.monthly * 12, 6);
  });
});

describe("the chart segments", () => {
  it("account for the whole total, so a stacked bar cannot lose a part", () => {
    const entry = costsBySlug("cleveland");
    const row = communityMonthly({ ...inputs, entry });
    const summed = costSegments.reduce((sum, seg) => sum + row[seg.key], 0);

    expect(summed).toBeCloseTo(row.total, 6);
  });
});

describe("the two chart views", () => {
  it("drops the loan payment from what the town adds", () => {
    const view = viewByKey("town");
    expect(view.segments.map((segment) => segment.key)).toEqual([
      "taxes",
      "insurance",
      "districts",
    ]);
  });

  it("falls back to the full payment for an unknown key", () => {
    expect(viewByKey("nonsense")).toBe(costViews[0]);
  });

  it("separates the towns further than the full payment does", () => {
    const full = compareCommunities(inputs, "total");
    const town = compareCommunities(inputs, "townCost");

    const fullGap = costSpread(full, "total").monthly;
    const townGap = costSpread(town, "townCost").monthly;

    // The same dollars either way. The gap is a larger share of a smaller bar,
    // which is the whole reason the second view exists.
    expect(townGap).toBeCloseTo(fullGap, 6);
    expect(townGap / town[0].townCost).toBeGreaterThan(fullGap / full[0].total);
  });

  it("sorts by whichever figure the view measures", () => {
    const town = compareCommunities(inputs, "townCost");
    for (let i = 1; i < town.length; i += 1) {
      expect(town[i].townCost).toBeGreaterThanOrEqual(town[i - 1].townCost);
    }
  });
});

describe("duesRange", () => {
  it("reads a zero floor as an absence rather than a figure", () => {
    expect(duesRange({ monthlyLow: 0, monthlyHigh: 30 })).toBe("Up to $30");
    expect(duesRange({ monthlyLow: 25, monthlyHigh: 60 })).toBe("$25 to $60");
    expect(duesRange({ monthlyLow: 0, monthlyHigh: 0 })).toBe("None");
  });
});
