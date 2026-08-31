/**
 * What it costs to carry a house in each town, beyond the price.
 *
 * Two houses listed at the same number do not cost the same to own here. The
 * tax rate is set by whichever units happen to tax the address, a municipal
 * utility district adds its own rate on top of those, windstorm and flood are
 * separate policies near the bay, and an HOA bills on its own schedule. This
 * file holds the figures that drive the comparison chart.
 *
 * Every rate is an estimate for a homesteaded primary residence and is stated
 * as a percentage of the purchase price, which is the form a monthly payment
 * needs. The appraisal district sets the real number for a real address, and
 * `verify` on each entry names the district that publishes it.
 */

/** The rate the chart opens on, and where it came from. */
export const rateSurvey = {
  thirtyYearFixed: 6.66,
  asOf: "August 27, 2026",
  source: "Freddie Mac Primary Mortgage Market Survey",
  sourceUrl: "https://www.freddiemac.com/pmms",
};

/**
 * The statewide premium the per-town insurance rates are scaled from.
 *
 * A rate rather than a flat figure, because the premium tracks what it would
 * cost to rebuild rather than what the house sold for.
 */
export const insuranceBenchmark = {
  annualPremium: 4085,
  dwellingCoverage: 300000,
  asOf: "2026",
  source: "Insurify, Texas home insurance averages",
  sourceUrl: "https://insurify.com/homeowners-insurance/texas/",
};

/**
 * What a municipal utility district costs on top of the ordinary rate.
 *
 * A MUD borrows to put in the water, sewer and drainage a new subdivision
 * needs, then levies its own rate until that debt is repaid. The rate falls as
 * the district builds out and the debt is paid down, so the same subdivision
 * is dearer to buy into early than late. Chambers County MUD #1 adopted
 * 0.56 per $100 for 2024, which is the top of this band.
 */
export const mudAddOn = { low: 0.25, high: 0.6 };

/**
 * A public improvement district, the other line a new subdivision carries.
 *
 * It assesses against the lot rather than taxing the value, so it is billed as
 * a fixed amount per year and does not fall as the market moves.
 */
export const pidAddOn = { annualLow: 400, annualHigh: 1400 };

const LIBERTY_CAD = {
  label: "Liberty County Appraisal District",
  url: "https://libertycad.com/",
};

const HARRIS_CAD = {
  label: "Harris Central Appraisal District",
  url: "https://hcad.org/",
};

const CHAMBERS_CAD = {
  label: "Chambers County Appraisal District",
  url: "https://www.chamberscad.org/",
};

/**
 * How common a district or association is in a town.
 *
 * `common` means most of what is being built there now carries one, `some`
 * means it depends which subdivision, and `rare` means it is the exception.
 */
export const prevalenceLabel = {
  common: "Common",
  some: "Some subdivisions",
  rare: "Rare",
};

