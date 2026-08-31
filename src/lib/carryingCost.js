import { monthlyPrincipalAndInterest, nonNegative } from "@/lib/mortgage";
import {
  communityCosts,
  costsBySlug,
  mudAddOn,
  pidAddOn,
} from "@/data/carryingCosts";
import { areaBySlug } from "@/data/areas";

/**
 * The parts of a monthly payment, in the order they stack in the chart.
 *
 * The order runs from the part a lender sets to the parts a community sets,
 * so the segments that differ between two towns sit together at one end of
 * the bar rather than either side of the loan payment.
 */
export const costSegments = [
  { key: "loan", label: "Principal and Interest", tone: "loan" },
  { key: "taxes", label: "Property Taxes", tone: "taxes" },
  { key: "insurance", label: "Insurance", tone: "insurance" },
  { key: "districts", label: "MUD, PID and HOA", tone: "districts" },
];

/**
 * The two things a bar can measure.
 *
 * A loan payment is the same in every town at the same price, so it takes up
 * most of every bar and flattens the difference the chart exists to show.
 * `town` drops it and measures only what the address adds, which is the part
 * that actually varies. Both axes still start at zero.
 */
export const costViews = [
  {
    key: "full",
    label: "Full Payment",
    total: "total",
    segments: costSegments,
  },
  {
    key: "town",
    label: "What The Town Adds",
    total: "townCost",
    segments: costSegments.filter((segment) => segment.key !== "loan"),
  },
];

export function viewByKey(key) {
  return costViews.find((view) => view.key === key) ?? costViews[0];
}

/** Midpoint of a low/high band, used where a single figure has to stand in. */
function midpoint(low, high) {
  return (nonNegative(low) + nonNegative(high)) / 2;
}

/**
 * The monthly district charge for a town at a given level of exposure.
 *
 * `districts` is what separates two identical houses in the same town, so it
 * is modelled at three levels rather than as one number: `none` for a tract
 * carrying nothing, `typical` for the middle of what the town actually
 * builds, and `high` for a new subdivision carrying a MUD, a PID and an
 * association at once.
 */
export function districtMonthly(entry, homePrice, level = "typical") {
  if (!entry || level === "none") return { mud: 0, pid: 0, hoa: 0, total: 0 };

  const value = nonNegative(homePrice);
  const weight = { common: 1, some: 0.5, rare: 0 };
  const share = level === "high" ? 1 : (weight[entry.mud] ?? 0);
  const pidShare = level === "high" ? 1 : (weight[entry.pid] ?? 0);
  const hoaShare = level === "high" ? 1 : (weight[entry.hoa.prevalence] ?? 0);

  const mudRate =
    level === "high" ? mudAddOn.high : midpoint(mudAddOn.low, mudAddOn.high);
  const mud = (value * (mudRate / 100) * share) / 12;

  const pidAnnual =
    level === "high"
      ? pidAddOn.annualHigh
      : midpoint(pidAddOn.annualLow, pidAddOn.annualHigh);
  const pid = (pidAnnual * pidShare) / 12;

  const hoa =
    (level === "high"
      ? entry.hoa.monthlyHigh
      : midpoint(entry.hoa.monthlyLow, entry.hoa.monthlyHigh)) * hoaShare;

  return { mud, pid, hoa, total: mud + pid + hoa };
}

/**
 * The monthly cost of one town at one price.
 *
 * Taxes and insurance are rates on the price rather than figures a buyer types
 * in, which is the whole point of the comparison: the same price carries a
 * different bill in each town.
 */
export function communityMonthly({
  entry,
  homePrice,
  downPercent,
  rate,
  years = 30,
  districts = "typical",
}) {
  const value = nonNegative(homePrice);
  const down = (value * nonNegative(downPercent)) / 100;
  const loan = Math.max(value - down, 0);

  const principalAndInterest = monthlyPrincipalAndInterest(
    loan,
    nonNegative(rate),
    nonNegative(years),
  );
  const taxes = (value * (nonNegative(entry.taxRate) / 100)) / 12;
  const insurance = (value * (nonNegative(entry.insuranceRate) / 100)) / 12;
  const district = districtMonthly(entry, value, districts);

  const townCost = taxes + insurance + district.total;

  return {
    slug: entry.slug,
    loan: principalAndInterest,
    taxes,
    insurance,
    districts: district.total,
    breakdown: district,
    townCost,
    total: principalAndInterest + townCost,
  };
}

/**
 * Every town costed at one set of inputs, cheapest first.
 *
 * The name comes from `areas.js` rather than being repeated here, so a town
 * renamed there cannot end up spelled two ways on one page.
 */
export function compareCommunities(inputs, sortBy = "total") {
  return communityCosts
    .map((entry) => {
      const area = areaBySlug(entry.slug);
      return {
        ...communityMonthly({ ...inputs, entry }),
        entry,
        name: area?.name ?? entry.slug,
        county: area?.county ?? "",
        schoolDistrict: area?.schoolDistrict ?? "",
      };
    })
    .sort((a, b) => a[sortBy] - b[sortBy]);
}

/**
 * The spread the chart reports above itself.
 *
 * The gap between the cheapest and dearest town at one price is the figure
 * that makes the case, and it is worth stating in dollars a year rather than
 * leaving a reader to subtract two bars.
 */
export function costSpread(rows, field = "total") {
  if (rows.length < 2) return null;
  const cheapest = rows[0];
  const dearest = rows[rows.length - 1];
  const monthly = dearest[field] - cheapest[field];
  return { cheapest, dearest, monthly, annual: monthly * 12 };
}

export { costsBySlug };
