import { requireClient } from "@/lib/supabase";

const SELECT = `
  id, listing_id, body, created_at, updated_at, parent_id, author_id,
  author_name, author_role, is_hidden
`;

export async function fetchComments(listingId) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("comments")
    .select(SELECT)
    .eq("listing_id", listingId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCommentsByAuthor(authorId) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("comments")
    .select(`${SELECT}, listings ( slug, street_address, city )`)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllComments() {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("comments")
    .select(`${SELECT}, listings ( slug, street_address, city )`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function postComment({
  listingId,
  authorId,
  body,
  parentId = null,
}) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      listing_id: listingId,
      author_id: authorId,
      body,
      parent_id: parentId,
    })
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateComment(id, body) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("comments")
    .update({ body })
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function setCommentHidden(id, hidden) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("comments")
    .update({ is_hidden: hidden })
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(id) {
  const supabase = requireClient();
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}

/** Nests a flat, chronologically ordered comment list into reply trees. */
export function buildThread(comments) {
  const nodes = new Map(
    comments.map((comment) => [comment.id, { ...comment, replies: [] }]),
  );
  const roots = [];
  nodes.forEach((node) => {
    const parent = node.parent_id ? nodes.get(node.parent_id) : null;
    if (parent) parent.replies.push(node);
    else roots.push(node);
  });
  return roots;
}
