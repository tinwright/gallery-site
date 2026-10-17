#!/usr/bin/env node
// Builds the gallery into dist/: a home page in each language listing every workshop in
// site.config.js, each with the tools from its published items.json, every card linking to the
// tool's page on that workshop's site. A workshop whose site isn't published yet is shown without
// tools, so the build never fails on one.
//
// GALLERY_LOCAL=<folder> reads <folder>/<repo>/items.json, or <folder>/<repo>/dist/items.json,
// instead of fetching: GALLERY_LOCAL=~/tinwright npm run build after building the workshops.

import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR, languagesOf } from './items.mjs';
import { absoluteUrl, renderGallery } from './page.js';
import config from '../site.config.js';

const OUT_DIR = path.join(ROOT_DIR, 'dist');
const languages = languagesOf(config);

/**
 * A workshop's items.json, or undefined when it can't be had.
 * @param {{ repo: string, siteUrl: string }} workshop
 */
async function itemsOf(workshop) {
  const local = process.env.GALLERY_LOCAL;
  if (local) {
    const file = [path.join(local, workshop.repo, 'items.json'), path.join(local, workshop.repo, 'dist', 'items.json')].find(
      (candidate) => fs.existsSync(candidate),
    );
    return file ? JSON.parse(fs.readFileSync(file, 'utf8')) : undefined;
  }
  try {
    const response = await fetch(`${workshop.siteUrl}/items.json`, { signal: AbortSignal.timeout(15_000) });
    if (response.ok) return await response.json();
    console.warn(`${workshop.repo}: items.json answered ${response.status}; listing it without tools.`);
  } catch (error) {
    console.warn(`${workshop.repo}: couldn't fetch items.json (${/** @type {Error} */ (error).message}); listing it without tools.`);
  }
  return undefined;
}

const loaded = await Promise.all(config.workshops.map(async (workshop) => ({ workshop, data: await itemsOf(workshop) })));

/**
 * The workshops in one language.
 * @param {string} lang
 * @returns {import('./page.js').Workshop[]}
 */
const workshopsIn = (lang) =>
  loaded.map(({ workshop, data }) => {
    const base = `${workshop.siteUrl.replace(/\/+$/, '')}/`;
    const langBase = lang === (data?.languages?.[0] ?? 'en') || !data?.languages?.includes(lang) ? base : `${base}${lang}/`;
    return {
      title: data?.title ?? workshop.repo,
      tagline: data?.translations?.[lang]?.tagline ?? data?.tagline ?? '',
      url: langBase,
      repoUrl: data?.repoUrl ?? `https://github.com/tinwright/${workshop.repo}`,
      items: (data?.items ?? []).map((/** @type {any} */ item) => ({
        name: item.name,
        dir: '',
        title: item.title,
        readmes: {},
        descriptions: item.descriptions ?? {},
        hasScreenshot: Boolean(item.screenshot),
        sourceUrl: item.sourceUrl,
        href: new URL(item.page, langBase).href,
        screenshotUrl: item.screenshot ? new URL(item.screenshot, base).href : undefined,
        kicker: data.title,
      })),
    };
  });

fs.rmSync(OUT_DIR, { recursive: true, force: true });
for (const lang of languages) {
  const dir = lang === languages[0] ? OUT_DIR : path.join(OUT_DIR, lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderGallery({ ...config, hasFavicons: false }, workshopsIn(lang), lang));
}
fs.writeFileSync(
  path.join(OUT_DIR, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${languages.map((lang) => `  <url><loc>${absoluteUrl(config, lang, '')}</loc></url>`).join('\n')}
</urlset>
`,
);
fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl(config, languages[0], 'sitemap.xml')}\n`);

const count = loaded.reduce((sum, { data }) => sum + (data?.items?.length ?? 0), 0);
console.log(`Built dist/ in ${languages.join(', ')}: ${loaded.length} workshops, ${count} tools.`);
