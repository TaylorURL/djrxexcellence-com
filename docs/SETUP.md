# Supabase setup

## Create the project

Create a Supabase project in the TaylorURL organization, then copy the project
URL and the publishable anon key into `.env.local`:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

The same two values go into the Vercel project as environment variables for
every environment, and into CryptoFort so the next machine does not have to ask.

## Apply the schema

Run the five migrations in order against the new project, either through the
SQL editor or the CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

`0001_init.sql` creates the enums, tables and indexes. `0002_policies.sql` adds
the `updated_at` triggers, the trigger that mirrors a new `auth.users` row into
`public.profiles`, every row-level security policy, and the public
`listing-photos` storage bucket. `0003_testimonials_and_comment_authors.sql`
adds the agent-managed `testimonials` table and lead triage columns, stamps the
comment author name and role onto each comment row, and repairs two things in
`0002` that fail at runtime: the profiles update policy read
`public.profiles` from inside a policy on `public.profiles`, which Postgres
rejects as recursive, and the photo bucket had no update policy, which an upsert
upload needs. `0004_function_hardening.sql` pins the search path on the
security definer functions and revokes execute on the four trigger functions,
which PostgREST otherwise exposes as RPC endpoints to anyone.

`0005_least_privilege_grants.sql` takes the ownership default off the two
browser roles. Both held every privilege on every table, including TRUNCATE and
REFERENCES, neither of which consults a policy. `anon` is left with the four
reads the public pages make and the insert the contact form makes;
`authenticated` keeps select, insert, update and delete, which the policies
narrow to its own rows. The same file revokes execute on
`public.rls_auto_enable()`, which fires from an event trigger and runs as its
owner, so the grant only exposed it.

`public.is_agent()` and `public.profile_role()` stay executable by `anon` and
`authenticated` on purpose. Row-level security policies are evaluated as the
querying role, so revoking execute on either one breaks every policy that reads
it, and both answer only about the caller.

## Auth settings

Email confirmation is off, so a sign-up session is live immediately. Set the
site URL to the deployed origin and add `http://localhost:5173` as an additional
redirect URL for local work.

## Promote the agent account

Every sign-up lands as `member`. Dylan's account becomes the agent account by
setting the role on the profile row once, after he has signed up:

```sql
update public.profiles
set role = 'agent'
where email = '<dylan-email>';
```

`public.is_agent()` reads that column, and every write policy on listings,
photos, leads and testimonials goes through it.

## Check the policies behave

`scripts/verify-policies.js` does this rather than a person clicking through it.
It signs in as the agent and the member, runs twenty-nine assertions through the
same browser client and publishable key a visitor uses, and removes everything
it wrote:

```bash
npm run verify:policies
```

It needs four variables beyond the two in `.env.local`:

```
SEED_AGENT_EMAIL=
SEED_AGENT_PASSWORD=
SEED_MEMBER_EMAIL=
SEED_MEMBER_PASSWORD=
```

What it proves: a draft listing is invisible to anyone but the agent; a member
can favorite, comment, save a search and edit its own profile; a member cannot
create a listing, read a lead, read another profile, write to the photo bucket,
publish a testimonial, favorite on someone else's account, or promote itself to
agent; a comment carries its author's name for every reader, not just the
author; the agent's reply is stamped as the agent; a hidden comment disappears
for everyone else; anyone can submit a lead and only the agent can read one.

`tests/live-queries.test.js` runs alongside it under `npm test` whenever
`.env.local` points at a project, and fails if a column the service layer reads
has moved. It skips itself in CI.

## Seed the sample inventory

```bash
npm run seed              # eight listings across the service areas, five photos each
npm run seed -- --teardown   # removes them and their photos
```

The seeded listings carry a `SAMPLE-` MLS number, which is what teardown matches
on and what makes them obvious in the dashboard. **Remove them before the site
goes public**, or publish real inventory over them.

`scripts/seed-images.js` draws the photos rather than downloading any, so
nothing on a sample listing claims to be a picture of a house that exists. The
output is deterministic from the listing index, a tract of land gets an open
field and a treeline instead of a house, and re-running the seed reproduces the
same set. It rasterises through `sharp`, as the brand and social-card
generators do, which is why that is a development dependency.

## Photos

Listing photos live in the `listing-photos` bucket, which is world-readable and
writable only by the agent. Objects are keyed `<listing-id>/<timestamp>-<name>`
and referenced from `listing_images.storage_path`. The photo manager on the
listing editor uploads, reorders by drag or by the Back and Forward buttons,
writes alt text per photo, and deletes the object along with the row.

## Still to fill in

`src/config/site.js` ships with tokens standing in for values the office has to
supply. `resolved()` reads them as absent, so nothing prints a token and every
screen falls back to the office line, but the detail is missing until they are
set:

| Token                                                   | Where it shows                                           |
| ------------------------------------------------------- | -------------------------------------------------------- |
| `TREC_LICENSE_NUMBER`                                   | About page, footer                                       |
| `AGENT_EMAIL`                                           | Contact, About, privacy and accessibility contact routes |
| `AGENT_CELL`                                            | Every call and text link                                 |
| `SOCIAL_FACEBOOK_URL` and the other four social handles | Footer, and the `sameAs` on the agent JSON-LD            |

The headshot is in place at `public/agent/dylan-jordan.jpg`, with WebP siblings
at `dylan-jordan.webp` and `dylan-jordan-500.webp` that `AgentPortrait` serves
through a `<picture>` srcset. If the file is ever removed the portrait renders
the monogram rather than a broken image.

The two accounts the seed and verification scripts use are throwaways:
`seed-agent@djrxexcellence.com`, which holds the `agent` role and owns the
sample photos, and `seed-member@djrxexcellence.com`. Once Dylan has signed up
and been promoted, delete both from the Supabase auth dashboard; deleting the
agent first sets `created_by` to null on the sample listings rather than
removing them.
