/** The gallery: tinwright's front door, listing every workshop and the tools in each. */
export default {
  title: 'tinwright',
  tagline: 'Small, free tools, each made to do one job well',
  intro: 'Plugins for Claude Code, browser extensions, bookmarklets, command-line tools and apps. All open source, none of them collecting your data.',
  languages: ['en', 'fr', 'es'],
  translations: {
    fr: {
      tagline: 'De petits outils gratuits, chacun fait pour bien faire une chose',
      intro: 'Des plugins pour Claude Code, des extensions de navigateur, des bookmarklets, des outils en ligne de commande et des applis. Tous open source, et aucun ne collecte vos données.',
    },
    es: {
      tagline: 'Pequeñas herramientas gratuitas, cada una hecha para hacer bien una cosa',
      intro: 'Plugins para Claude Code, extensiones de navegador, bookmarklets, herramientas de línea de comandos y apps. Todas de código abierto, y ninguna recopila tus datos.',
    },
  },
  repoUrl: 'https://github.com/tinwright/tinwright.github.io',
  siteUrl: 'https://tinwright.github.io',
  license: 'MIT',
  branch: 'main',
  // No tools of its own; the workshops below hold them.
  itemsDir: 'workshops',
  // The workshops whose tools the site shows, in this order, each built into <repo>/ from a
  // checkout of its repo (see scripts/workshops.mjs).
  workshops: [
    { repo: 'ai-apprentice' },
    { repo: 'browser-trinkets' },
    { repo: 'bookmarklet-tacks' },
    { repo: 'cli-toolroll' },
    { repo: 'app-lanterns' },
  ],
};
