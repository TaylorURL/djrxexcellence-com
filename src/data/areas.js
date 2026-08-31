export const areas = [
  {
    slug: "dayton",
    name: "Dayton",
    county: "Liberty County",
    zips: ["77535"],
    schoolDistrict: "Dayton ISD",
    center: { lat: 30.0466, lng: -94.8858 },
    summary:
      "The seat of the market Dylan works every day. Dayton sits on US-90 about thirty-five miles east of downtown Houston, close enough to commute and far enough out that an acre is still an ordinary thing to own.",
    highlights: [
      "New construction subdivisions on the west side and older acreage tracts north of US-90",
      "Grand Parkway access shortens the drive to Baytown, Crosby and the Houston job centers",
      "Dayton ISD serves the city and a wide band of the surrounding county",
    ],
    lookFor: [
      "Flood zone and elevation certificate, which change the insurance quote",
      "Whether the tract is on city water and sewer or on a well and septic system",
      "MUD district and the tax rate that comes with it on newer subdivisions",
    ],
  },
  {
    slug: "liberty",
    name: "Liberty",
    county: "Liberty County",
    zips: ["77575"],
    schoolDistrict: "Liberty ISD",
    center: { lat: 30.0577, lng: -94.7955 },
    summary:
      "The county seat, on the Trinity River and US-90. Older housing stock near the courthouse square, larger lots as you move out toward the river bottom and the farm roads.",
    highlights: [
      "County offices, courthouse and hospital are all in town",
      "Historic homes near the square alongside newer builds on the outskirts",
      "Liberty ISD, with Hardin ISD picking up the northern edge of the area",
    ],
    lookFor: [
      "Trinity River floodplain boundaries, which run closer to town than people expect",
      "Age of the roof and the electrical panel on the older stock near the square",
      "Survey status when fences and outbuildings sit near a property line",
    ],
  },
  {
    slug: "mont-belvieu",
    name: "Mont Belvieu",
    county: "Chambers County",
    zips: ["77523", "77580"],
    schoolDistrict: "Barbers Hill ISD",
    center: { lat: 29.8486, lng: -94.888 },
    summary:
      "Chambers County, built around the salt dome storage and the petrochemical work along the ship channel. Barbers Hill ISD is the reason most buyers start here, and it prices accordingly.",
    highlights: [
      "Barbers Hill ISD draws buyers from well outside the district boundary",
      "Short drive to the Baytown and Mont Belvieu plants along SH 146 and I-10",
      "Newer master-planned neighborhoods with sidewalks, parks and HOA amenities",
    ],
    lookFor: [
      "The district boundary itself, which does not follow the city limit",
      "HOA dues and what they actually cover before the offer goes in",
      "MUD tax on the newer sections, added on top of the school and county rates",
    ],
  },
  {
    slug: "baytown",
    name: "Baytown",
    county: "Harris and Chambers Counties",
    zips: ["77520", "77521", "77523"],
    schoolDistrict: "Goose Creek CISD",
    center: { lat: 29.7355, lng: -94.9774 },
    summary:
      "On Galveston Bay at the mouth of the ship channel, with I-10 and SH 146 meeting in the middle of it. A large, varied market: mid-century neighborhoods near the bay, newer subdivisions pushing north.",
    highlights: [
      "Refinery and plant work concentrated along the channel and the bay",
      "Goose Creek CISD across most of the city, with pockets in neighboring districts",
      "Everything from bay-front older homes to new construction north of I-10",
    ],
    lookFor: [
      "Windstorm and flood coverage, which are separate policies near the bay",
      "Foundation history on the older slab-on-grade stock",
      "Which school district a specific address falls in, since three of them touch the city",
    ],
  },
  {
    slug: "crosby",
    name: "Crosby",
    county: "Harris County",
    zips: ["77532"],
    schoolDistrict: "Crosby ISD",
    center: { lat: 29.9116, lng: -95.0616 },
    summary:
      "Northeast Harris County on FM 2100, between US-90 and Lake Houston. Acreage and horse property sit a few minutes from subdivisions with city services, which is most of the appeal.",
    highlights: [
      "Harris County services and taxes while still buying land by the acre",
      "Lake Houston access on the west side of the area",
      "Crosby ISD, with Huffman ISD picking up the north",
    ],
    lookFor: [
      "Deed restrictions on acreage tracts, which vary lot to lot",
      "Well and septic condition, and when the septic was last inspected",
      "Pipeline and utility easements crossing the larger tracts",
    ],
  },
  {
    slug: "huffman",
    name: "Huffman",
    county: "Harris County",
    zips: ["77336"],
    schoolDistrict: "Huffman ISD",
    center: { lat: 30.0169, lng: -95.0968 },
    summary:
      "On the east side of Lake Houston along FM 1960 and FM 2100. Waterfront and water-access neighborhoods, wooded acreage, and a school district small enough that people know the teachers.",
    highlights: [
      "Lake Houston frontage and canal-access neighborhoods",
      "Huffman ISD across the area",
      "Wooded acreage tracts north and east of the lake",
    ],
    lookFor: [
      "Bulkhead and pier condition on any waterfront property",
      "Lake Houston flood history and the current flood zone for the address",
      "Whether water access is deeded, by easement, or neither",
    ],
  },
  {
    slug: "cleveland",
    name: "Cleveland",
    county: "Liberty County",
    zips: ["77327"],
    schoolDistrict: "Cleveland ISD",
    center: { lat: 30.3413, lng: -95.0855 },
    summary:
      "Northern Liberty County on US-59 and I-69, at the edge of the Sam Houston National Forest. The largest supply of raw land and wooded acreage in the county, and the fastest-changing part of it.",
    highlights: [
      "I-69 running straight into north Houston",
      "Large inventory of unimproved land and owner-financed tracts",
      "Cleveland ISD, one of the fastest-growing districts in the region",
    ],
    lookFor: [
      "Road access and whether it is county-maintained or a private easement",
      "Utility availability at the tract, which is not a given on raw land",
      "Title and survey work on subdivided acreage, where both are often out of date",
    ],
  },
  {
    slug: "hardin",
    name: "Hardin",
    county: "Liberty County",
    zips: ["77561"],
    schoolDistrict: "Hardin ISD",
    center: { lat: 30.1466, lng: -94.7355 },
    summary:
      "North of Liberty on FM 1010 and FM 834. A small community, mostly acreage and country homes, with a school district that is the whole reason many families look here.",
    highlights: [
      "Hardin ISD, small enough that the campus is a short drive from anywhere in it",
      "Acreage homesites and pasture land",
      "Fifteen minutes to Liberty, half an hour to Dayton",
    ],
    lookFor: [
      "Well depth and water quality on rural tracts",
      "Ag exemption status and what happens to the tax bill if it is lost",
      "Distance to the nearest fire station, which affects the insurance rate",
    ],
  },
];

export function areaBySlug(slug) {
  return areas.find((area) => area.slug === slug) ?? null;
}

export function areaByCity(city) {
  if (!city) return null;
  const needle = city.trim().toLowerCase();
  return areas.find((area) => area.name.toLowerCase() === needle) ?? null;
}
