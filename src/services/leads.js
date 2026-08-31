import { requireClient } from "@/lib/supabase";

export async function submitLead(lead) {
  const supabase = requireClient();
  const { error } = await supabase.from("leads").insert(lead);
  if (error) throw error;
}

export async function fetchLeads() {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, listings ( title, slug, street_address )")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function setLeadHandled(id, handled) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("leads")
    .update({
      is_handled: handled,
      handled_at: handled ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("*, listings ( title, slug, street_address )")
    .single();
  if (error) throw error;
  return data;
}

export async function saveLeadNotes(id, notes) {
  const supabase = requireClient();
  const { error } = await supabase
    .from("leads")
    .update({ agent_notes: notes })
    .eq("id", id);
  if (error) throw error;
}
