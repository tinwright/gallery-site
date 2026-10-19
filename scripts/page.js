import { Marked } from 'marked';
import { isLanguageLinks, languagesOf, plainText } from './items.mjs';

/**
 * @typedef {import('./items.mjs').Item} Item
 * @typedef {import('./items.mjs').SiteConfig & { hasFavicons?: boolean, workshop?: WorkshopSite }} Site
 *
 * A workshop's scripts/site.mjs: its nouns, and what its pages add. Each hook gets KIT, the helpers
 * below, and returns HTML; escape anything from the repo with kit.escapeHTML().
 * @typedef {{
 *   nouns?: Record<string, Record<string, any>>,
 *   kicker?: (item: Item, lang: Lang) => string | undefined,
 *   card?: (site: Site, item: Item, ctx: Ctx, kit: typeof KIT) => string,
 *   facts?: (site: Site, item: Item, ctx: Ctx, kit: typeof KIT) => string,
 *   install?: (site: Site, item: Item, ctx: Ctx, kit: typeof KIT) => string,
 * }} WorkshopSite
 *
 * A language code from site.config.js `languages`, with its strings in STRINGS.
 * @typedef {string} Lang
 *
 * Where a page sits: `root` leads back to dist/ (shared assets), `home` to its language's home.
 * @typedef {{ lang: Lang, root: string, home: string }} Ctx
 */

/**
 * The site's own text, one set per language. `name` is the language's own name, shown in the
 * language switch. On a workshop's pages, the nouns (item, allItems, count, back, moreItems and
 * the empty state) come from that workshop's scripts/site.mjs `nouns` instead. To add a language,
 * add a set here, and nouns in every workshop; the build stops on a language with no set.
 */
const STRINGS = {
  en: {
    htmlLang: 'en',
    name: 'English',
    anchorLabel: 'Link to this section',
    screenshotOf: 'Screenshot of',
    item: 'Tool',
    allItems: 'All tools',
    count: (/** @type {number} */ n) => `${n} ${n === 1 ? 'tool' : 'tools'}`,
    emptyTitle: 'No tools yet',
    emptyText: 'The first ones are on their way. Watch the repository on GitHub to hear when they land.',
    emptyAction: 'Watch on GitHub',
    authors: 'Authors',
    authorCount: (/** @type {number} */ n) => `${n} ${n === 1 ? 'author' : 'authors'}`,
    authorsOf: (/** @type {string} */ title) => `Who made ${title}`,
    authorsLede: (/** @type {string} */ title) => `Everyone whose commits shaped ${title}, most commits first.`,
    madeBy: (/** @type {string[]} */ [first, second, ...rest]) =>
      `Made by ${first}${rest.length ? ` and ${rest.length + 1} others` : second ? ` and ${second}` : ''}`,
    commitCount: (/** @type {number} */ n) => `${n} ${n === 1 ? 'commit' : 'commits'}`,
    back: '← All tools',
    atAGlance: 'At a glance',
    viewSource: 'View source',
    copyForClaude: 'Copy for Claude',
    copyHint: 'Copies this README as markdown, to paste into Claude.',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    moreItems: 'More tools',
    untranslated: 'This guide isn\'t translated into English yet. Here is the original version.',
    license: (/** @type {string} */ name) => `Open source, ${name} licence`,
    reportIssue: 'Report an issue',
    aboutTitle: 'About tinwright',
    about: [
      'Small, free, open-source tools, made the way a tinwright made pots and lanterns: one at a time, by hand, to do one job well.',
      'Each kind of tool has its own workshop: a repository with real tests, and a guide that teaches Claude to build the next tool in a sitting. Every tool collects no data and asks for as few permissions as it can.',
    ],
    allWorkshops: 'See every workshop',
    onGitHub: 'tinwright on GitHub',
  },
  fr: {
    htmlLang: 'fr',
    name: 'Français',
    anchorLabel: 'Lien vers cette section',
    screenshotOf: "Capture d'écran de",
    item: 'Outil',
    allItems: 'Tous les outils',
    count: (/** @type {number} */ n) => `${n} ${n === 1 ? 'outil' : 'outils'}`,
    emptyTitle: 'Pas encore d’outils',
    emptyText: 'Les premiers arrivent bientôt. Suivez le dépôt sur GitHub pour savoir quand ils seront là.',
    emptyAction: 'Suivre sur GitHub',
    authors: 'Auteurs',
    authorCount: (/** @type {number} */ n) => `${n} ${n === 1 ? 'auteur' : 'auteurs'}`,
    authorsOf: (/** @type {string} */ title) => `Qui a fait ${title}`,
    authorsLede: (/** @type {string} */ title) => `Toutes les personnes dont les commits ont façonné ${title}, de la plus active à la moins active.`,
    madeBy: (/** @type {string[]} */ [first, second, ...rest]) =>
      `Fait par ${first}${rest.length ? ` et ${rest.length + 1} autres` : second ? ` et ${second}` : ''}`,
    commitCount: (/** @type {number} */ n) => `${n} ${n === 1 ? 'commit' : 'commits'}`,
    back: '← Tous les outils',
    atAGlance: 'En bref',
    viewSource: 'Voir le code source',
    copyForClaude: 'Copier pour Claude',
    copyHint: 'Copie ce guide au format Markdown, à coller dans Claude.',
    copy: 'Copier',
    copied: 'Copié',
    copyFailed: 'Échec de la copie',
    moreItems: 'Autres outils',
    untranslated: "Ce guide n'est pas encore traduit en français. Voici la version d'origine.",
    license: (/** @type {string} */ name) => `Open source, licence ${name}`,
    reportIssue: 'Signaler un problème',
    aboutTitle: 'À propos de tinwright',
    about: [
      'De petits outils gratuits et open source, faits comme un ferblantier faisait ses pots et ses lanternes : un à la fois, à la main, pour bien faire une chose.',
      'Chaque type d’outil a son atelier : un dépôt avec de vrais tests et un guide qui apprend à Claude à fabriquer l’outil suivant en une séance. Aucun outil ne collecte de données, et chacun demande aussi peu d’autorisations que possible.',
    ],
    allWorkshops: 'Voir tous les ateliers',
    onGitHub: 'tinwright sur GitHub',
  },
  es: {
    htmlLang: 'es',
    name: 'Español',
    anchorLabel: 'Enlace a esta sección',
    screenshotOf: 'Captura de pantalla de',
    item: 'Herramienta',
    allItems: 'Todas las herramientas',
    count: (/** @type {number} */ n) => `${n} ${n === 1 ? 'herramienta' : 'herramientas'}`,
    emptyTitle: 'Todavía no hay herramientas',
    emptyText: 'Las primeras están en camino. Sigue el repositorio en GitHub para enterarte cuando lleguen.',
    emptyAction: 'Seguir en GitHub',
    authors: 'Autores',
    authorCount: (/** @type {number} */ n) => `${n} ${n === 1 ? 'autor' : 'autores'}`,
    authorsOf: (/** @type {string} */ title) => `Quién hizo ${title}`,
    authorsLede: (/** @type {string} */ title) => `Todas las personas cuyos commits dieron forma a ${title}, de más a menos commits.`,
    madeBy: (/** @type {string[]} */ [first, second, ...rest]) =>
      `Hecho por ${first}${rest.length ? ` y ${rest.length + 1} más` : second ? ` y ${second}` : ''}`,
    commitCount: (/** @type {number} */ n) => `${n} ${n === 1 ? 'commit' : 'commits'}`,
    back: '← Todas las herramientas',
    atAGlance: 'De un vistazo',
    viewSource: 'Ver el código fuente',
    copyForClaude: 'Copiar para Claude',
    copyHint: 'Copia esta guía en Markdown, para pegarla en Claude.',
    copy: 'Copiar',
    copied: 'Copiado',
    copyFailed: 'No se pudo copiar',
    moreItems: 'Más herramientas',
    untranslated: 'Esta guía aún no está traducida al español. Esta es la versión original.',
    license: (/** @type {string} */ name) => `Código abierto, licencia ${name}`,
    reportIssue: 'Informar de un problema',
    aboutTitle: 'Sobre tinwright',
    about: [
      'Pequeñas herramientas gratuitas y de código abierto, hechas como un hojalatero hacía sus ollas y faroles: una a una, a mano, para hacer bien una cosa.',
      'Cada tipo de herramienta tiene su taller: un repositorio con pruebas de verdad y una guía que enseña a Claude a construir la siguiente herramienta de una sentada. Ninguna recopila datos, y cada una pide los menos permisos posibles.',
    ],
    allWorkshops: 'Ver todos los talleres',
    onGitHub: 'tinwright en GitHub',
  },
};

