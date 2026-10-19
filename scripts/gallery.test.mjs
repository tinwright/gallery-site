// The gallery lists every workshop, linking each tool into that workshop's part of the site, and
// lists a workshop it couldn't build without failing. A workshop's own nouns and hooks (from its
// scripts/site.mjs) show on its pages.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderDetail, renderGallery, renderHome } from './page.js';
import config from '../site.config.js';

/** @type {import('./items.mjs').Item} */
const ITEM = {
  name: 'tool',
  dir: '',
  title: 'Tool',
  readmes: { en: '# Tool\n\nDoes one thing.\n' },
  descriptions: { en: 'Does one thing.', fr: 'Fait une chose.' },
  hasScreenshot: false,
  sourceUrl: 'https://github.com/tinwright/workshop/tree/main/tools/tool',
};

test("each tool links to its page in its workshop's part of the site", () => {
  const html = renderGallery(config, [
    {
      title: 'workshop',
      tagline: 'Tools for things',
      url: '../workshop/fr/',
      repoUrl: 'https://github.com/tinwright/workshop',
      items: [{ ...ITEM, href: '../workshop/fr/tools/tool/', kicker: 'workshop' }],
    },
  ], 'fr');
  assert.match(html, /href="\.\.\/workshop\/fr\/tools\/tool\/"/);
  assert.match(html, /href="\.\.\/workshop\/fr\/">Voir workshop</);
  assert.match(html, /Fait une chose\./);
});

test("a workshop the build couldn't find is listed without tools, linking to its repo", () => {
  const html = renderGallery(config, [
    { title: 'app-lanterns', tagline: '', repoUrl: 'https://github.com/tinwright/app-lanterns', items: [] },
  ]);
  assert.match(html, /<h2 id="workshop-0">app-lanterns<\/h2>/);
  assert.match(html, /<div class="empty"><p>Its first tools are on their way\.<\/p><\/div>/);
  assert.match(html, /href="https:\/\/github\.com\/tinwright\/app-lanterns"/);
});

test("a workshop's nouns and hooks show on its pages", () => {
  /** @type {import('./page.js').Site} */
  const site = {
    title: 'workshop',
    tagline: 'Tools for things',
    languages: ['en', 'fr', 'es'],
    repoUrl: 'https://github.com/tinwright/workshop',
    itemsDir: 'tools',
    workshop: {
      nouns: { en: { allItems: 'All widgets', count: (/** @type {number} */ n) => `${n} widgets`, item: 'Widget' } },
      kicker: () => 'Gadget',
      card: (_site, item, _ctx, kit) => `<p class="card-command">${kit.escapeHTML(`<${item.name}>`)}</p>`,
      facts: () => '<dt>Size</dt><dd>Small</dd>',
      install: (_site, item, ctx, kit) => kit.commandHTML(ctx.lang, `install ${item.name}`),
    },
  };
  const home = renderHome(site, [ITEM]);
  assert.match(home, /All widgets/);
  assert.match(home, /1 widgets/);
  assert.match(home, /&lt;tool&gt;/);
  const detail = renderDetail(site, ITEM, [ITEM]);
  assert.match(detail, /<p class="kicker">Gadget<\/p>/);
  assert.match(detail, /<dt>Size<\/dt><dd>Small<\/dd>/);
  assert.match(detail, /install tool/);
  // A language the workshop has no nouns for falls back to its English ones.
  assert.match(renderHome(site, [ITEM], 'fr'), /All widgets/);
});

test('home pages end with an About section, linking a workshop back to the gallery', () => {
  const gallery = renderGallery(config, [], 'fr');
  assert.match(gallery, /<h2 id="about-title">À propos de tinwright<\/h2>/);
  assert.match(gallery, /href="https:\/\/github\.com\/tinwright">tinwright sur GitHub</);
  /** @type {import('./page.js').Site} */
  const site = { title: 'workshop', tagline: '', languages: ['en', 'fr'], repoUrl: '', itemsDir: 'tools', workshop: {} };
  assert.match(renderHome(site, [ITEM]), /href="\.\.\/">See every workshop</);
  assert.match(renderHome(site, [ITEM], 'fr'), /href="\.\.\/\.\.\/fr\/">Voir tous les ateliers</);
  // A workshop page rendered on its own has nowhere to link back to.
  assert.doesNotMatch(renderHome({ ...site, workshop: undefined }, [ITEM]), /See every workshop/);
});
