// The whole site builds from the workshops' checkouts: the gallery and each workshop's home page in
// every language, a page for every listed tool and none for hidden ones, and every link and image
// inside it leads somewhere that exists.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { ROOT_DIR, languagesOf } from './items.mjs';
import { itemsPath } from './page.js';
import { loadWorkshop } from './workshops.mjs';
import config from '../site.config.js';

const DIST = path.join(ROOT_DIR, 'dist');
const workshops = (await Promise.all(config.workshops.map(({ repo }) => loadWorkshop(repo)))).filter(
  (workshop) => workshop !== undefined,
);

/** @param {string} dir @returns {string[]} */
const htmlFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });

test('the site builds', () => {
  const build = spawnSync(process.execPath, ['scripts/build-site.mjs'], { cwd: ROOT_DIR, encoding: 'utf8' });
  assert.equal(build.status, 0, build.stderr || build.stdout);
});

test('every workshop listed in site.config.js has a checkout to build from', () => {
  const found = workshops.map((workshop) => workshop.repo);
  for (const { repo } of config.workshops) assert.ok(found.includes(repo), `no checkout of ${repo}; run npm run workshops`);
});

test("every workshop's site.config.js names its place on this site", () => {
  for (const { repo, config: workshopConfig } of workshops)
    assert.equal(workshopConfig.siteUrl, `${config.siteUrl}/${repo}`, `${repo}'s siteUrl`);
});

test('the gallery and every workshop have a home page in each language, and a page per listed tool', () => {
  const languages = languagesOf(config);
  for (const lang of languages)
    assert.ok(fs.existsSync(path.join(DIST, lang === languages[0] ? '' : lang, 'index.html')), `gallery ${lang}`);
  for (const { repo, config: workshopConfig, readItems } of workshops) {
    const workshopLanguages = languagesOf(workshopConfig);
    for (const lang of workshopLanguages) {
      const home = path.join(DIST, repo, lang === workshopLanguages[0] ? '' : lang);
      assert.ok(fs.existsSync(path.join(home, 'index.html')), `${repo} ${lang} home page`);
      for (const item of readItems(workshopConfig)) {
        const page = path.join(home, itemsPath(workshopConfig), item.name);
        if (workshopConfig.items?.[item.name]?.hidden) assert.ok(!fs.existsSync(page), `${repo}: hidden ${item.name} has a page`);
        else assert.ok(fs.existsSync(path.join(page, 'index.html')), `${repo} ${lang} page for ${item.name}`);
      }
    }
  }
});

test('every link and image inside the site exists, and only bookmarklets run script', () => {
  for (const file of htmlFiles(DIST)) {
    const html = fs.readFileSync(file, 'utf8');
    for (const [tag] of html.matchAll(/<[a-z]+\b[^>]*\s(?:href|src)="[^"]*"[^>]*>/g)) {
      const [, attribute, raw] = /** @type {RegExpMatchArray} */ (tag.match(/\s(href|src)="([^"]*)"/));
      const value = raw.replaceAll('&amp;', '&');
      const where = `${path.relative(DIST, file)}: ${attribute}="${value.slice(0, 60)}"`;
      if (/^javascript:/i.test(value)) {
        assert.match(tag, /^<a\s[^>]*class="[^"]*\bbookmarklet\b/, `${where} runs script`);
        continue;
      }
      if (/^(https?:|mailto:|data:|#|\/\/)/i.test(value) || value === '') continue;
      const target = path.resolve(path.dirname(file), decodeURIComponent(value.split(/[?#]/)[0]));
      const exists =
        fs.existsSync(target) &&
        (fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html')));
      assert.ok(exists, `${where} leads nowhere`);
    }
  }
});
