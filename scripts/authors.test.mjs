// Authors come from GitHub noreply addresses in the git history (without a token), skip bots and
// plain emails, and show on the tool's page and its authors page as logins only.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { readAuthors } from './authors.mjs';
import { renderAuthors, renderDetail, renderHome } from './page.js';

/** A git repo with commits to tool/ by the given authors. @param {[string, string][]} authors */
function repoWith(authors) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'authors-'));
  const git = (/** @type {string[]} */ ...args) => execFileSync('git', args, { cwd: root, stdio: 'ignore' });
  git('init', '-q');
  fs.mkdirSync(path.join(root, 'tool'));
  authors.forEach(([name, email], i) => {
    fs.writeFileSync(path.join(root, 'tool', 'file.txt'), String(i));
    git('add', '.');
    git('-c', `user.name=${name}`, '-c', `user.email=${email}`, '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', `change ${i}`);
  });
  return root;
}

/** @type {import('./page.js').Site} */
const SITE = {
  title: 'Workshop',
  tagline: 'Tools',
  languages: ['en', 'fr', 'es'],
  repoUrl: 'https://github.com/owner/repo',
  itemsDir: 'tools',
};

/** @type {import('./items.mjs').Item} */
const ITEM = {
  name: 'tool',
  dir: '',
  title: 'Tool',
  readmes: { en: '# Tool\n\nDoes one thing.\n' },
  descriptions: { en: 'Does one thing.' },
  hasScreenshot: false,
  sourceUrl: 'https://github.com/owner/repo/tree/main/tools/tool',
};

test('authors are the logins of noreply addresses, most commits first, without bots', async () => {
  const root = repoWith([
    ['Ada Example', '1234+ada-example@users.noreply.github.com'],
    ['Bo Example', 'bo-example@users.noreply.github.com'],
    ['Ada Example', '1234+ada-example@users.noreply.github.com'],
    ['Someone', 'someone@example.com'],
    ['renovate[bot]', '29139614+renovate[bot]@users.noreply.github.com'],
  ]);
  /** @type {string[]} */
  const downloaded = [];
  const authors = await readAuthors(
    { repoUrl: 'https://github.com/owner/repo' },
    [{ name: 'tool', dir: path.join(root, 'tool') }],
    { root, outDir: root, env: {}, download: async (login) => (downloaded.push(login), null) },
  );
  assert.deepEqual(authors.tool, [
    { login: 'ada-example', commits: 2, avatar: null },
    { login: 'bo-example', commits: 1, avatar: null },
  ]);
  assert.deepEqual(downloaded, ['ada-example', 'bo-example']);
});

test("a tool's page links to its authors page, which names logins only", () => {
  const item = {
    ...ITEM,
    authors: [
      { login: 'ada-example', commits: 3, avatar: 'avatars/ada-example.png' },
      { login: 'bo-example', commits: 1, avatar: null },
    ],
  };
  const detail = renderDetail(SITE, item, [item]);
  assert.match(detail, /href="authors\/"/);
  assert.match(detail, /src="\.\.\/\.\.\/avatars\/ada-example\.png"/);
  const page = renderAuthors(SITE, item);
  assert.match(page, /href="https:\/\/github\.com\/ada-example"[^>]*>@ada-example</);
  assert.match(page, /@bo-example/);
  assert.match(page, /src="\.\.\/\.\.\/\.\.\/avatars\/ada-example\.png"/);

  const without = renderDetail(SITE, { ...ITEM, authors: [] }, [ITEM]);
  assert.doesNotMatch(without, /href="authors\/"/);
});

test("a tool's card says who made it, linking to its authors page", () => {
  const author = (/** @type {string} */ login) => ({ login, commits: 1, avatar: null });
  const card = (/** @type {string[]} */ logins) =>
    renderHome(SITE, [{ ...ITEM, authors: logins.map(author) }]).match(/<a class="byline"[^]*?<\/a>/)?.[0] ?? '';
  assert.match(card(['ada-example']), /href="tools\/tool\/authors\/"/);
  assert.match(card(['ada-example']), /Made by @ada-example</);
  assert.match(card(['ada-example', 'bo-example']), /Made by @ada-example and @bo-example</);
  assert.match(card(['ada-example', 'bo-example', 'cy-example']), /Made by @ada-example and 2 others</);
  assert.doesNotMatch(renderHome(SITE, [ITEM]), /class="byline"/);
});
