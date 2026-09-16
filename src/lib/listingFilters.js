/**
 * Names the columns `q` is matched against in `fetchListings`, so a search
 * field says what it searches rather than leaving a visitor to guess.
 */
export const SEARCH_HINT = "Address, city, ZIP, or MLS number";

const FILTER_KEYS = [
  "q",
  "city",
  "type",
  "status",
  "min",
  "max",
  "beds",
  "baths",
  "sqft",
  "acres",
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "sqft_desc", label: "Largest Square Footage" },
  { value: "beds_desc", label: "Most Bedrooms" },
];

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function paramsToFilters(params) {
  return {
    search: params.get("q") ?? "",
    city: params.get("city") ?? "",
    propertyType: params.get("type") ?? "",
    status: params.get("status") ?? "",
    minPrice: toNumber(params.get("min")),
    maxPrice: toNumber(params.get("max")),
    minBeds: toNumber(params.get("beds")),
    minBaths: toNumber(params.get("baths")),
    minSqft: toNumber(params.get("sqft")),
    minAcres: toNumber(params.get("acres")),
  };
}

export function paramsToRecord(params) {
  const record = {};
  FILTER_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) record[key] = value;
  });
  const sort = params.get("sort");
  if (sort) record.sort = sort;
  return record;
}

export function recordToParams(record) {
  const params = new URLSearchParams();
  Object.entries(record ?? {}).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  return params;
}

const LABELS = {
  q: "Search",
  city: "Area",
  type: "Type",
  status: "Status",
  min: "Min price",
  max: "Max price",
  beds: "Beds",
  baths: "Baths",
  sqft: "Square feet",
  acres: "Acres",
};

export function describeFilters(record) {
  const parts = Object.entries(record ?? {})
    .filter(([key]) => key !== "sort" && LABELS[key])
    .map(([key, value]) => `${LABELS[key]} ${value}`);
  return parts.length ? parts.join(", ") : "Every listing";
}

export function activeFilterCount(params) {
  return FILTER_KEYS.filter((key) => params.get(key)).length;
}
