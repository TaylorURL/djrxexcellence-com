<p align="center"><img src="public/social-card.png" width="560" alt="Dylan Jordan, RE/MAX Excellence"></p>
<h1 align="center">Dylan Jordan Real Estate</h1>
<p align="center">Website for Dylan Jordan, a RE/MAX Excellence agent in Dayton, Texas.</p>
<p align="center"><a href="https://djrxexcellence.com">djrxexcellence.com</a></p>
<p align="center">
  <img src="https://img.shields.io/badge/version-2026.44.0-DC1C2E?style=for-the-badge" alt="Version" />
</p>

Dylan sells homes in Dayton and the towns around it: Liberty, Mont Belvieu, Baytown, Crosby, Huffman, Cleveland and Hardin. Buyers can search his listings, save the ones they like and ask him questions right on the listing page. Dylan runs the listings, leads and comments from an admin dashboard on the same site.

## What's on the site

- Listings with filters, a map view, a photo gallery and a mortgage calculator
- Buyer accounts for saving homes and searches, and a side-by-side comparison of up to four homes
- Public questions and answers on each listing, so the next buyer can read them too
- A page for each of the eight towns, with a chart comparing monthly taxes, insurance and district fees across them
- Forms to request a showing, ask about a town or get a home valuation
- An admin dashboard at `/admin` where Dylan adds listings, uploads and reorders photos, works leads, moderates comments and posts testimonials

## Running it locally

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

## Built with

React 19, React Router 7, Vite 7, Tailwind CSS 3, Supabase and Leaflet with OpenStreetMap. Hosted on Vercel.

---

Built and maintained by [TaylorURL](https://www.taylorurl.com). Proprietary, see [LICENSE.md](LICENSE.md).
