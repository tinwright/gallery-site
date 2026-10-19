#!/usr/bin/env node
// Builds the whole tinwright site into dist/: the gallery's home page, and under <repo>/ each
// workshop's home page, a page per tool and an authors page per tool, in every language. Each
// workshop comes from a checkout of its repo (see workshops.mjs): its scripts/site.mjs gives its
// nouns and what its pages add, and its scripts/rules.mjs can run a step before (minifying
// bookmarklets) and add files after (an app to run, an extension's update manifest). A workshop
// without a checkout is listed without tools, so the build never fails on one.
//
// Deployed to GitHub Pages by .github/workflows/pages.yml: on pushes here, hourly, and by hand.

import fs from 'node:fs';
import path from 'node:path';
import { readAuthors } from './authors.mjs';
import { ROOT_DIR, languagesOf } from './items.mjs';
import {
  SUPPORTED_LANGUAGES,
  absoluteUrl,
  itemsPath,
  renderAuthors,
  renderDetail,
  renderGallery,
  renderHome,
} from './page.js';
import { WORKSHOPS_DIR, loadWorkshop } from './workshops.mjs';
import config from '../site.config.js';

const OUT_DIR = path.join(ROOT_DIR, 'dist');
const ICONS = ['favicon-32.png', 'apple-touch-icon.png'];
const SITE_URL = config.siteUrl.replace(/\/+$/, '');
const languages = languagesOf(config);

/** @param {string} where @param {string[]} langs */
function requireStrings(where, langs) {
  const missing = langs.filter((lang) => !SUPPORTED_LANGUAGES.includes(lang));
  if (!missing.length) return;
  console.error(`${where}: no strings for ${missing.join(', ')}; add a set to STRINGS in scripts/page.js.`);
  process.exit(1);
}

/** The folder of `lang`'s pages: the default language at the root, the others in their own. */
const langDir = (/** @type {string} */ root, /** @type {string[]} */ langs, /** @type {string} */ lang) =>
  lang === langs[0] ? root : path.join(root, lang);

/** Absolute URLs of every page built, for the sitemap. @type {string[]} */
const urls = [];

/**
 * Builds one workshop's pages into dist/<repo>/.
 * @param {import('./workshops.mjs').Workshop} workshop
 */
async function buildWorkshop({ repo, dir, config: workshopConfig, site: hooks, rules, readItems }) {
  const outDir = path.join(OUT_DIR, repo);
  const workshopLanguages = languagesOf(workshopConfig);
  requireStrings(repo, workshopLanguages);

  // A step before its tools are read (minifying bookmarklets...).
  await rules.beforeBuild?.();

  fs.mkdirSync(path.join(outDir, 'screenshots'), { recursive: true });
  const hasFavicons = ICONS.every((icon) => fs.existsSync(path.join(dir, 'site', icon)));
  if (hasFavicons) for (const icon of ICONS) fs.copyFileSync(path.join(dir, 'site', icon), path.join(outDir, icon));

  /** @type {import('./page.js').Site} */
  const site = { ...workshopConfig, siteUrl: `${SITE_URL}/${repo}`, hasFavicons, workshop: hooks };
  // Tools marked `hidden` in its site.config.js (the template's example) stay off the site.
  const items = readItems(workshopConfig).filter((item) => !workshopConfig.items?.[item.name]?.hidden);
  for (const item of items)
    if (item.hasScreenshot)
      fs.copyFileSync(path.join(item.dir, 'screenshot.png'), path.join(outDir, 'screenshots', `${item.name}.png`));

  // Who made each tool, with their avatars saved into dist/<repo>/avatars/ (see authors.mjs).
  const authors = await readAuthors(workshopConfig, items, { root: dir, outDir });
  for (const item of items) item.authors = authors[item.name];

  for (const lang of workshopLanguages) {
    const home = langDir(outDir, workshopLanguages, lang);
    fs.mkdirSync(home, { recursive: true });
    fs.writeFileSync(path.join(home, 'index.html'), renderHome(site, items, lang));
    urls.push(/** @type {string} */ (absoluteUrl(site, lang, '')));
    for (const item of items) {
      const page = `${itemsPath(site)}/${encodeURIComponent(item.name)}/`;
      const pageDir = path.join(home, itemsPath(site), item.name);
      fs.mkdirSync(pageDir, { recursive: true });
      fs.writeFileSync(path.join(pageDir, 'index.html'), renderDetail(site, item, items, lang));
      urls.push(/** @type {string} */ (absoluteUrl(site, lang, page)));
      if (item.authors?.length) {
        fs.mkdirSync(path.join(pageDir, 'authors'), { recursive: true });
        fs.writeFileSync(path.join(pageDir, 'authors', 'index.html'), renderAuthors(site, item, lang));
        urls.push(/** @type {string} */ (absoluteUrl(site, lang, `${page}authors/`)));
      }
    }
  }

  // Its own files next to the pages (an app to run, an extension's update manifest...).
  await rules.afterBuild?.({ outDir, items, site, languages: workshopLanguages });
  return { repo, site, items, languages: workshopLanguages };
}

requireStrings('site.config.js', languages);
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

/** @type {{ repo: string, site?: import('./page.js').Site, items: import('./items.mjs').Item[], languages: string[] }[]} */
const built = [];
for (const { repo } of config.workshops) {
  const workshop = await loadWorkshop(repo);
  if (!workshop) console.warn(`${repo}: no checkout in ${WORKSHOPS_DIR}; listing it without tools.`);
  built.push(workshop ? await buildWorkshop(workshop) : { repo, items: [], languages: [] });
}

// The gallery's home page: every workshop, each with its tools, linking into its part of the site.
const galleryUrls = [];
for (const lang of languages) {
  const up = lang === languages[0] ? '' : '../';
  /** @type {import('./page.js').GallerySection[]} */
  const sections = built.map(({ repo, site, items, languages: workshopLanguages }) => {
    const repoUrl = site?.repoUrl ?? `https://github.com/tinwright/${repo}`;
    if (!site) return { title: repo, tagline: '', repoUrl, items: [] };
    const base = `${up}${repo}/`;
    const url = `${base}${lang !== workshopLanguages[0] && workshopLanguages.includes(lang) ? `${lang}/` : ''}`;
    const text = (/** @type {'title' | 'tagline'} */ field) =>
      (lang !== workshopLanguages[0] && site.translations?.[lang]?.[field]) || site[field];
    return {
      title: text('title'),
      tagline: text('tagline'),
      url,
      repoUrl,
      items: items.map((item) => ({
        ...item,
        href: `${url}${itemsPath(site)}/${encodeURIComponent(item.name)}/`,
        screenshotUrl: item.hasScreenshot ? `${base}screenshots/${encodeURIComponent(item.name)}.png` : undefined,
        kicker: text('title'),
        // Avatars are saved under the workshop's part of the site.
        authors: item.authors?.map((author) => ({ ...author, avatar: author.avatar && `${repo}/${author.avatar}` })),
      })),
    };
  });
  const dir = langDir(OUT_DIR, languages, lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderGallery({ ...config, hasFavicons: false }, sections, lang));
  galleryUrls.push(absoluteUrl(config, lang, ''));
}

const sitemap = [...galleryUrls, ...urls];
fs.writeFileSync(
  path.join(OUT_DIR, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`,
);
fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl(config, languages[0], 'sitemap.xml')}\n`);

const tools = built.reduce((sum, workshop) => sum + workshop.items.length, 0);
console.log(
  `Built dist/ in ${languages.join(', ')}: ${built.length} workshops, ${tools} ${tools === 1 ? 'tool' : 'tools'}, ${sitemap.length} pages.`,
);
