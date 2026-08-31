/**
 * Exercises the row-level policies against a live project, as an anonymous
 * visitor, a member and the agent in turn, and reports each expectation.
 *
 * Every call goes through the browser client and the publishable key, so a pass
 * here is the same path a visitor takes. Nothing is left behind: the comment,
 * favorite, saved search and lead it writes are removed at the end.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const checks = [];

function record(name, passed, detail) {
  checks.push({ name, passed, detail });
  console.log(
    `${passed ? "pass" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
  );
}

function client() {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signIn(email, password) {
  const supabase = client();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(`${email}: ${error.message}`);
  return { supabase, user: data.user };
}

async function main() {
  const anon = client();
  const agent = await signIn(
    process.env.SEED_AGENT_EMAIL,
    process.env.SEED_AGENT_PASSWORD,
  );
  const member = await signIn(
    process.env.SEED_MEMBER_EMAIL,
    process.env.SEED_MEMBER_PASSWORD,
  );

  record("agent signs in", Boolean(agent.user));
  record("member signs in", Boolean(member.user));

  // The lead this run files is removed at the end, but a check that throws
  // rather than recording a failure skips that. Clearing at the start as well
  // means the next run collects whatever the last one left, so a run that dies
  // halfway costs one stale row rather than one per attempt.
  await agent.supabase
    .from("leads")
    .delete()
    .eq("email", "policy-check@example.com");

  const published = await anon
    .from("listings")
    .select("id, slug, published_at, listing_images ( id )")
    .not("published_at", "is", null);
  record(
    "anonymous reads published listings",
    !published.error && published.data.length > 0,
    published.error?.message ?? `${published.data?.length} listings`,
  );

  const withPhotos = (published.data ?? []).filter(
    (row) => (row.listing_images ?? []).length > 0,
  );
  record(
    "anonymous reads listing photos",
    withPhotos.length === published.data?.length,
    `${withPhotos.length} of ${published.data?.length} have photos`,
  );

  const target = published.data[0];

  const draft = await agent.supabase
    .from("listings")
    .insert({
      slug: `policy-check-draft-${Date.now()}`,
      title: "Policy check draft",
      street_address: "Policy check draft",
      city: "Dayton",
      state: "TX",
      zip: "77535",
      published_at: null,
    })
    .select("id, slug")
    .single();
  record("agent creates a draft listing", !draft.error, draft.error?.message);

  if (!draft.error) {
    const anonDraft = await anon
      .from("listings")
      .select("id")
      .eq("id", draft.data.id);
    record(
      "anonymous cannot see a draft listing",
      !anonDraft.error && anonDraft.data.length === 0,
      anonDraft.error?.message ?? `${anonDraft.data?.length} rows`,
    );
    const agentDraft = await agent.supabase
      .from("listings")
      .select("id")
      .eq("id", draft.data.id);
    record(
      "agent sees its own draft",
      !agentDraft.error && agentDraft.data.length === 1,
      agentDraft.error?.message,
    );
  }

  const favorite = await member.supabase
    .from("favorites")
    .insert({ user_id: member.user.id, listing_id: target.id });
  record(
    "member favorites a listing",
    !favorite.error,
    favorite.error?.message,
  );

  const readBack = await member.supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", member.user.id);
  record(
    "member reads its own favorites",
    !readBack.error && readBack.data.length === 1,
    readBack.error?.message,
  );

  const otherFavorite = await member.supabase
    .from("favorites")
    .insert({ user_id: agent.user.id, listing_id: target.id });
  record(
    "member cannot favorite on another account",
    Boolean(otherFavorite.error),
    otherFavorite.error?.message ?? "the insert was allowed",
  );

  const comment = await member.supabase
    .from("comments")
    .insert({
      listing_id: target.id,
      author_id: member.user.id,
      body: "Is the survey from the last sale still on file?",
    })
    .select("id, author_name, author_role")
    .single();
  record("member posts a comment", !comment.error, comment.error?.message);
  record(
    "the comment carries the author name",
    comment.data?.author_name === "Casey Whitfield",
    `author_name=${comment.data?.author_name ?? "null"} role=${comment.data?.author_role ?? "null"}`,
  );

  const anonComment = await anon
    .from("comments")
    .select("id, author_name")
    .eq("id", comment.data.id)
    .single();
  record(
    "anonymous reads the comment with its author name",
    !anonComment.error && anonComment.data.author_name === "Casey Whitfield",
    anonComment.error?.message ??
      `author_name=${anonComment.data?.author_name}`,
  );

  const reply = await agent.supabase
    .from("comments")
    .insert({
      listing_id: target.id,
      author_id: agent.user.id,
      parent_id: comment.data.id,
      body: "It is, and the title company has accepted it with a seller affidavit.",
    })
    .select("id, author_role")
    .single();
  record(
    "agent replies and is stamped as the agent",
    !reply.error && reply.data.author_role === "agent",
    reply.error?.message ?? `author_role=${reply.data?.author_role}`,
  );

  const memberWrite = await member.supabase.from("listings").insert({
    slug: `member-should-not-write-${Date.now()}`,
    title: "Member write attempt",
    street_address: "Member write attempt",
    city: "Dayton",
    state: "TX",
    zip: "77535",
  });
  record(
    "member cannot create a listing",
    Boolean(memberWrite.error),
    memberWrite.error?.message ?? "the insert was allowed",
  );

  const memberLeads = await member.supabase.from("leads").select("id");
  record(
    "member cannot read leads",
    !memberLeads.error && memberLeads.data.length === 0,
    memberLeads.error?.message ?? `${memberLeads.data?.length} rows`,
  );

  const otherProfile = await member.supabase
    .from("profiles")
    .select("id, email")
    .eq("id", agent.user.id);
  record(
    "member cannot read another profile",
    !otherProfile.error && otherProfile.data.length === 0,
    otherProfile.error?.message ?? `${otherProfile.data?.length} rows`,
  );

  const escalate = await member.supabase
    .from("profiles")
    .update({ role: "agent" })
    .eq("id", member.user.id)
    .select("role");
  const escalated =
    !escalate.error &&
    escalate.data?.length > 0 &&
    escalate.data[0].role === "agent";
  record(
    "member cannot promote itself to agent",
    !escalated,
    escalate.error?.message ?? `${escalate.data?.length ?? 0} rows changed`,
  );

  const rename = await member.supabase
    .from("profiles")
    .update({ full_name: "Casey Whitfield", phone: "555-0100" })
    .eq("id", member.user.id)
    .select("full_name, phone")
    .single();
  record(
    "member edits its own profile",
    !rename.error && rename.data.phone === "555-0100",
    rename.error?.message,
  );

  const photoWrite = await member.supabase.storage
    .from("listing-photos")
    .upload(`${target.id}/member-attempt.txt`, new Blob(["no"]), {
      contentType: "text/plain",
    });
  record(
    "member cannot write to the photo bucket",
    Boolean(photoWrite.error),
    photoWrite.error?.message ?? "the upload was allowed",
  );

  const search = await member.supabase
    .from("saved_searches")
    .insert({
      user_id: member.user.id,
      label: "Dayton under 400k",
      filters: { city: "Dayton", max: "400000" },
    })
    .select("id")
    .single();
  record("member saves a search", !search.error, search.error?.message);

  const agentSeesSearch = await agent.supabase
    .from("saved_searches")
    .select("id")
    .eq("id", search.data?.id ?? "00000000-0000-0000-0000-000000000000");
  record(
    "a saved search stays private to its owner",
    !agentSeesSearch.error && agentSeesSearch.data.length === 0,
    agentSeesSearch.error?.message ?? `${agentSeesSearch.data?.length} rows`,
  );

  const lead = await anon.from("leads").insert({
    kind: "contact",
    full_name: "Policy Check",
    email: "policy-check@example.com",
    message: "Submitted by scripts/verify-policies.js",
    source_path: "/contact",
  });
  record("anyone can submit a lead", !lead.error, lead.error?.message);

  const anonReadLeads = await anon.from("leads").select("id");
  record(
    "anonymous cannot read leads",
    !anonReadLeads.error && anonReadLeads.data.length === 0,
    anonReadLeads.error?.message ?? `${anonReadLeads.data?.length} rows`,
  );

  const agentLeads = await agent.supabase.from("leads").select("id, full_name");
  record(
    "agent reads leads",
    !agentLeads.error && agentLeads.data.length > 0,
    agentLeads.error?.message ?? `${agentLeads.data?.length} rows`,
  );

  const hide = await agent.supabase
    .from("comments")
    .update({ is_hidden: true })
    .eq("id", comment.data.id)
    .select("is_hidden")
    .single();
  record(
    "agent hides a comment",
    !hide.error && hide.data.is_hidden,
    hide.error?.message,
  );

  const anonHidden = await anon
    .from("comments")
    .select("id")
    .eq("id", comment.data.id);
  record(
    "a hidden comment disappears for everyone else",
    !anonHidden.error && anonHidden.data.length === 0,
    anonHidden.error?.message ?? `${anonHidden.data?.length} rows`,
  );

  const memberTestimonial = await member.supabase
    .from("testimonials")
    .insert({ author_name: "Member attempt", quote: "Should not be allowed." });
  record(
    "member cannot publish a testimonial",
    Boolean(memberTestimonial.error),
    memberTestimonial.error?.message ?? "the insert was allowed",
  );

  const unpublished = await anon.from("testimonials").select("id");
  record(
    "an unpublished testimonial stays hidden",
    !unpublished.error && unpublished.data.length === 0,
    unpublished.error?.message ?? `${unpublished.data?.length} rows`,
  );

  await agent.supabase.from("comments").delete().eq("id", reply.data?.id);
  await agent.supabase.from("comments").delete().eq("id", comment.data.id);
  await member.supabase
    .from("favorites")
    .delete()
    .eq("user_id", member.user.id)
    .eq("listing_id", target.id);
  await member.supabase
    .from("saved_searches")
    .delete()
    .eq("id", search.data?.id);
  await agent.supabase.from("listings").delete().eq("id", draft.data?.id);
  await agent.supabase
    .from("leads")
    .delete()
    .eq("email", "policy-check@example.com");

  const failed = checks.filter((check) => !check.passed);
  console.log(
    `\n${checks.length - failed.length} of ${checks.length} checks passed`,
  );
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
