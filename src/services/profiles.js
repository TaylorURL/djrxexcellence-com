import { requireClient } from "@/lib/supabase";

export async function fetchProfile(userId) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url, role, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, changes) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(changes)
    .eq("id", userId)
    .select("id, full_name, email, phone, avatar_url, role, created_at")
    .single();
  if (error) throw error;
  return data;
}
