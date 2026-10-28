<img src="public/social-card.png" width="560" alt="Dylan Jordan, RE/MAX Excellence">

# Dylan Jordan Real Estate

Website for Dylan Jordan, a RE/MAX Excellence agent in Dayton, Texas.

[djrxexcellence.com](https://djrxexcellence.com)

<img src="https://img.shields.io/badge/version-2026.44.2-DC1C2E?style=for-the-badge" alt="Version" />

Listings for Dayton and the towns around it, with buyer accounts and an agent dashboard. It's a React app on Supabase, and every public route is also written out as static HTML at build time so crawlers and slow phones get a real page.

## Data and access

Supabase Postgres holds profiles, listings, photos, favorites, comments, leads, saved searches and testimonials. Each table gets one module in `src/services/` and pages never query directly.

A profile is either a member or the agent. `RequireAuth` keeps members out of `/admin`, but that's navigation, not security. The database does the real work:

- Row level security decides which rows each role sees. Role checks inside policies go through `security definer` functions (`is_agent()`, `profile_role()`), since a policy on `profiles` that reads `profiles` gets rejected as recursive. The same check stops a user from promoting themselves.
- Migration `0005` revokes everything from `anon` and `authenticated` and grants back only the statements each role runs. Nobody can `TRUNCATE`, and a forgotten delete policy can't turn into a delete. Visitors can create a lead and can't read one.
- `npm run verify:policies` runs those rules against a live project as a visitor, a member and the agent, using the same client the browser does, then cleans up after itself.

## Cold visits

Most visitors never sign in, so the Supabase SDK isn't loaded for them. `mayHaveSession()` looks for a stored session, a pending sign-in or an auth link in the URL. If there's none, the two public reads go straight to PostgREST as plain `GET`s.

`scripts/prerender.js` reads listings from the database at build time, the same set the sitemap publishes, so every URL in the sitemap has a real document behind it.

The map is Leaflet on OpenStreetMap tiles, in its own chunk. The town comparison stacks principal and interest, taxes, insurance and MUD, PID and HOA fees from `src/data/carryingCosts.js`, with the parts that change between towns grouped at one end of the bar.

<details>
<summary>Running it locally</summary>

You need Node 22 and a Supabase project.

```bash
npm install
cp .env.example .env.local
npm run dev
npm test
```

| Variable                                          | What it's for                                                           |
| :------------------------------------------------ | :---------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`     | The Supabase project the site reads                                     |
| `SEED_AGENT_*`, `SEED_MEMBER_*` (email, password) | Test accounts used only by `npm run seed` and `npm run verify:policies` |

Without the Supabase values the site still builds, and the pages that need the database say it isn't set up. [docs/SETUP.md](docs/SETUP.md) covers creating the project, applying `supabase/migrations/` and seeding sample listings with `npm run seed`.

</details>

React 19, React Router 7, Vite 7, Tailwind CSS 3, Supabase and Leaflet, on Vercel. Proprietary, see [LICENSE.md](LICENSE.md).

Built and maintained by [TaylorURL](https://www.taylorurl.com).
