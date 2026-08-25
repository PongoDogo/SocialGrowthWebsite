# SocialGrowth — PRD & working memory

_Last updated: Jul 2025_

## 1. Product
Premium bilingual (EL/EN) one-page agency site for **SocialGrowth** (short-form video / social media agency, Greece)
plus a private **Studio** (admin panel) at `/studio` where the owner edits the whole site without code.

Stack: React 19 (CRA, Tailwind, shadcn, framer-motion) · FastAPI · MongoDB · deployed via Render/Cloudflare.
Contact form emails go out through formsubmit.co. Nothing is live until **Δημοσίευση** (draft → published model).

### Hard rules for every agent
- This is a **live client project**. Make only what the user asks; never refactor architecture, auth, deployment,
  `.env` or unrelated files.
- Public site reads `GET /api/content` (published). Studio edits the **draft** (`/api/admin/*`).
- Any draft change made while testing must end with `POST /api/admin/discard`.
- Studio password lives in `/app/memory/test_credentials.md`.

## 2. Architecture
```
/app/backend
  server.py            FastAPI app, /api router, contact endpoint
  admin.py             Studio auth (single password + JWT), content draft/publish, media, inbox, revisions
  default_content.py   DEFAULT_CONTENT tree (single source of truth for defaults)
  db.py                Mongo client (MONGO_URL, DB_NAME)
/app/frontend/src
  PublicSite.js        renders navbar + ordered sections + custom blocks + footer
  content/
    ContentContext.js  fetches published content, or receives draft via postMessage in preview mode
    style.js           theme helpers (container/pad/cardStyle/primaryBtn/FONTS/useThemeSetup)
    SectionShell.js    visibleItems() (adds `_i` original index) + sectionOrder() (incl. "block:<id>")
    StyleOverrides.js  content.styles  ->  real CSS ([data-sg="path"] + mobile media query + light-mode ink remap)
    PreviewBridge.js   inside preview iframe: hover outline, click-to-select, drag-to-move (postMessage)
  components/
    Marquee.jsx        rAF marquee engine (seamless, eased hover pause, constant px/s)
    Clients.js         carousel rows, logo preload, dark logo tiles
    Blocks.jsx         12 custom block types + embedFor() (TikTok/IG/YouTube/Vimeo/mp4)
    Hero/Navbar/Stats/Services/Process/Contact/Footer
  studio/
    Studio.jsx         shell: nav, autosave, publish, device/lang, edit-mode, selection, preview bridge
    Inspector.jsx      selected element: quick content edit + item actions + StyleEditor
    styleFields.jsx    StyleEditor (desktop/mobile tabs, position, typography, colours, spacing, border)
    Editors.jsx        per-section editors + LayoutEditor (sections & blocks) + TemplatesEditor
    blocks.jsx         newBlock() factory + per-type block fields
    templates.js       6 appearance-only templates
    Panels.jsx         overview / inbox / media / history / settings
/app/scripts/sync_defaults.py   regenerates frontend/src/content/defaults.json from backend defaults
```

### Editable-element contract (`data-sg`)
Every editable element carries `data-sg="<content path>"`, `data-sg-kind="text|button|image|number|card|box|section"`,
`data-sg-label="<greek label>"`. Sections use `data-sg="section:<id>"`.
`content.styles` is a **flat map keyed by that path** (dots inside the key). Each entry holds up to three
breakpoint objects — `d` (desktop, no media query), `t` (tablet, `@media max-width:1023px`) and
`m` (mobile, `@media max-width:767px`, emitted last so it wins) — and each of those may hold a nested
`hover` object. Style setters therefore use array paths:
`setIn(d, ["styles", path, dev, key], v)` and `setIn(d, ["styles", path, dev, "hover", key], v)`.
`Studio.setStyle(path, dev, key, value)` accepts `key` as a string **or an array** for nested writes.

## 3. Implemented
### Jul 2025 — Studio becomes "editable στα πάντα" + bug sweep
- **New 3rd breakpoint:** tablet is now styleable (`t`). Previously the Studio previewed tablet at 820px but
  styles only existed for `d`/`m` with mobile at max-width:767px, so tablet was unreachable. The style editor
  has 3 device tabs that show a dot when they hold overrides, follow the top-bar device automatically, and
  can copy desktop→tablet / desktop→mobile / tablet→mobile.
- **StyleEditor rewritten** into 8 collapsible groups, each with a live badge counting active overrides and a
  stable `data-testid` (`style-group-position|typography|text|colors|layout|spacing|border|hover`):
  position/size (width mode auto/px/%/full/fit, min+max width, height, min+max height, position with insets,
  order, z-index, hide-per-device) · typography (+ word-spacing, italic, decoration, text-shadow) ·
  **long-text handling** (line-clamp, single-line ellipsis, break-word, white-space, overflow) ·
  colours & background (bg gradient, gradient TEXT, background image from the media library with size/position,
  blur, backdrop blur, grayscale, brightness, saturate) · inner layout (display, flex direction/justify/align/
  wrap/gap, grid columns) · spacing (4 margins + 4 paddings) · border (radius + 4 corners, border style,
  all-sides + 4 side widths, 6 shadow presets + fully custom shadow) · **hover** (colour, bg, lift, scale,
  glow + colour, rotate, opacity, border, radius, grayscale, shadow, cursor, transition speed).
