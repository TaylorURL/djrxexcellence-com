import { requireClient } from "@/lib/supabase";

export async function fetchSavedSearches(userId) {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, label, filters, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createSavedSearch({ userId, label, filters }) {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .insert({ user_id: userId, label, filters })
    .select("id, label, filters, created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSavedSearch(id) {
  const supabase = await requireClient();
  const { error } = await supabase.from("saved_searches").delete().eq("id", id);
  if (error) throw error;
}
