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
  // Each workshop's site publishes items.json, which the gallery reads at build time.
  workshops: [
    { repo: 'ai-apprentice', siteUrl: 'https://tinwright.github.io/ai-apprentice' },
    { repo: 'browser-trinkets', siteUrl: 'https://tinwright.github.io/browser-trinkets' },
    { repo: 'bookmarklet-tacks', siteUrl: 'https://tinwright.github.io/bookmarklet-tacks' },
    { repo: 'cli-toolroll', siteUrl: 'https://tinwright.github.io/cli-toolroll' },
    { repo: 'app-lanterns', siteUrl: 'https://tinwright.github.io/app-lanterns' },
  ],
};
