import { loadedClient, requireClient } from "@/lib/supabase";

const SELECT = `
  id, slug, title, status, property_type, price, street_address, city, state,
  zip, latitude, longitude, beds, baths, half_baths, square_feet,
  lot_size_acres, year_built, garage_spaces, hoa_fee, taxes_annual,
  school_district, mls_number, description, features, virtual_tour_url,
  video_url, is_featured, published_at, created_at,
  listing_images ( id, storage_path, alt_text, position )
`;

export const SORTS = {
  newest: { column: "published_at", ascending: false },
  price_desc: { column: "price", ascending: false },
  price_asc: { column: "price", ascending: true },
  sqft_desc: { column: "square_feet", ascending: false },
  beds_desc: { column: "beds", ascending: false },
};

export const PAGE_SIZE = 12;

function applyFilters(query, filters) {
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.propertyType)
    query = query.eq("property_type", filters.propertyType);
  if (filters.minPrice) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters.minBeds) query = query.gte("beds", filters.minBeds);
  if (filters.minBaths) query = query.gte("baths", filters.minBaths);
  if (filters.minSqft) query = query.gte("square_feet", filters.minSqft);
  if (filters.minAcres) query = query.gte("lot_size_acres", filters.minAcres);
  if (filters.search) {
    const term = filters.search.replace(/[%,()]/g, " ").trim();
    if (term) {
      query = query.or(
        [
          `title.ilike.%${term}%`,
          `street_address.ilike.%${term}%`,
          `city.ilike.%${term}%`,
          `zip.ilike.%${term}%`,
          `mls_number.ilike.%${term}%`,
        ].join(","),
      );
    }
  }
  return query;
}

export async function fetchListings(filters = {}) {
  const supabase = await requireClient();
  let query = supabase
    .from("listings")
    .select(SELECT)
    .not("published_at", "is", null)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false });

  query = applyFilters(query, filters);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchListingsPage(
  filters = {},
  { page = 0, pageSize = PAGE_SIZE, sort = "newest" } = {},
) {
  const supabase = await requireClient();
  const order = SORTS[sort] ?? SORTS.newest;
  const from = page * pageSize;

  let query = supabase
    .from("listings")
    .select(SELECT, { count: "exact" })
    .not("published_at", "is", null);

  query = applyFilters(query, filters);

  if (sort === "newest")
    query = query.order("is_featured", { ascending: false });
  query = query
    .order(order.column, { ascending: order.ascending, nullsFirst: false })
    .order("id", { ascending: true })
    .range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function fetchListingBySlug(slug) {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchListingsByIds(ids) {
  if (!ids?.length) return [];
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .in("id", ids)
    .not("published_at", "is", null);
  if (error) throw error;
  return data ?? [];
}

export async function fetchNearbyListings(listing, limit = 3) {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .eq("city", listing.city)
    .neq("id", listing.id)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
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
  const supabase = loadedClient();
  if (!supabase || !storagePath) return null;
  return supabase.storage.from("listing-photos").getPublicUrl(storagePath).data
    .publicUrl;
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