/** The languages this file has strings for; build-site.mjs checks each config against it. */
export const SUPPORTED_LANGUAGES = Object.keys(STRINGS);

/**
 * The strings in `lang`, with the nouns of the workshop whose pages these are.
 * @param {Lang} lang @param {Site} [site]
 */
const stringsOf = (lang, site) => ({
  ...(STRINGS[/** @type {keyof typeof STRINGS} */ (lang)] ?? STRINGS.en),
  ...(site?.workshop?.nouns?.[lang] ?? site?.workshop?.nouns?.en),
});

/** @param {Site} site */
const defaultLanguage = (site) => languagesOf(site)[0];

/**
 * Site text in `lang`, from site.config.js `translations`, else the default language's.
 * @param {Site} site
 * @param {Lang} lang
 * @param {'title' | 'tagline' | 'intro' | 'badge'} field
 */
const siteText = (site, lang, field) =>
  (lang !== defaultLanguage(site) && site.translations?.[lang]?.[field]) || site[field];

/**
 * A page's absolute URL under site.config.js `siteUrl`, or undefined without one.
 * @param {Site} site
 * @param {Lang} lang
 * @param {string} otherPath the page's path from its language's home
 */
export const absoluteUrl = (site, lang, otherPath) =>
  site.siteUrl &&
  `${site.siteUrl.replace(/\/+$/, '')}/${lang === defaultLanguage(site) ? '' : `${lang}/`}${otherPath}`;

/**
 * How far a page sits below dist/: the default language's pages at the root, the others in a
 * folder named after the language.
 * @param {Site} site
 * @param {Lang} lang
 * @param {number} depth folders below its language's home (0 for the home page)
 */
const rootOf = (site, lang, depth) =>
  '../'.repeat(depth + (lang === defaultLanguage(site) ? 0 : 1));

// ---------------------------------------------------------------------------------------------
// Extension points: each workshop's scripts/site.mjs fills these in for its own pages.
// ---------------------------------------------------------------------------------------------

/** The gallery's own words, per language. */
const WORDS = {
  en: {
    workshops: 'Workshops',
    visit: (/** @type {string} */ title) => `Visit ${title}`,
    soon: 'Its first tools are on their way.',
    tools: (/** @type {number} */ n) => `${n} tool${n === 1 ? '' : 's'}`,
  },
  fr: {
    workshops: 'Ateliers',
    visit: (/** @type {string} */ title) => `Voir ${title}`,
    soon: 'Ses premiers outils arrivent bientôt.',
    tools: (/** @type {number} */ n) => `${n} outil${n === 1 ? '' : 's'}`,
  },
  es: {
    workshops: 'Talleres',
    visit: (/** @type {string} */ title) => `Ver ${title}`,
    soon: 'Sus primeras herramientas están en camino.',
    tools: (/** @type {number} */ n) => `${n} herramienta${n === 1 ? '' : 's'}`,
  },
};
/** @param {Lang} lang */
const wordsOf = (lang) => WORDS[/** @type {keyof typeof WORDS} */ (lang)] ?? WORDS.en;

/**
 * The small label above a tool's title: `kicker` from site.config.js, else the workshop's own
 * (a plugin's category, an extension's browsers...), else the gallery's (the workshop's name), else
 * its noun.
 * @param {Site} site
 * @param {Item} item
 * @param {Lang} lang
 */
function kickerOf(site, item, lang) {
  const overrides = site.items?.[item.name];
  return (
    overrides?.translations?.[lang]?.kicker ||
    overrides?.kicker ||
    site.workshop?.kicker?.(item, lang) ||
    item.kicker ||
    stringsOf(lang, site).item
  );
}

/** Extra lines at the bottom of a home card. @param {Site} site @param {Item} item @param {Ctx} ctx */
const extraCardHTML = (site, item, ctx) => site.workshop?.card?.(site, item, ctx, KIT) ?? '';

/** `<dt>`/`<dd>` pairs for the "At a glance" box. @param {Site} site @param {Item} item @param {Ctx} ctx */
const factsHTML = (site, item, ctx) => site.workshop?.facts?.(site, item, ctx, KIT) ?? '';

/** How to install or run the tool, in the "At a glance" box. @param {Site} site @param {Item} item @param {Ctx} ctx */
const extraDetailHTML = (site, item, ctx) => site.workshop?.install?.(site, item, ctx, KIT) ?? '';

