# tinwright.github.io

The org-wide gallery. It holds no tools: `scripts/build-gallery.mjs` reads each workshop's
published `items.json` (listed in `site.config.js` `workshops`) and renders one home page per
language with `renderGallery` in `scripts/page.js`. Cards link to each tool's page on its own
workshop site, in the same language.

- A workshop that hasn't published a site yet is shown with a link to its repository, never a
  failed build.
- Keep `scripts/page.js` in step with the workshops' copies when their shell changes (styles,
  layout, strings), so every site looks like a sibling.
- `npm test` builds from `test/fixtures/<repo>/items.json`; refresh a fixture by copying a
  workshop's `dist/items.json` after `npm run build` there.
- Deployed by `.github/workflows/pages.yml` on push and daily. This repository must be public for
  GitHub Pages to serve it at https://tinwright.github.io.
