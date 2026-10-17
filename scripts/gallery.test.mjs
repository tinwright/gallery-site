// The gallery builds in every language from the workshops' items.json, links each tool to its
// page on its workshop's site, and lists a workshop with no published site without failing.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { ROOT_DIR } from './items.mjs';

const DIST = path.join(ROOT_DIR, 'dist');
const read = (/** @type {string} */ file) => fs.readFileSync(path.join(DIST, file), 'utf8');

test('builds from the fixtures', () => {
  const build = spawnSync(process.execPath, ['scripts/build-gallery.mjs'], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    env: { ...process.env, GALLERY_LOCAL: path.join(ROOT_DIR, 'test', 'fixtures') },
  });
  assert.equal(build.status, 0, build.stderr);
});

test('each tool links to its page on its workshop site, in the same language', () => {
  assert.match(read('index.html'), /href="https:\/\/tinwright\.github\.io\/ai-apprentice\/plugins\/example\/"/);
  assert.match(read('fr/index.html'), /href="https:\/\/tinwright\.github\.io\/ai-apprentice\/fr\/plugins\/example\/"/);
  assert.match(read('es/index.html'), /Plugins, skills y mods para Claude Code/);
});

test('a workshop without a published site is listed, without tools', () => {
  const home = read('index.html');
  assert.match(home, /<h2 id="workshop-4">app-lanterns<\/h2>/);
  assert.match(home, /Its first tools are on their way\./);
  assert.match(home, /href="https:\/\/github\.com\/tinwright\/app-lanterns"/);
});

test('the only links inside the site lead to pages that exist', () => {
  for (const file of ['index.html', 'fr/index.html', 'es/index.html'])
    for (const [, value] of read(file).matchAll(/\shref="([^"]*)"/g)) {
      if (/^(https?:|mailto:|#|data:)/.test(value)) continue;
      const target = path.resolve(path.dirname(path.join(DIST, file)), value);
      assert.ok(fs.existsSync(path.join(target, 'index.html')) || fs.existsSync(target), `${file}: ${value}`);
    }
});
