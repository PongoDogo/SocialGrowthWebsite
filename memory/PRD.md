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
- Hero with floating 3D logo, platform row (custom inline brand SVGs)
- Scroll-triggered animated counters: 100M+ views, 28+ brands, 1,200+ videos, 4 platforms
- Services bento grid (6 services)
- Clients: two opposite-direction CSS marquees, all 28 clients, pause on hover, edge fade
- Process (4 steps), Contact form → `POST /api/contact` (Mongo persist + real email), footer
- Backend: `GET /api/`, `POST /api/contact`, `GET /api/contact/count`

## Backlog
- P0: Owner must click the one-time formsubmit.co activation email to enable delivery
- P1: Replace icon-based client cards with the real client logo files (user upload)
- P1: Portfolio/Videos section embedding real TikTok/Instagram/YouTube reels
- P2: Testimonials, per-client case study pages, SEO/OG images, admin inbox for submissions
