import { requireClient } from "@/lib/supabase";

export async function fetchFavoriteIds(userId) {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.listing_id));
}

export async function fetchFavoriteListings(userId) {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("listing_id, listings (*, listing_images (*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => row.listings).filter(Boolean);
}

export async function addFavorite(userId, listingId) {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, listing_id: listingId });
  if (error) throw error;
}

export async function removeFavorite(userId, listingId) {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", listingId);
  if (error) throw error;
}
