# tinwright.github.io

The [tinwright](https://github.com/tinwright) gallery, at https://tinwright.github.io: every
workshop and the tools in it, in English, French and Spanish.

It has no tools of its own. Each workshop's catalog site publishes an `items.json`, and the gallery
reads them all at build time, every day and on every push, linking each tool to its page on its
workshop's site.

```sh
npm install
npm test                                  # builds from the fixtures in test/fixtures
GALLERY_LOCAL=~/tinwright npm run dev     # preview with your local workshops (build each one first)
npm run dev                               # preview with the published workshops
```

Add a workshop to `workshops` in [`site.config.js`](site.config.js). The page shell in
`scripts/page.js` is the workshops' own, with `renderGallery` added, so the sites look like
siblings.

## Licence

[MIT](LICENSE)
