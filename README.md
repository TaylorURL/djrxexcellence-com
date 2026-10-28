<img src="public/social-card.png" width="560" alt="Dylan Jordan, RE/MAX Excellence">

# Dylan Jordan Real Estate

Website for Dylan Jordan, a RE/MAX Excellence agent in Dayton, Texas.

[djrxexcellence.com](https://djrxexcellence.com)

<img src="https://img.shields.io/badge/version-2026.44.1-DC1C2E?style=for-the-badge" alt="Version" />

Listings for Dayton and the towns around it, with buyer accounts and an agent dashboard. React single-page app on Supabase. Every public route is also written out as static HTML at build time.

## How it's built

- **Data and auth.** Supabase Postgres holds profiles, listings, photos, favorites, comments, leads, saved searches and testimonials (`supabase/migrations/`). Photos live in Supabase Storage. Each table has one module in `src/services/`. Pages never query directly.
- **Two roles.** A profile is a member or the agent. `RequireAuth` keeps members out of `/admin` and signed-out visitors out of `/account`. That's just navigation. The database is what enforces it.
- **RLS is the second check, not the only one.** Policies decide which rows each role sees. Migration `0005` then revokes everything from `anon` and `authenticated` and grants back only the statements each role actually runs. So no role can `TRUNCATE`, and a missing delete policy can't turn into a delete. Visitors can create a lead but can't read one.
- **Prerendered.** The app renders in the browser, so `scripts/prerender.js` runs after `vite build` and writes one HTML file per route with its own head and first screen. Listings are read from the database at build time, the same set the sitemap publishes. Every URL in the sitemap has a real document.

<details>
<summary>Decisions and tradeoffs</summary>

- The Supabase SDK isn't loaded on a cold visit. `mayHaveSession()` checks `localStorage` for a session or a pending sign-in and the URL for an auth link. Without one, the two public reads go straight to PostgREST as plain `GET`s. The SDK is only pulled in for sessions and writes.
- Role checks inside policies go through `security definer` functions (`is_agent()`, `profile_role()`). A policy on `profiles` that reads `profiles` is rejected as recursive. The same check stops a user from raising their own role.
- Every function pins its `search_path` (migration `0004`).
- The map is Leaflet with OpenStreetMap tiles, in its own chunk.
- The town comparison stacks principal and interest, taxes, insurance, and MUD, PID and HOA fees from `src/data/carryingCosts.js`. The parts that differ between towns sit together at one end of the bar.
- Compare holds up to four listings in `localStorage`.
- `npm run verify:policies` runs the policy checks against a live project as a visitor, a member and the agent, through the same client a browser uses, then deletes what it wrote.
- `middleware.js` checks a TaylorURL status endpoint and shows a holding page if the site is paused. Fails open. `api/version.js` returns the deployed commit, uncached.

</details>

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

Without the Supabase values the site still builds and runs, and the pages that need the database say it isn't set up. [docs/SETUP.md](docs/SETUP.md) covers creating the Supabase project, applying the migrations in `supabase/migrations/` and seeding sample listings with `npm run seed`.

</details>

## Built with

React 19, React Router 7, Vite 7, Tailwind CSS 3, Supabase and Leaflet with OpenStreetMap. Hosted on Vercel.

<details>
<summary>License</summary>

Proprietary. Copyright (c) 2026 TaylorURL LLC, all rights reserved. See [LICENSE.md](LICENSE.md).

</details>

Built and maintained by [TaylorURL](https://www.taylorurl.com).