export const communityCosts = [
  {
    slug: "dayton",
    taxRate: 1.42,
    taxingUnits: [
      "Liberty County",
      "City of Dayton",
      "Dayton ISD",
      "Liberty County ESD",
    ],
    taxNote:
      "The city rate applies inside the limit and drops off outside it, which is a real difference between two tracts a mile apart.",
    mud: "common",
    pid: "some",
    hoa: { prevalence: "some", monthlyLow: 25, monthlyHigh: 60 },
    insuranceRate: 1.25,
    insuranceNote:
      "Far enough inland that wind and hail stay on the ordinary policy. Flood is separate wherever the tract sits in a mapped zone.",
    verify: LIBERTY_CAD,
  },
  {
    slug: "liberty",
    taxRate: 1.46,
    taxingUnits: [
      "Liberty County",
      "City of Liberty",
      "Liberty ISD",
      "Liberty County ESD",
    ],
    taxNote:
      "An older tax base and little new district debt, so the rate moves less year to year than it does in the towns building out.",
    mud: "rare",
    pid: "rare",
    hoa: { prevalence: "rare", monthlyLow: 0, monthlyHigh: 40 },
    insuranceRate: 1.3,
    insuranceNote:
      "The Trinity River floodplain reaches closer to town than most buyers expect, and flood coverage is priced off the zone rather than the street.",
    verify: LIBERTY_CAD,
  },
  {
    slug: "mont-belvieu",
    taxRate: 1.48,
    taxingUnits: [
      "Chambers County",
      "City of Mont Belvieu",
      "Barbers Hill ISD",
      "Chambers County Public Hospital District",
      "Lee College",
    ],
    taxNote:
      "The plants along the ship channel carry a large share of the base, and both the city and the county grant a 20 percent homestead exemption on top of the state one. The rate on paper is high and the bill on a homesteaded house is not.",
    mud: "some",
    pid: "rare",
    hoa: { prevalence: "common", monthlyLow: 40, monthlyHigh: 110 },
    insuranceRate: 1.6,
    insuranceNote:
      "Chambers County is a designated windstorm county, so wind and hail can come off the main policy and onto a separate one with a percentage deductible.",
    verify: CHAMBERS_CAD,
  },
  {
    slug: "baytown",
    taxRate: 1.72,
    taxingUnits: [
      "Harris County",
      "City of Baytown",
      "Goose Creek CISD",
      "Lee College",
      "Harris County Flood Control",
    ],
    taxNote:
      "Three school districts touch the city, and the rate follows the one the address actually falls in rather than the one down the road.",
    mud: "some",
    pid: "rare",
    hoa: { prevalence: "some", monthlyLow: 30, monthlyHigh: 90 },
    insuranceRate: 1.65,
    insuranceNote:
      "Wind and flood are quoted separately near the bay, and the two together can run past the tax bill.",
    verify: HARRIS_CAD,
  },
  {
    slug: "crosby",
    taxRate: 1.65,
    taxingUnits: [
      "Harris County",
      "Crosby ISD",
      "Harris County Flood Control",
      "Harris County ESD",
      "Lee College",
    ],
    taxNote:
      "No city rate, because the area is unincorporated. Harris County services and the district rates are what make up the bill.",
    mud: "common",
    pid: "some",
    hoa: { prevalence: "some", monthlyLow: 25, monthlyHigh: 75 },
    insuranceRate: 1.35,
    insuranceNote:
      "Inland rating on the main policy. An acreage tract prices partly on how far it sits from a fire station.",
    verify: HARRIS_CAD,
  },
  {
    slug: "huffman",
    taxRate: 1.34,
    taxingUnits: [
      "Harris County",
      "Huffman ISD",
      "Harris County Flood Control",
      "Harris County ESD",
      "Lone Star College",
    ],
    taxNote:
      "Unincorporated, with no city rate and a school rate at the low end of the three counties.",
    mud: "some",
    pid: "rare",
    hoa: { prevalence: "some", monthlyLow: 20, monthlyHigh: 70 },
    insuranceRate: 1.4,
    insuranceNote:
      "Lake Houston has a flood history, and a bulkhead or a pier is worth pricing into the quote before the offer goes in.",
    verify: HARRIS_CAD,
  },
  {
    slug: "cleveland",
    taxRate: 1.5,
    taxingUnits: [
      "Liberty County",
      "City of Cleveland",
      "Cleveland ISD",
      "Liberty County ESD",
    ],
    taxNote:
      "The fastest-growing district in the county, and the new subdivisions north of town are where the added district rates show up first.",
    mud: "common",
    pid: "common",
    hoa: { prevalence: "common", monthlyLow: 30, monthlyHigh: 80 },
    insuranceRate: 1.25,
    insuranceNote:
      "Inland rating. Distance to a fire station and the age of the roof move this figure more than the address does.",
    verify: LIBERTY_CAD,
  },
  {
    slug: "hardin",
    taxRate: 1.44,
    taxingUnits: ["Liberty County", "Hardin ISD", "Liberty County ESD"],
    taxNote:
      "No city rate. An agricultural exemption changes the bill on a larger tract, and losing it changes the bill back.",
    mud: "rare",
    pid: "rare",
    hoa: { prevalence: "rare", monthlyLow: 0, monthlyHigh: 30 },
    insuranceRate: 1.3,
    insuranceNote:
      "Rural rating, where the distance to the nearest fire station is what the carrier prices off.",
    verify: LIBERTY_CAD,
  },
];

export function costsBySlug(slug) {
  return communityCosts.find((entry) => entry.slug === slug) ?? null;
}
