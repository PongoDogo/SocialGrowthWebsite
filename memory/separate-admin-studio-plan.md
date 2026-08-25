# Separate Admin Studio Plan

The `feature/separate-admin-studio` branch is intentionally isolated from `cloudflare-setup`.

Target architecture:
- Official Worker: `socialstartup` -> public website only.
- Admin Worker: `socialstartup-admin` -> Studio only.
- Both use the same Render backend and MongoDB.
- Studio preview loads the official site with `?__sgpreview=1`.

Current feature-branch changes:
- `frontend/wrangler.admin.toml` defines the second Worker.
- `frontend/src/App.js` uses `REACT_APP_ADMIN_ONLY` so the official build has no Studio route and the admin build renders Studio only.
- `frontend/craco.config.js` requires `REACT_APP_PUBLIC_SITE_URL` for admin builds and rewrites `window.location.origin` at build time so the existing Studio preview iframe points to the official site without rewriting the large `Studio.jsx` file.

No production branch or deployment has been changed by this feature work.
