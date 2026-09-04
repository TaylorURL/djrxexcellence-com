import { requireClient } from "@/lib/supabase";

const SELECT = `
  id, author_name, author_location, transaction_kind, quote, rating,
  is_published, position, created_at
`;

export async function fetchPublishedTestimonials(limit) {
  const supabase = await requireClient();
  let query = supabase
    .from("testimonials")
    .select(SELECT)
    .eq("is_published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllTestimonials() {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(SELECT)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveTestimonial(testimonial) {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("testimonials")
    .upsert(testimonial)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Publishes or hides one testimonial without touching the rest of the row.
 *
 * `saveTestimonial` upserts, which PostgREST issues as an insert carrying an
 * `on conflict` clause, so the row sent has to satisfy every constraint on the
 * table before the conflict is ever reached. A payload of an id and a flag has
 * neither `author_name` nor `quote`, both of them not null, so the statement
 * fails on the row it was meant to update. An update names the row instead.
 */
export async function setTestimonialPublished(id, published) {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update({ is_published: published })
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTestimonial(id) {
  const supabase = await requireClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw error;
}
