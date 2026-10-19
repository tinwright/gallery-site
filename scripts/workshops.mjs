#!/usr/bin/env node
// The workshops whose tools the site shows, each read from a checkout of its repo: in
// $WORKSHOPS_DIR if set, else .workshops/ (where `npm run workshops` clones them, as CI does), else
// next to this repo (~/tinwright/<repo>, where they live while you work on them).
//
// Run directly (`npm run workshops`), it clones or updates every workshop in site.config.js into
// .workshops/ and installs each one's dependencies, without running their install scripts.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROOT_DIR } from './items.mjs';
import config from '../site.config.js';

const CLONES = path.join(ROOT_DIR, '.workshops');

export const WORKSHOPS_DIR = process.env.WORKSHOPS_DIR
  ? path.resolve(process.env.WORKSHOPS_DIR)
  : fs.existsSync(CLONES)
    ? CLONES
    : path.dirname(ROOT_DIR);

/**
 * A workshop's checkout, loaded: its site.config.js, its scripts/site.mjs (nouns and page hooks),
 * its scripts/rules.mjs (build steps) and its readItems.
 * @typedef {{
 *   repo: string,
 *   dir: string,
 *   config: import('./items.mjs').SiteConfig,
 *   site: import('./page.js').WorkshopSite,
 *   rules: { beforeBuild?: () => unknown, afterBuild?: (build: { outDir: string, items: import('./items.mjs').Item[], site: import('./page.js').Site, languages: string[] }) => unknown },
 *   readItems: (config: import('./items.mjs').SiteConfig) => import('./items.mjs').Item[],
 * }} Workshop
 */

/**
 * The workshop `repo`, or undefined when there's no checkout of it.
 * @param {string} repo
 * @param {string} [dir]
 * @returns {Promise<Workshop | undefined>}
 */
export async function loadWorkshop(repo, dir = path.join(WORKSHOPS_DIR, repo)) {
  if (!fs.existsSync(path.join(dir, 'scripts', 'site.mjs'))) return undefined;
  const load = (/** @type {string} */ file) => import(pathToFileURL(path.join(dir, file)).href);
  const [siteConfig, site, rules, items] = await Promise.all([
    load('site.config.js'),
    load('scripts/site.mjs'),
    load('scripts/rules.mjs'),
    load('scripts/items.mjs'),
  ]);
  return { repo, dir, config: siteConfig.default, site, rules: rules.default ?? {}, readItems: items.readItems };
}

/** Clones or updates every workshop into .workshops/ and installs its dependencies. */
function cloneAll() {
  const run = (/** @type {string} */ command, /** @type {string[]} */ args, /** @type {string} */ cwd) => {
    const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed in ${cwd}`);
  };
  fs.mkdirSync(CLONES, { recursive: true });
  for (const { repo } of config.workshops) {
    const dir = path.join(CLONES, repo);
    if (fs.existsSync(dir)) run('git', ['pull', '--ff-only', '--quiet'], dir);
    else run('git', ['clone', '--quiet', `https://github.com/tinwright/${repo}.git`, dir], CLONES);
    run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--silent'], dir);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) cloneAll();
