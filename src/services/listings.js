import { publicStorageUrl, requireClient, selectFrom } from "@/lib/supabase";

const SELECT = `
  id, slug, title, status, property_type, price, street_address, city, state,
  zip, latitude, longitude, beds, baths, half_baths, square_feet,
  lot_size_acres, year_built, garage_spaces, hoa_fee, taxes_annual,
  school_district, mls_number, description, features, virtual_tour_url,
  video_url, is_featured, published_at, created_at,
  listing_images ( id, storage_path, alt_text, position )
`.replace(/\s+/g, "");

const PHOTO_BUCKET = "listing-photos";

export const SORTS = {
  newest: { column: "published_at", ascending: false },
  price_desc: { column: "price", ascending: false },
  price_asc: { column: "price", ascending: true },
  sqft_desc: { column: "square_feet", ascending: false },
  beds_desc: { column: "beds", ascending: false },
};

export const PAGE_SIZE = 12;

function filterParams(filters) {
  const params = [];
  if (filters.status) params.push(["status", `eq.${filters.status}`]);
  if (filters.city) params.push(["city", `ilike.%${filters.city}%`]);
  if (filters.propertyType)
    params.push(["property_type", `eq.${filters.propertyType}`]);
  if (filters.minPrice) params.push(["price", `gte.${filters.minPrice}`]);
  if (filters.maxPrice) params.push(["price", `lte.${filters.maxPrice}`]);
  if (filters.minBeds) params.push(["beds", `gte.${filters.minBeds}`]);
  if (filters.minBaths) params.push(["baths", `gte.${filters.minBaths}`]);
  if (filters.minSqft) params.push(["square_feet", `gte.${filters.minSqft}`]);
  if (filters.minAcres)
    params.push(["lot_size_acres", `gte.${filters.minAcres}`]);
  if (filters.search) {
    const term = filters.search.replace(/[%,()]/g, " ").trim();
    if (term) {
      params.push([
        "or",
        `(${[
          `title.ilike.%${term}%`,
          `street_address.ilike.%${term}%`,
          `city.ilike.%${term}%`,
          `zip.ilike.%${term}%`,
          `mls_number.ilike.%${term}%`,
        ].join(",")})`,
      ]);
    }
  }
  return params;
}

const published = ["published_at", "not.is.null"];

export async function fetchListings(filters = {}) {
  const { rows } = await selectFrom("listings", [
    ["select", SELECT],
    published,
    ...filterParams(filters),
    ["order", "is_featured.desc,published_at.desc"],
    ...(filters.limit ? [["limit", String(filters.limit)]] : []),
  ]);
  return rows;
}

export async function fetchListingsPage(
  filters = {},
  { page = 0, pageSize = PAGE_SIZE, sort = "newest" } = {},
) {
  const order = SORTS[sort] ?? SORTS.newest;
  const by = [
    ...(sort === "newest" ? ["is_featured.desc"] : []),
    `${order.column}.${order.ascending ? "asc" : "desc"}.nullslast`,
    "id.asc",
  ];

  return selectFrom(
    "listings",
    [
      ["select", SELECT],
      published,
      ...filterParams(filters),
      ["order", by.join(",")],
      ["offset", String(page * pageSize)],
      ["limit", String(pageSize)],
    ],
    { count: true },
  );
}

export async function fetchListingBySlug(slug) {
  const { rows } = await selectFrom("listings", [
    ["select", SELECT],
    ["slug", `eq.${slug}`],
    ["limit", "1"],
  ]);
  return rows[0] ?? null;
}

export async function fetchListingsByIds(ids) {
  if (!ids?.length) return [];
  const { rows } = await selectFrom("listings", [
    ["select", SELECT],
    ["id", `in.(${ids.join(",")})`],
    published,
  ]);
  return rows;
}

export async function fetchNearbyListings(listing, limit = 3) {
  const { rows } = await selectFrom("listings", [
    ["select", SELECT],
    ["city", `eq.${listing.city}`],
    ["id", `neq.${listing.id}`],
    published,
    ["order", "published_at.desc"],
    ["limit", String(limit)],
  ]);
  return rows;
}

export async function fetchAllListingsForAgent() {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchListingForAgent(id) {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveListing(listing) {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("listings")
    .upsert(listing)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setListingPublished(id, published) {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("listings")
    .update({ published_at: published ? new Date().toISOString() : null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteListing(id) {
  const supabase = await requireClient();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
}

export async function slugExists(slug, exceptId) {
  const supabase = await requireClient();
  let query = supabase.from("listings").select("id").eq("slug", slug).limit(1);
  if (exceptId) query = query.neq("id", exceptId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).length > 0;
}

export function publicImageUrl(storagePath) {
  return publicStorageUrl(PHOTO_BUCKET, storagePath);
}

export function coverImage(listing) {
  const images = listing?.listing_images ?? [];
  if (!images.length) return null;
  const first = images.reduce((best, image) =>
    image.position < best.position ? image : best,
  );
  return publicImageUrl(first.storage_path);
}

export function sortedImages(listing) {
  return (listing?.listing_images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);
}