// ---------------------------------------------------------------------------------------------

export const escapeHTML = (text) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      /** @type {Record<string, string>} */ ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char],
  );

/**
 * Text as JSON that is safe inside a <script> element: `<` is escaped so the text cannot close it.
 * @param {string} text
 */
const scriptJSON = (text) => JSON.stringify(text).replace(/</g, '\\u003c');

/** @param {Site} site @param {Lang} lang */
const siteTitle = (site, lang) => siteText(site, lang, 'title');
/** @param {Site} site @param {Lang} lang */
const siteTagline = (site, lang) => siteText(site, lang, 'tagline');

/** The folder detail pages live in, named after the items' own folder. @param {Site} site */
export const itemsPath = (site) => site.itemsDir.split('/').filter(Boolean).pop() ?? 'items';

/** @param {Site} site @param {Item} item */
const pageHref = (site, item) => `${itemsPath(site)}/${encodeURIComponent(item.name)}/`;

/** @param {Item} item */
const screenshotSrc = (item) => `screenshots/${encodeURIComponent(item.name)}.png`;

/**
 * The README to show in `lang`, falling back to the default language's.
 * @param {Site} site @param {Item} item @param {Lang} lang
 */
const readmeOf = (site, item, lang) => item.readmes[lang] ?? item.readmes[defaultLanguage(site)] ?? '';

/** @param {Site} site @param {Item} item @param {Lang} lang */
const descriptionOf = (site, item, lang) =>
  item.descriptions[lang] || item.descriptions[defaultLanguage(site)] || '';

/**
 * A button that copies text. `text` is copied as is; `source` names a JSON <script> holding it.
 * All three labels share one grid cell, so the button keeps the width of the longest.
 * @param {Lang} lang
 * @param {{ label: string, text?: string, source?: string, className?: string, describedBy?: string }} options
 */
export function copyButton(lang, { label, text, source, className = 'button copy', describedBy }) {
  const t = stringsOf(lang);
  const data = source ? `data-copy="${source}"` : `data-copy-text="${escapeHTML(text ?? '')}"`;
  return `<button class="${className}" type="button" ${data} data-state="idle"${describedBy ? ` aria-describedby="${describedBy}"` : ''}>
      <span class="copy-label" data-for="idle">${label}</span>
      <span class="copy-label" data-for="copied"><svg class="check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" /></svg>${t.copied}</span>
      <span class="copy-label" data-for="failed">${t.copyFailed}</span>
    </button>`;
}

/** A command on one line with its own copy button. @param {Lang} lang @param {string} command */
export const commandHTML = (lang, command) =>
  `<div class="command"><code>${escapeHTML(command)}</code>${copyButton(lang, { label: stringsOf(lang).copy, text: command, className: 'copy copy-small' })}</div>`;

/**
 * The README as HTML, minus what the page header already shows: the title, the language link and
 * the description paragraph. Relative links point at the file on GitHub. Without a README in a
 * language, that language's page shows the default language's README under a note.
 * @param {Site} site
 * @param {Item} item
 * @param {Lang} lang
 */