- **Hover transforms merge with the base transform**, so hovering never discards an element's x/y/rotate/scale.
- **Tooltips:** new `Tip` component in `fields.jsx` (15px "i" circle → 236px popover on CSS-only hover,
  non-interactive span so it is valid inside `<label>` and inside the `Toggle` button, zero layout shift).
  `tip` prop added to `Row`, `Panel` and `Toggle`; the pre-existing inline `hint` text was left untouched.
  Written for every style control plus the confusing settings in `Editors.jsx`.
- **Bugs fixed:** (1) padding only applied top+left although the labels promised all four sides;
  (2) `z-index: 0` was silently dropped (`if (num(...))` falsy at 0); (3) values returned to "Αυτόματο" stayed
  as `undefined` keys so an element counted as modified for ever and the reset button never disappeared —
  new `countStyleValues` / `countStyleEntry` helpers in `studio/util.js` skip empty values and recurse into
  `hover`; (4) tablet unreachable (above); (5) `PreviewBridge` ran two `querySelector` calls plus
  `getBoundingClientRect` on **every** animation frame — element lookups are now cached per slot and the
  overlay boxes are only written when a geometry signature changes.
- Verified by the testing agent with exact CSS snippets: all 4 paddings/margins independent, `z-index:0`
  emitted, hover keeps `translateX(100px)` + `translateY(-6px)`, both media queries emitted in the right
  order, line-clamp, `linear-gradient`, the reset counter disappearing, drag-to-move still working,
  23 tooltips with no layout shift, all 18 sidebar tabs rendering with no console errors.

### Jun 2026 — carousel rebuild (bug fix)
- `Marquee.jsx`: measures one set, clones enough copies for any viewport → **never runs out / no gaps**;
  rAF transform with constant px/second on every row; eased pause & resume on hover; pauses off-screen and on hidden tab.
- All client logos are **preloaded and eager** (no lazy pop-in); extra vertical padding so hover lift/glow is not clipped.
- New Studio controls: gap between cards, edge-fade width (0 = hard edge), logo tiles (auto/always dark/theme).

### Jun 2026 — Studio becomes a real website editor
- **Click-to-edit**: click any element inside the preview → inspector opens with its text/image/number field.
- **Drag-to-move** in the preview + X/Y sliders, **per device** (desktop / mobile).
- **Style inspector** per element: size, weight, letter-spacing, line-height, transform, font, colours, opacity,
  margins/padding, max-width, radius, border, shadow, z-index, hide-on-device, rotate, scale. Reset per element or all.
- **Sections & blocks**: drag/arrow reorder, hide/show (incl. navbar & footer), duplicate, delete, and **add new
  sections** — 12 block types: text, icon cards, image, gallery, videos/reels (TikTok/IG/YouTube/Vimeo/mp4), CTA banner,
  FAQ, testimonials, pricing, logos, spacer, divider. Empty blocks stay hidden on the live site.
- **Templates**: Dark Premium, Minimal Light, Neon Night, Editorial Gold, Warm Sunset, Mono Brutalist —
  appearance only (texts/clients/images untouched) with one-click **Αναίρεση**. Light themes remap the
  white-on-dark utilities to a chosen ink colour.
- Backend: `theme.mode`/`theme.ink`, `clients.gap`, `clients.fadeEdges`, `clients.logoTiles`, root `blocks: []`
  and `styles: {}` added to defaults; `dirty` now compares merged trees (no more false "unpublished changes").
- Verified by testing agent (iteration_8): backend 26/26, all requested Studio + carousel flows pass.

### Earlier
- Bilingual site, Studio with content editing, media library, inbox, revisions/history, theme & fonts, SEO fields.

## 4. Backlog
- **P1** Missing social handles for funkytokyo, yakuza, twisteast, ildesto, doncarlito.
- **P1** Real portfolio content: fill a Videos/Reels block with the actual TikTok/IG reels.
- **P2** Light-artwork client logos: optional per-client "invert in light theme" flag.
- **P2** `process_image()` runs sync inside the async upload handler → move to a threadpool for big uploads.
- **P2** Section-level presets (e.g. hero variants) and saving a user's own template.
- **P2** Entrance animations per element (deliberately skipped: a CSS `animation` on `transform` would fight
  the x/y/rotate/scale overrides — needs a wrapper element to be done safely).
- **P3** Multi-page support (currently one page + anchors).

## 5. Environment warning (has now happened twice)
`backend/.env` and `frontend/.env` keep going missing between sessions, which leaves both services STOPPED.
Recreate with: `MONGO_URL=mongodb://localhost:27017`, `DB_NAME=socialgrowth`, `CORS_ORIGINS=*`,
`CONTACT_EMAIL=socialstartupagency@gmail.com`, `ADMIN_PASSWORD` + `JWT_SECRET` (see
`/app/memory/test_credentials.md`), and `REACT_APP_BACKEND_URL=<preview url>` — then
`sudo supervisorctl restart backend frontend`.
