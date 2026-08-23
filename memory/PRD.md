# SocialGrowth — PRD

## Original problem statement
Greek user wants a website for their agency that advertises shops/companies and produces videos for TikTok, Instagram, Facebook and YouTube. It must showcase all shops they have worked with in a smooth premium moving carousel. Design must be modern, fancy, professional, premium, clean, minimal, not chaotic, with the logo top-left.

Company: **SocialGrowth** · Email: **socialstartupagency@gmail.com** · Logo supplied by user (glossy 3D blue arrow + glass spheres).

## User choices
- Bilingual: Greek (default) + English switcher
- Dark premium theme
- Contact form must really send email to socialstartupagency@gmail.com
- Sections: Services + Clients + Contact + animated scroll-triggered stats counter (100M+ views)

## Architecture
- React 19 (CRA + craco), Tailwind, framer-motion, sonner. Single-page sections.
- FastAPI backend, MongoDB (`contacts` collection), email delivery via formsubmit.co AJAX endpoint.
- `src/i18n.js` holds all EL/EN copy + LangProvider context. `src/data/clients.js` holds the 28 clients.
- Client logos rendered as icon + typography cards (lucide-react) — guarantees zero deadspace / clean corners.

## Implemented (2026-06)
- Sticky glass navbar, logo top-left (transparent PNG derived from user asset), EL/EN switcher, mobile menu
- Hero with floating 3D logo, platform row (custom inline brand SVGs), full-width CTAs on mobile
- Clients carousel sits directly under the hero: 3 marquee rows, alternating directions/speeds, pause on hover,
  edge fade, per-card accent glow + lift. **25 clients, every one with its real logo.**
  Under each logo: the shop name (links to its site when one exists) + small Instagram / TikTok / Facebook icons
  for the shops where a real handle was verified.
- Logo pipeline: `/app/scripts/fetch_logos.py` (scrapes the clients' own sites) and
  `/app/scripts/process_uploaded_logos.py` (owner-supplied files) — auto trim, white/black background removal,
  rounded tiles for artwork that keeps its own background, recolour/lighten/brighten so every mark reads on dark.
- Social handles were harvested from the clients' own websites via `/app/scripts/find_socials.py`.
- Redesigned Stats section: 4 cards with 01–04 index, animated accent bar + progress line, per-card glow,
  scroll-triggered counters (100M+ views, clients count derived from CLIENTS.length, 1,200+ videos, 4 platforms)
- Services bento grid (6), Process (4 steps), Contact form → `POST /api/contact` (Mongo persist + real email), footer
- Backend: `GET /api/`, `POST /api/contact`, `GET /api/contact/count`
- Removed on request: Caravel, Cofis, Kemal. Renamed: Nadu Clothing → Nadu Men, Scorpios Bar → Scorpios Music Club.

## Environment recovery (2025-07)
- Both `.env` files were MISSING (backend crashed with `KeyError: 'MONGO_URL'`, frontend had no
  `REACT_APP_BACKEND_URL`) and `node_modules/acorn-globals` had a broken symlink blocking `yarn install`.
- Recreated `backend/.env` (MONGO_URL, DB_NAME=socialgrowth, CORS_ORIGINS, CONTACT_EMAIL) and
  `frontend/.env` (REACT_APP_BACKEND_URL, WDS_SOCKET_PORT=443). No product code changed.
- Full regression PASSED: backend 10/10 (health, contact create + 5 validation cases, count, CORS, Mongo persist),
  frontend all sections at 1920x900 and 390x844 — 0 console errors, 25/25 client logos load, EL/EN switcher,
  stats counters (100M+, 25+, 1,200+, 4), contact form success toast, no horizontal overflow.
- formsubmit.co activation is DONE: `email_delivered: true` — contact emails really reach
  socialstartupagency@gmail.com.

## Backlog
- P1: Social handles still missing for funkytokyo, yakuza, twisteast, ildesto, doncarlito
- P1: Portfolio/Videos section embedding real TikTok/Instagram/YouTube reels
- P2: Testimonials, per-client case study pages, SEO/OG images, admin inbox for submissions
- P2: Persistent inline error state on the contact form (currently only a sonner toast)

## Logo / social research notes (2026-06)
- Logo pipeline scripts: `fetch_logos.py` (client sites), `process_uploaded_logos.py` (owner files:
  flood-fill bg removal that preserves interior whites, circle masking to kill outer frames,
  rounded tiles with margin trim, brightness/contrast lift), `find_socials.py`, `probe.py`.
- Verified sites: crats.gr, blysscafe.gr, papastavroushops.gr, tocashop.gr, ovegan269.gr, kiboko.gr,
  arawsupermarket.gr, hairway.gr, kantinarxis.gr, onedeal.gr, 50ways.com.gr, tolissweets.gr, nadu-men.gr,
  plus Wolt pages for Guru of Taste, Υπουργείο Γεύσεων and Μπαρμπαθύμιος.
- Navbar desktop breakpoint is `lg` (1024px); below that the hamburger menu carries the CTA.
