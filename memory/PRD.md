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

## Backlog
- P0: Owner must click the one-time formsubmit.co activation email to enable delivery
- P1: Social handles still missing for yakuza, funkytokyo, twisteast, ildesto, ypourgeio, doncarlito, euthimiou,
  xara, nadu, barbathimios, scorpios
- P1: Portfolio/Videos section embedding real TikTok/Instagram/YouTube reels
- P2: Testimonials, per-client case study pages, SEO/OG images, admin inbox for submissions
