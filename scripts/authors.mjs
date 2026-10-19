// Who made each tool, for the catalog site: the GitHub accounts behind the commits that touched its
// folder, most commits first. With GITHUB_TOKEN set (the Pages workflow sets it), they come from the
// GitHub API, which matches commit emails to accounts. Without it, or if the API can't answer, they
// come from the local git history, where only GitHub noreply addresses
// (<id>+<login>@users.noreply.github.com) name an account. Names and emails never leave this file:
// the site shows logins only. Each avatar is downloaded into the site, so a visitor's browser never
// contacts GitHub.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/** @typedef {{ login: string, commits: number, avatar: string | null }} Author `avatar` is a path from the site's root, or null when it couldn't be downloaded. */

const NOREPLY = /^(?:\d+\+)?([A-Za-z0-9-]+)@users\.noreply\.github\.com$/i;
const isBot = (/** @type {string} */ login) => /\[bot\]$/i.test(login);

/** "owner/repo" from a GitHub URL, or undefined. @param {string} url */
const repoSlug = (url) => url.match(/github\.com\/([^/]+\/[^/#?]+?)(?:\.git)?\/?$/)?.[1];

/**
 * Commits per login for `dir`, from the GitHub API.
 * @param {string} slug @param {string} dir @param {string} token
 */
async function countFromApi(slug, dir, token) {
  /** @type {Map<string, number>} */
  const counts = new Map();
  for (let page = 1; ; page++) {
    const url = `https://api.github.com/repos/${slug}/commits?path=${encodeURIComponent(dir)}&per_page=100&page=${page}`;
    const response = await fetch(url, {
      headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`the GitHub API answered ${response.status}`);
    const commits = await response.json();
    for (const commit of commits) {
      const login = commit.author?.login;
      if (login) counts.set(login, (counts.get(login) ?? 0) + 1);
    }
    if (commits.length < 100) return counts;
  }
}

/**
 * Commits per login for `dir`, from the local git history's noreply addresses.
 * @param {string} root @param {string} dir
 */
function countFromGit(root, dir) {
  /** @type {Map<string, number>} */
  const counts = new Map();
  let log = '';
  try {
    log = execFileSync('git', ['log', '--format=%ae', '--', dir], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return counts;
  }
  for (const email of log.split('\n')) {
    const login = email.trim().match(NOREPLY)?.[1];
    if (login) counts.set(login, (counts.get(login) ?? 0) + 1);
  }
  return counts;
}

/**
 * Saves `login`'s avatar to <outDir>/avatars/, returning its path from the site's root, or null.
 * @param {string} login @param {string} outDir
 */
export async function downloadAvatar(login, outDir) {
  try {
    const response = await fetch(`https://github.com/${encodeURIComponent(login)}.png?size=112`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return null;
    const file = `avatars/${login}.${response.headers.get('content-type')?.includes('png') ? 'png' : 'jpg'}`;
    fs.mkdirSync(path.join(outDir, 'avatars'), { recursive: true });
    fs.writeFileSync(path.join(outDir, file), Buffer.from(await response.arrayBuffer()));
    return file;
  } catch {
    return null;
  }
}

/**
 * Every item's authors, keyed by item name.
 * @param {{ repoUrl: string }} config
 * @param {{ name: string, dir: string }[]} items
 * @param {{ root: string, outDir: string, env?: Record<string, string | undefined>, download?: typeof downloadAvatar }} options
 * @returns {Promise<Record<string, Author[]>>}
 */
export async function readAuthors(config, items, { root, outDir, env = process.env, download = downloadAvatar }) {
  const slug = repoSlug(config.repoUrl);
  let useApi = Boolean(env.GITHUB_TOKEN && slug);
  /** @type {Map<string, string | null>} */
  const avatars = new Map();
  /** @type {Record<string, Author[]>} */
  const result = {};
  for (const item of items) {
    const dir = path.relative(root, item.dir).split(path.sep).join('/');
    let counts;
    if (useApi) {
      try {
        counts = await countFromApi(/** @type {string} */ (slug), dir, /** @type {string} */ (env.GITHUB_TOKEN));
      } catch (error) {
        useApi = false;
        console.warn(`Authors: ${/** @type {Error} */ (error).message}; using the local git history.`);
      }
    }
    counts ??= countFromGit(root, dir);
    const sorted = [...counts]
      .filter(([login]) => !isBot(login))
      .sort(([a, x], [b, y]) => y - x || a.localeCompare(b));
    for (const [login] of sorted) if (!avatars.has(login)) avatars.set(login, await download(login, outDir));
    result[item.name] = sorted.map(([login, commits]) => ({ login, commits, avatar: avatars.get(login) ?? null }));
  }
  return result;
}