export function readmeHTML(site, item, lang) {
  const base = `${item.sourceUrl.replace('/tree/', '/blob/')}/`;
  const repoBase = `${site.repoUrl}/blob/${site.branch ?? 'main'}/`;
  const resolve = (/** @type {string} */ href, /** @type {boolean} */ image) => {
    if (/^(https?:|mailto:|#|\/\/)/i.test(href)) return href;
    // Any other scheme (javascript:, data:...) could run script from a README.
    if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return '#';
    const url = href.startsWith('/')
      ? new URL(href.slice(1), repoBase)
      : new URL(href, base);
    if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return '#';
    return image ? url.href.replace('/blob/', '/raw/') : url.href;
  };

  // GitHub-style heading ids (`## Install` → `#install`), so README anchors and links to a
  // section of the page work, plus a "#" link to copy them.
  /** @type {Map<string, number>} */
  const slugCounts = new Map();
  const marked = new Marked({
    gfm: true,
    renderer: {
      // READMEs are reviewed, but raw HTML in one would still run on the site: show it as text.
      html({ text }) {
        return escapeHTML(text);
      },
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        const slug =
          html
            .replace(/<[^>]*>/g, '')
            .replace(/&(amp|lt|gt|quot|#39);/g, '')
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s_-]/gu, '')
            .trim()
            .replace(/\s/g, '-') || 'section';
        let count = slugCounts.get(slug) ?? 0;
        let id = count ? `${slug}-${count}` : slug;
        while (
          slugCounts.has(id) ||
          ['site-copy-hint', 'site-readme-markdown', 'more-title'].includes(id)
        ) {
          id = `${slug}-${++count}`;
        }
        slugCounts.set(slug, count + 1);
        slugCounts.set(id, 1);
        return `<h${depth} id="${id}">${html}<a class="anchor" href="#${id}" aria-label="${stringsOf(lang).anchorLabel}">#</a></h${depth}>\n`;
      },
    },
  });

  const fallback = !item.readmes[lang];
  const readme = readmeOf(site, item, lang);
  const description = descriptionOf(site, item, fallback ? defaultLanguage(site) : lang);
  const tokens = marked.lexer(readme.replace(/<!--[\s\S]*?-->/g, ''));
  const title = tokens.findIndex((token) => token.type === 'heading');
  if (tokens[title]?.type === 'heading' && tokens[title].depth === 1) tokens.splice(title, 1);
  let lead = true;
  const kept = tokens.filter((token) => {
    if (token.type === 'paragraph' && isLanguageLinks(token.text)) return false;
    // A row of badges above the description isn't the description.
    if (token.type === 'space' || !lead || (token.type === 'paragraph' && !plainText(token.text)))
      return true;
    lead = false;
    return !(token.type === 'paragraph' && plainText(token.text) === description);
  });
  // Only marked.parse() runs walkTokens on its own; lexer() + parser() don't.
  marked.walkTokens(kept, (token) => {
    if (token.type === 'link' || token.type === 'image') {
      token.href = resolve(token.href, token.type === 'image');
    }
  });
  const html = marked.parser(/** @type {any} */ (Object.assign(kept, { links: tokens.links })));
  return fallback
    ? `<p class="untranslated">${escapeHTML(stringsOf(lang).untranslated)}</p>\n<div lang="${stringsOf(defaultLanguage(site)).htmlLang}">${html}</div>`
    : html;
}

/**
 * The item's screenshot, or a placeholder with its initial so a grid's cards line up.
 * @param {Site} site
 * @param {Item} item
 * @param {Ctx} ctx
 * @param {string} className
 */
function screenshotHTML(site, item, ctx, className) {
  if (!item.hasScreenshot) {
    return `<div class="${className} placeholder" aria-hidden="true"><span>${escapeHTML(item.title.charAt(0))}</span></div>`;
  }
  const focus = site.items?.[item.name]?.focus;
  const style = focus ? ` style="object-position: ${escapeHTML(focus)}"` : '';
  return `<img class="${className}" src="${item.screenshotUrl ?? `${ctx.root}${screenshotSrc(item)}`}" alt="${escapeHTML(`${stringsOf(ctx.lang).screenshotOf} ${item.title}`)}"${style} loading="lazy" />`;
}

/**
 * @param {Site} site
 * @param {Item} item
 * @param {Ctx} ctx
 * @param {boolean} withMedia whether any card in the grid has a screenshot
 */
export function cardHTML(site, item, ctx, withMedia) {
  const href = item.href ?? `${ctx.home}${pageHref(site, item)}`;
  const description = descriptionOf(site, item, ctx.lang);
  return `<li class="card">
      ${withMedia ? `<a class="card-media" href="${href}" tabindex="-1" aria-hidden="true">${screenshotHTML(site, item, ctx, 'card-image')}</a>` : ''}
      <p class="kicker">${escapeHTML(kickerOf(site, item, ctx.lang))}</p>
      <h3 class="card-title"><a href="${href}">${escapeHTML(item.title)}</a></h3>
      ${description ? `<p class="card-text">${escapeHTML(description)}</p>` : ''}
      ${extraCardHTML(site, item, ctx)}
      ${bylineHTML(item, href, ctx)}
    </li>`;
}

/**
 * A card's quiet "Made by" line: the first author's avatar and login, linking to the tool's authors page.
 * @param {Item} item @param {string} href the tool's page @param {Ctx} ctx
 */
function bylineHTML(item, href, ctx) {
  const authors = item.authors ?? [];
  if (!authors.length) return '';
  const logins = authors.map((author) => `@${author.login}`);
  return `<a class="byline" href="${href}authors/">${avatarHTML(authors[0], ctx, 20)}<span>${escapeHTML(stringsOf(ctx.lang).madeBy(logins))}</span></a>`;
}

/** @param {Site} site @param {Item[]} items @param {Ctx} ctx */
const gridHTML = (site, items, ctx) => {
  const withMedia = items.some((item) => item.hasScreenshot);
  return `<ul class="grid">${items.map((item) => cardHTML(site, item, ctx, withMedia)).join('')}</ul>`;
};

/**
 * What the home page shows before the first tool is listed.
 * @param {Site} site @param {ReturnType<typeof stringsOf>} t
 */
const emptyHTML = (site, t) => `<div class="empty">
          <p class="empty-title">${t.emptyTitle}</p>
          <p>${t.emptyText}</p>
          <a class="button button-secondary" href="${escapeHTML(site.repoUrl)}">${t.emptyAction}</a>
        </div>`;

/**
 * The "About tinwright" section at the foot of a home page, with a link onward: to the gallery from
 * a workshop built into the site, or to the tinwright org from the gallery.
 * @param {Ctx} ctx @param {{ href: string, label: string }} [link]
 */
function aboutHTML(ctx, link) {
  const t = stringsOf(ctx.lang);
  return `<section class="about" aria-labelledby="about-title">
        <div class="section-head"><h2 id="about-title">${t.aboutTitle}</h2></div>
        ${t.about.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('\n        ')}
        ${link ? `<div class="actions"><a class="button button-secondary" href="${escapeHTML(link.href)}">${link.label}</a></div>` : ''}
      </section>`;
}

/**
 * A workshop built into the site (one with `workshop` hooks) sits one folder below the gallery,
 * which has the same languages.
 * @param {Site} site @param {Ctx} ctx
 */
const galleryLink = (site, ctx) =>
  site.workshop && {
    href: `${ctx.root}../${ctx.lang === defaultLanguage(site) ? '' : `${ctx.lang}/`}`,
    label: stringsOf(ctx.lang).allWorkshops,
  };

/** @param {Site} site @param {Item[]} items @param {Lang} [lang] */
export function renderHome(site, items, lang = defaultLanguage(site)) {
  const t = stringsOf(lang, site);
  const ctx = { lang, root: rootOf(site, lang, 0), home: '' };
  const intro = siteText(site, lang, 'intro');
  return layout(site, ctx, {
    title: siteTitle(site, lang),
    description: intro,
    image: items.find((item) => item.hasScreenshot) && screenshotSrc(/** @type {Item} */ (items.find((item) => item.hasScreenshot))),
    otherPath: '',
    // Add a setup button, a featured item or a "share your own" section around these.
    body: `<section class="hero" aria-labelledby="hero-title">
        <h1 id="hero-title">${escapeHTML(siteTagline(site, lang))}</h1>
        ${intro ? `<p class="lede">${escapeHTML(intro)}</p>` : ''}
      </section>
      <section aria-labelledby="all-title">
        <div class="section-head">
          <h2 id="all-title">${t.allItems}</h2>
          ${items.length ? `<p>${t.count(items.length)}</p>` : ''}
        </div>
        ${items.length ? gridHTML(site, items, ctx) : emptyHTML(site, t)}
      </section>
      ${aboutHTML(ctx, galleryLink(site, ctx))}`,
  });
}

/**
 * An author's avatar, or their initial when it couldn't be downloaded.
 * @param {import('./authors.mjs').Author} author @param {Ctx} ctx @param {number} size
 */
const avatarHTML = (author, ctx, size) =>
  author.avatar
    ? `<img class="avatar" src="${ctx.root}${escapeHTML(author.avatar)}" alt="" width="${size}" height="${size}" loading="lazy" />`
    : `<span class="avatar avatar-initial" aria-hidden="true" style="width: ${size}px; height: ${size}px">${escapeHTML(author.login.charAt(0).toUpperCase())}</span>`;

/**
 * The detail page's authors: up to five avatars, linking to the tool's authors page.
 * @param {Item} item @param {Ctx} ctx
 */
function authorsHTML(item, ctx) {
  const authors = item.authors ?? [];
  if (!authors.length) return '';
  const t = stringsOf(ctx.lang);
  return `<div class="authors">
              <h3>${t.authors}</h3>
              <a class="authors-link" href="authors/">
                <span class="avatar-stack">${authors.slice(0, 5).map((author) => avatarHTML(author, ctx, 32)).join('')}</span>
                <span>${t.authorCount(authors.length)}</span>
              </a>
            </div>`;
}

/**
 * A tool's authors page: the GitHub account behind every commit to it, most commits first.
 * @param {Site} site @param {Item} item @param {Lang} [lang]
 */
export function renderAuthors(site, item, lang = defaultLanguage(site)) {
  const t = stringsOf(lang);
  const ctx = { lang, root: rootOf(site, lang, 3), home: '../../../' };
  const lede = t.authorsLede(item.title);
  return layout(site, ctx, {
    title: `${t.authorsOf(item.title)} · ${siteTitle(site, lang)}`,
    description: lede,
    otherPath: `${pageHref(site, item)}authors/`,
    body: `<article class="detail">
        <header class="detail-head">
          <a class="back" href="../">← ${escapeHTML(item.title)}</a>
          <p class="kicker">${t.authors}</p>
          <h1>${escapeHTML(t.authorsOf(item.title))}</h1>
          <p class="lede">${escapeHTML(lede)}</p>
        </header>
        <ul class="author-list">${(item.authors ?? [])
          .map(
            (author) => `<li class="author">
            ${avatarHTML(author, ctx, 56)}
            <div>
              <span class="author-github">${GITHUB_MARK}<a class="author-login" href="https://github.com/${encodeURIComponent(author.login)}" title="@${escapeHTML(author.login)}">@${escapeHTML(author.login)}</a></span>
              <p>${t.commitCount(author.commits)}</p>
            </div>
          </li>`,
          )
          .join('')}</ul>
      </article>`,
  });
}

/**
 * A workshop on the gallery's home page. `url` is its home page on this site, or undefined when the
 * build couldn't find its checkout, in which case `items` is empty and the section links to its repo.
 * @typedef {{ title: string, tagline: string, url?: string, repoUrl: string, items: Item[] }} GallerySection
 */

/**
 * The gallery's home page: every workshop, each with its tools.
 * @param {Site} site
 * @param {GallerySection[]} workshops
 * @param {Lang} [lang]
 */
export function renderGallery(site, workshops, lang = defaultLanguage(site)) {
  const words = wordsOf(lang);
  const ctx = { lang, root: rootOf(site, lang, 0), home: '' };
  const intro = siteText(site, lang, 'intro');
  const sections = workshops.map((workshop, index) => {
    const id = `workshop-${index}`;
    const link = `<a class="button button-secondary" href="${escapeHTML(workshop.url ?? workshop.repoUrl)}">${escapeHTML(words.visit(workshop.title))}</a>`;
    return `<section aria-labelledby="${id}">
        <div class="section-head">
          <h2 id="${id}">${escapeHTML(workshop.title)}</h2>
          <p>${escapeHTML(workshop.tagline)}${workshop.items.length ? ` · ${words.tools(workshop.items.length)}` : ''}</p>
        </div>
        ${workshop.items.length ? gridHTML(site, workshop.items, ctx) : `<div class="empty"><p>${words.soon}</p></div>`}
        <div class="actions">${link}</div>
      </section>`;
  });
  return layout(site, ctx, {
    title: siteTitle(site, lang),
    description: intro,
    otherPath: '',
    body: `<section class="hero" aria-labelledby="hero-title">
        <h1 id="hero-title">${escapeHTML(siteTagline(site, lang))}</h1>
        ${intro ? `<p class="lede">${escapeHTML(intro)}</p>` : ''}
      </section>
      ${sections.join('\n      ')}
      ${aboutHTML(ctx, { href: 'https://github.com/tinwright', label: stringsOf(lang).onGitHub })}`,
  });
}

/** @param {Site} site @param {Item} item @param {Item[]} items @param {Lang} [lang] */
export function renderDetail(site, item, items, lang = defaultLanguage(site)) {
  const t = stringsOf(lang, site);
  const ctx = { lang, root: rootOf(site, lang, 2), home: '../../' };
  const description = descriptionOf(site, item, lang);
  const facts = factsHTML(site, item, ctx);
  const others = items.filter((other) => other.name !== item.name);
  const copy = copyButton(lang, {
    label: t.copyForClaude,
    source: 'site-readme-markdown',
    describedBy: 'site-copy-hint',
  });

  return layout(site, ctx, {
    title: `${item.title} · ${siteTitle(site, lang)}`,
    description,
    image: item.hasScreenshot ? screenshotSrc(item) : undefined,
    otherPath: pageHref(site, item),
    body: `<article class="detail">
        <header class="detail-head">
          <a class="back" href="${ctx.home}">${t.back}</a>
          <p class="kicker">${escapeHTML(kickerOf(site, item, lang))}</p>
          <h1>${escapeHTML(item.title)}</h1>
          ${description ? `<p class="lede">${escapeHTML(description)}</p>` : ''}
          <div class="actions">${copy}<p class="hint" id="site-copy-hint">${t.copyHint}</p></div>
        </header>
        ${item.hasScreenshot ? `<figure class="detail-media">${screenshotHTML(site, item, ctx, 'detail-image')}</figure>` : ''}
        <div class="detail-columns">
          <aside class="facts" aria-label="${escapeHTML(t.atAGlance)}">
            <h2>${t.atAGlance}</h2>
            ${facts ? `<dl>${facts}</dl>` : ''}
            ${extraDetailHTML(site, item, ctx)}
            ${authorsHTML(item, ctx)}
            <div class="actions">
              <a class="button button-secondary" href="${escapeHTML(item.sourceUrl)}">${t.viewSource}</a>
            </div>
          </aside>
          <div class="prose">${readmeHTML(site, item, lang)}</div>
        </div>
        <script type="application/json" id="site-readme-markdown">${scriptJSON(readmeOf(site, item, lang).replace(/<!--[\s\S]*?-->\n?/g, ''))}</script>
      </article>
      ${
        others.length
          ? `<section aria-labelledby="more-title">
        <div class="section-head"><h2 id="more-title">${t.moreItems}</h2></div>
        ${gridHTML(site, others, ctx)}
      </section>`
          : ''
      }`,
  });
}

/** The helpers each workshop's site.mjs hooks get. */
const KIT = { escapeHTML, commandHTML, itemsPath };

// GitHub's mark (Octicons mark-github, MIT), inline so a page never loads anything from GitHub.
const GITHUB_MARK =
  '<svg class="github-mark" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>';

// Used when site/ has no favicons: an accent-coloured rounded square.
const FAVICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0d5e74"/></svg>',
)}`;

/**
 * @param {Site} site
 * @param {Ctx} ctx
 * @param {{ title: string, description?: string, image?: string, otherPath: string, body: string }} page
 *   `otherPath` is this page's path from its language's home, used to link to the same page in
 *   the other languages. `image` is a path from dist/, for link previews.
 */
function layout(site, { lang, root, home }, { title, description, image, otherPath, body }) {
  const t = stringsOf(lang);
  const badge = siteText(site, lang, 'badge');
  const others = languagesOf(site)
    .filter((other) => other !== lang)
    .map((other) => ({
      strings: stringsOf(other),
      href: `${root}${other === defaultLanguage(site) ? '' : `${other}/`}${otherPath}` || './',
      url: absoluteUrl(site, other, otherPath),
    }));
  const url = absoluteUrl(site, lang, otherPath);
  const summary = description || siteTagline(site, lang);
  const imageUrl = site.siteUrl && image && `${site.siteUrl.replace(/\/+$/, '')}/${image}`;
  // Search engines and link previews read these; they need absolute URLs, so only with siteUrl.
  const share = url
    ? [
        `<link rel="canonical" href="${escapeHTML(url)}" />`,
        // Every language's version, this one included, and the default language for the rest.
        ...[{ strings: t, url }, ...others].map(({ strings, url: other }) => `<link rel="alternate" hreflang="${strings.htmlLang}" href="${escapeHTML(other ?? '')}" />`),
        `<link rel="alternate" hreflang="x-default" href="${escapeHTML(absoluteUrl(site, defaultLanguage(site), otherPath) ?? '')}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="${escapeHTML(siteTitle(site, lang))}" />`,
        `<meta property="og:title" content="${escapeHTML(title)}" />`,
        `<meta property="og:description" content="${escapeHTML(summary)}" />`,
        `<meta property="og:url" content="${escapeHTML(url)}" />`,
        `<meta property="og:locale" content="${t.htmlLang.replace('-', '_')}" />`,
        ...(imageUrl ? [`<meta property="og:image" content="${escapeHTML(imageUrl)}" />`] : []),
        `<meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}" />`,
      ].join('\n    ')
    : others.map(({ strings, href }) => `<link rel="alternate" hreflang="${strings.htmlLang}" href="${href}" />`).join('\n    ');
  const issuesUrl = `${site.repoUrl.replace(/\/+$/, '')}/issues`;
  const licenseUrl = `${site.repoUrl.replace(/\/+$/, '')}/blob/${site.branch ?? 'main'}/LICENSE`;
  const icons = site.hasFavicons
    ? `<link rel="icon" type="image/png" sizes="32x32" href="${root}favicon-32.png" />
    <link rel="apple-touch-icon" href="${root}apple-touch-icon.png" />`
    : `<link rel="icon" href="${FAVICON}" />`;
  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHTML(title)}</title>
    <meta name="description" content="${escapeHTML(summary)}" />
    ${share}
    ${icons}
    <style>${STYLES}</style>
  </head>
  <body>
    <header class="masthead">
      <div class="wrap masthead-inner">
        <a class="wordmark" href="${home || './'}">${escapeHTML(siteTitle(site, lang))}${badge ? ` <span class="badge">${escapeHTML(badge)}</span>` : ''}</a>
        <nav class="masthead-links">
          ${others.map(({ strings, href }) => `<a class="masthead-link" href="${href}" hreflang="${strings.htmlLang}" lang="${strings.htmlLang}">${strings.name}</a>`).join('\n          ')}
          <a class="masthead-link masthead-github" href="${escapeHTML(site.repoUrl)}" aria-label="GitHub" title="GitHub">${GITHUB_MARK}</a>
        </nav>
      </div>
    </header>
    <main class="wrap">
      ${body}
    </main>
    <footer>
      <div class="wrap footer-inner">
        <a href="${escapeHTML(site.repoUrl)}">${escapeHTML(site.repoUrl.replace(/^https:\/\//, ''))}</a>
        ${site.license ? `<a href="${escapeHTML(licenseUrl)}">${escapeHTML(t.license(site.license))}</a>` : ''}
        <a href="${escapeHTML(issuesUrl)}">${t.reportIssue}</a>
      </div>
    </footer>
    <script>
      // Heading ids are lowercase; let #Install find #install too.
      function scrollToHash() {
        let hash;
        try {
          hash = decodeURIComponent(location.hash.slice(1));
        } catch {
          return;
        }
        if (!hash || document.getElementById(hash)) return;
        const wanted = hash.toLowerCase();
        const target = [...document.querySelectorAll('[id]')].find((el) => el.id.toLowerCase() === wanted);
        target?.scrollIntoView();
      }
      addEventListener('hashchange', scrollToHash);
      scrollToHash();

      // Copy buttons copy data-copy-text, or the JSON in the <script> named by data-copy. The
      // button swaps its visible label through data-state; a live region announces the result.
      const status = document.createElement('p');
      status.className = 'visually-hidden';
      status.setAttribute('role', 'status');
      document.body.append(status);
      for (const button of document.querySelectorAll('[data-copy], [data-copy-text]')) {
        let reset;
        button.addEventListener('click', async () => {
          let state = 'copied';
          try {
            const text = button.dataset.copy
              ? JSON.parse(document.getElementById(button.dataset.copy).textContent)
              : button.dataset.copyText;
            await navigator.clipboard.writeText(text);
          } catch {
            state = 'failed';
          }
          button.dataset.state = 'idle';
          void button.offsetWidth;
          button.dataset.state = state;
          status.textContent = button.querySelector('[data-for=' + state + ']').textContent;
          clearTimeout(reset);
          reset = setTimeout(() => {
            button.dataset.state = 'idle';
            status.textContent = '';
          }, 2000);
        });
      }
    </script>
  </body>
</html>
`;
}

const STYLES = `
      :root {
        color-scheme: light dark;
        --bg: #f4f5f3;
        --surface: #e9edec;
        --text: #1b2428;
        --muted: #56656b;
        --rule: #d3dbdb;
        --accent: #0d5e74;
        --accent-text: #ffffff;
        --success: #2b7347;
        --code-bg: #e4e9e8;
        --serif: 'Iowan Old Style', Charter, 'Bitstream Charter', Georgia, 'Times New Roman', serif;
        --sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        --mono: ui-monospace, SFMono-Regular, Menlo, monospace;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #11171a;
          --surface: #1a2226;
          --text: #e7ecea;
          --muted: #98a6ab;
          --rule: #2b363b;
          --accent: #62bfd2;
          --accent-text: #11171a;
          --success: #5cc48a;
          --code-bg: #212b2f;
        }
      }
      * { box-sizing: border-box; }
      html { -webkit-text-size-adjust: 100%; }
      body {
        margin: 0; background: var(--bg); color: var(--text); font: 17px/1.6 var(--sans);
        min-height: 100vh; display: flex; flex-direction: column;
      }
      a { color: inherit; }
      img { max-width: 100%; display: block; }
      code {
        font: 0.85em/1.4 var(--mono); background: var(--code-bg); border-radius: 4px;
        padding: 0.1em 0.35em; overflow-wrap: anywhere;
      }
      .wrap { width: 100%; max-width: 1180px; margin: 0 auto; padding-inline: 16px; }
      @media (min-width: 720px) { .wrap { padding-inline: 32px; } }

      .masthead { border-bottom: 1px solid var(--rule); }
      .masthead-inner {
        display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap;
        gap: 8px 16px; padding-top: 18px; padding-bottom: 14px;
      }
      .wordmark { font: 700 1.6rem/1.1 var(--serif); letter-spacing: -0.01em; text-decoration: none; }
      .badge {
        display: inline-block; vertical-align: middle; margin-left: 6px; padding: 2px 8px;
        border-radius: 999px; border: 1.5px solid var(--accent); color: var(--accent);
        font: 700 0.62rem/1.4 var(--sans); text-transform: uppercase; letter-spacing: 0.1em;
      }
      .masthead-links { display: flex; flex-wrap: wrap; gap: 8px 20px; }
      .masthead-link {
        font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
        text-decoration: none; color: var(--muted);
      }
      .masthead-link:hover { color: var(--accent); }
      .masthead-github { display: inline-flex; align-self: center; }
      .github-mark { width: 1.25rem; height: 1.25rem; display: block; }
      .author-github { display: flex; align-items: center; gap: 6px; min-width: 0; }
      .author-github .github-mark { width: 0.95rem; height: 0.95rem; flex: none; color: var(--muted); }
      main { flex: 1; padding-top: 40px; padding-bottom: 64px; }
      main > section + section, .detail + section { margin-top: 64px; }

      .kicker {
        margin: 0 0 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.12em; color: var(--accent);
      }
      .lede { font: 1.2rem/1.5 var(--serif); color: var(--muted); margin: 0 0 24px; }
      .lede a, .hint a { color: var(--accent); }
      .hero { max-width: 820px; }
      .hero h1 {
        font: 700 clamp(2.2rem, 5.5vw, 3.6rem)/1.05 var(--serif); letter-spacing: -0.02em;
        margin: 0 0 16px;
      }

      .authors { margin: 24px 0; }
      .authors h3 { font: 600 1rem/1.4 var(--sans); margin: 0 0 8px; }
      .authors-link {
        display: inline-flex; align-items: center; gap: 10px; color: var(--muted); text-decoration: none;
      }
      .authors-link:hover { color: var(--accent); }
      .avatar-stack { display: inline-flex; }
      .avatar-stack .avatar { margin-left: -8px; box-shadow: 0 0 0 2px var(--surface); }
      .avatar-stack .avatar:first-child { margin-left: 0; }
      .avatar {
        display: inline-block; flex: none; border-radius: 50%; object-fit: cover; background: var(--bg);
      }
      .avatar-initial {
        display: inline-grid; place-items: center; font: 700 0.9rem/1 var(--serif); color: var(--muted);
        border: 1.5px solid var(--rule);
      }
      .author-list {
        list-style: none; padding: 0; margin: 32px 0 0; display: grid; gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
      }
      .author {
        display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--rule);
        border-radius: 12px;
      }
      .author > div { min-width: 0; }
      .author p { margin: 2px 0 0; font-size: 0.85rem; color: var(--muted); }
      .author-login {
        display: block; font-weight: 600; text-decoration: none; white-space: nowrap; overflow: hidden;
        text-overflow: ellipsis;
      }
      .author-login:hover { color: var(--accent); text-decoration: underline; }

      .empty {
        border: 1.5px dashed var(--rule); border-radius: 12px; background: var(--surface);
        padding: 32px 24px; text-align: center; color: var(--muted);
      }
      .empty p { margin: 0 auto 16px; max-width: 46ch; }
      .empty > :last-child { margin-bottom: 0; }
      .empty-title { font: 700 1.35rem/1.3 var(--serif); color: var(--text); }
      .empty .empty-title { margin-bottom: 8px; }

      .button {
        display: inline-block; background: var(--accent); color: var(--accent-text);
        font-weight: 600; font-size: 0.95rem; text-decoration: none; padding: 10px 20px;
        border-radius: 999px;
      }
      button.button, .copy-small { border: 0; cursor: pointer; font-family: inherit; }
      .button:hover { filter: brightness(1.08); }
      .button-secondary {
        background: transparent; color: var(--text); box-shadow: inset 0 0 0 1.5px var(--rule);
      }
      .button-secondary:hover { filter: none; box-shadow: inset 0 0 0 1.5px var(--muted); }
      .copy { display: inline-grid; transition: background-color 0.2s ease; }
      .copy-label {
        grid-area: 1 / 1; display: inline-flex; align-items: center; justify-content: center;
        gap: 6px; visibility: hidden;
      }
      .copy[data-state='idle'] [data-for='idle'],
      .copy[data-state='copied'] [data-for='copied'],
      .copy[data-state='failed'] [data-for='failed'] { visibility: visible; }
      .copy[data-state='copied'] { background: var(--success); color: var(--accent-text); animation: copy-pop 0.35s ease; }
      .copy[data-state='failed'] { animation: copy-shake 0.35s ease; }
      .check {
        width: 1.1em; height: 1.1em; fill: none; stroke: currentColor; stroke-width: 2.2;
        stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 16; stroke-dashoffset: 16;
      }
      .copy[data-state='copied'] .check { animation: check-draw 0.3s 0.1s ease-out forwards; }
      @keyframes copy-pop { 50% { transform: scale(1.06); } }
      @keyframes copy-shake { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
      @keyframes check-draw { to { stroke-dashoffset: 0; } }
      @media (prefers-reduced-motion: reduce) {
        .copy[data-state] { animation: none; }
        .copy[data-state='copied'] .check { animation: none; stroke-dashoffset: 0; }
      }
      .visually-hidden {
        position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%);
        white-space: nowrap;
      }

      .command {
        display: flex; align-items: center; gap: 8px; margin: 8px 0 0; padding: 6px 6px 6px 12px;
        background: var(--code-bg); border-radius: 6px;
      }
      .command code {
        flex: 1; min-width: 0; background: none; padding: 0; font-size: 0.8rem; color: var(--text);
      }
      .copy-small {
        flex: none; padding: 4px 10px; border-radius: 999px; background: var(--bg);
        color: var(--text); font-size: 0.75rem; font-weight: 600;
        box-shadow: inset 0 0 0 1px var(--rule);
      }
      .copy-small .check { width: 1em; height: 1em; }

      .section-head {
        display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
        border-top: 3px solid var(--text); padding-top: 10px; margin-bottom: 24px;
      }
      .section-head h2 { font: 700 1.5rem/1.2 var(--serif); margin: 0; }
      .section-head p { margin: 0; font-size: 0.85rem; color: var(--muted); }

      .grid {
        list-style: none; margin: 0; padding: 0; display: grid; gap: 24px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
      }
      .card {
        display: flex; flex-direction: column; gap: 6px; padding: 20px;
        border: 1px solid var(--rule); border-radius: 6px;
      }
      .card .kicker { margin: 0; }
      .card-media {
        display: block; margin: -20px -20px 8px; border-radius: 6px 6px 0 0; overflow: hidden;
        background: var(--surface); aspect-ratio: 16 / 10;
      }
      .card-image { width: 100%; height: 100%; object-fit: cover; object-position: left top; transition: transform 0.3s ease; }
      .card-media:hover .card-image { transform: scale(1.03); }
      .placeholder {
        display: grid; place-items: center; font: 700 4rem/1 var(--serif); color: var(--rule);
      }
      .card-title { font: 700 1.35rem/1.2 var(--serif); margin: 0; }
      .card-title a { text-decoration: none; }
      .card-title a:hover { text-decoration: underline; }
      .card-text { margin: 0; font-size: 0.95rem; color: var(--muted); flex: 1; }
      .byline {
        display: flex; align-items: center; gap: 8px; margin-top: 6px; min-width: 0;
        font-size: 0.8rem; color: var(--muted); text-decoration: none;
      }
      .byline span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .byline .avatar-initial { font-size: 0.65rem; border-width: 1px; }
      .byline:hover { color: var(--accent); }

      .detail-head { max-width: 760px; }
      .back {
        display: inline-block; margin-bottom: 20px; font-size: 0.9rem; color: var(--muted);
        text-decoration: none;
      }
      .back:hover { color: var(--accent); }
      .detail-head h1 {
        font: 700 clamp(2.2rem, 6vw, 3.6rem)/1.05 var(--serif); letter-spacing: -0.02em;
        margin: 0 0 16px;
      }
      .detail-media {
        margin: 0 0 40px; border: 1px solid var(--rule); border-radius: 6px; overflow: hidden;
        background: var(--surface);
      }
      .detail-image { width: 100%; }
      .detail-columns { display: grid; gap: 40px; }
      @media (min-width: 900px) {
        .detail-columns { grid-template-columns: minmax(0, 1fr) 360px; gap: 56px; }
        .detail-columns .prose { grid-column: 1; grid-row: 1; }
        .detail-columns .facts { grid-column: 2; grid-row: 1; position: sticky; top: 24px; align-self: start; }
      }

      .facts {
        background: var(--surface); border-radius: 6px; padding: 20px 24px 24px; font-size: 0.92rem;
        min-width: 0;
      }
      .facts h2 {
        font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;
        margin: 0 0 12px;
      }
      .facts dl { margin: 0 0 24px; }
      .facts dt { font-weight: 600; margin-top: 12px; }
      .facts dt:first-child { margin-top: 0; }
      .facts dd { margin: 4px 0 0; color: var(--muted); }
      .facts .command { background: var(--bg); }
      .facts .copy-small { background: var(--surface); }
      .chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
      .chips code { font-size: 0.78rem; background: var(--bg); }
      .about > p { max-width: 68ch; margin: 0 0 16px; color: var(--muted); }
      .about .actions, .grid + .actions, .empty + .actions { margin-top: 24px; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px 14px; }
      .detail-head .actions { align-items: center; margin-bottom: 40px; }
      .hint { margin: 0; font-size: 0.85rem; color: var(--muted); }
      .steps { padding-left: 1.2em; margin: 0 0 20px; color: var(--muted); }
      .steps li + li { margin-top: 14px; }
      .steps strong, .steps code, .steps a { color: var(--text); }
      .untranslated { margin: 0 0 1.5em; font-size: 0.9rem; color: var(--muted); }

      .prose { min-width: 0; max-width: 72ch; }
      .prose > :first-child { margin-top: 0; }
      .prose h2 {
        font: 700 1.6rem/1.2 var(--serif); margin: 2.2em 0 0.6em; padding-top: 0.6em;
        border-top: 1px solid var(--rule);
      }
      .prose h3 { font: 700 1.2rem/1.3 var(--serif); margin: 1.8em 0 0.5em; }
      .prose :is(h2, h3, h4) { scroll-margin-top: 24px; }
      .prose .anchor { margin-left: 0.35em; color: var(--muted); text-decoration: none; opacity: 0; }
      .prose :is(h2, h3, h4):hover .anchor, .prose .anchor:focus-visible { opacity: 1; }
      @media (hover: none) { .prose .anchor { opacity: 0.5; } }
      .prose a { color: var(--accent); }
      .prose pre {
        background: var(--code-bg); border-radius: 6px; padding: 14px 16px; overflow-x: auto;
        font-size: 0.9rem;
      }
      .prose pre code { background: none; padding: 0; overflow-wrap: normal; }
      .prose blockquote {
        margin: 1.2em 0; padding: 0.2em 0 0.2em 1em; border-left: 3px solid var(--accent);
        color: var(--muted);
      }
      .prose table {
        display: block; overflow-x: auto; border-collapse: collapse; font-size: 0.9rem;
        margin: 1.2em 0;
      }
      .prose th, .prose td {
        border-bottom: 1px solid var(--rule); padding: 8px 12px 8px 0; text-align: left;
        vertical-align: top;
      }
      .prose th { font-weight: 700; }
      .prose img { border-radius: 6px; }

      footer {
        border-top: 1px solid var(--rule); padding-top: 20px; padding-bottom: 32px;
        font-size: 0.85rem; color: var(--muted);
      }
      .footer-inner { display: flex; flex-wrap: wrap; gap: 8px 24px; }
      footer a { color: inherit; }
`;
