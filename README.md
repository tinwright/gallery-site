# tinwright.github.io

The [tinwright](https://github.com/tinwright) site, at https://tinwright.github.io: the gallery of
every workshop, and each workshop's own pages under it (`/ai-apprentice/`, `/cli-toolroll/`...), in
English, French and Spanish.

It has no tools of its own. It builds the whole site from a checkout of each workshop: the tools'
READMEs, screenshots and authors, plus each workshop's `scripts/site.mjs` for its nouns and install
steps. GitHub Pages rebuilds it on every push here, every hour, and from the **Run workflow** button
on the Actions tab.

```sh
npm install
npm test        # builds the site from the workshops next to this repo (~/tinwright/<repo>)
npm run dev     # the same, then serves it at http://localhost:3000
```

Without the workshops next to it, `npm run workshops` clones them into `.workshops/` first, as CI
does. To add a workshop, add it to `workshops` in [`site.config.js`](site.config.js).

## Licence

[MIT](LICENSE)
