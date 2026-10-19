# tinwright.github.io

The whole tinwright site. It holds no tools: `scripts/build-site.mjs` builds the gallery's home
page (`renderGallery`) and, under `<repo>/`, every workshop's home page, tool pages and authors
pages, from a checkout of each workshop listed in `site.config.js` `workshops`. One
`scripts/page.js` renders all of it.

- **Where the workshops come from** (`scripts/workshops.mjs`): `$WORKSHOPS_DIR`, else `.workshops/`
  (`npm run workshops` clones them there, as CI does), else the folders next to this repo.
- **What a workshop supplies:** its `site.config.js` (title, tagline, translations, `items`
  overrides, `hidden`), `scripts/items.mjs` `readItems`, `scripts/site.mjs` (its nouns and the
  `kicker`, `card`, `facts` and `install` hooks, which get `kit`: `escapeHTML`, `commandHTML`,
  `itemsPath`), and `scripts/rules.mjs` `beforeBuild` and `afterBuild`. Its tool-specific
  rendering belongs in its `site.mjs`, never in `page.js` here.
- A workshop without a checkout is listed with a link to its repository, never a failed build;
  the site test fails instead, so CI notices.
- `npm test` builds the real site and checks every page and link. Run it after changing a
  workshop's `site.mjs`, `items.mjs` or `rules.mjs` too.
- Deployed by `.github/workflows/pages.yml` on push, hourly and by hand. GitHub Pages needs this
  repo and the workshops to be public, and the workshops must not publish Pages of their own:
  their paths here (`/ai-apprentice/`...) would be taken by them.
