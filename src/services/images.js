import { requireClient } from "@/lib/supabase";

const BUCKET = "listing-photos";

function safeName(name) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "photo.jpg";
}

export async function fetchListingImages(listingId) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("listing_images")
    .select("id, storage_path, alt_text, position")
    .eq("listing_id", listingId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function uploadListingImage({ listingId, file, position }) {
  const supabase = requireClient();
  const path = `${listingId}/${Date.now()}-${safeName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("listing_images")
    .insert({ listing_id: listingId, storage_path: path, position })
    .select("id, storage_path, alt_text, position")
    .single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }
  return data;
}

export async function deleteListingImage(image) {
  const supabase = requireClient();
  const { error } = await supabase
    .from("listing_images")
    .delete()
    .eq("id", image.id);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([image.storage_path]);
}

export async function saveImageOrder(images) {
  const supabase = requireClient();
  const updates = images.map((image, index) =>
    supabase
      .from("listing_images")
      .update({ position: index })
      .eq("id", image.id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed) throw failed.error;
}

export async function saveImageAltText(id, altText) {
  const supabase = requireClient();
  const { error } = await supabase
    .from("listing_images")
    .update({ alt_text: altText })
    .eq("id", id);
  if (error) throw error;
}
