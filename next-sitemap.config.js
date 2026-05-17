// ═══════════════════════════════════════════════════════════════════════════════
// FILE: next-sitemap.config.js  (place at project root, next to package.json)
// Install: npm install next-sitemap --save-dev
// Add to package.json scripts: "postbuild": "next-sitemap"
// ═══════════════════════════════════════════════════════════════════════════════

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.mytraderdesk.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,   // single sitemap.xml is fine at this scale

  // Exclude ALL app routes (auth-gated — must never be indexed)
  exclude: [
    '/dashboard',
    '/dashboard/*',
    '/desk',
    '/desk/*',
    '/journal',
    '/journal/*',
    '/analytics',
    '/analytics/*',
    '/vault',
    '/vault/*',
    '/markets',
    '/markets/*',
    '/floor',
    '/floor/*',
    '/account',
    '/account/*',
    '/settings',
    '/settings/*',
    '/profile',
    '/profile/*',
    '/protocol',
    '/protocol/*',
    '/admin',
    '/admin/*',
    '/login',
    '/initialize',
    '/onboarding',
    '/auth/*',
    '/update-password',
    '/miniapp',
    '/verified',
    '/api/*',
  ],

  // Priority and changefreq per path
  transform: async (config, path) => {
    // Homepage — highest priority, checked weekly
    if (path === '/') {
      return { loc: path, priority: 1.0, changefreq: 'weekly', lastmod: new Date().toISOString() }
    }
    // Core landing pages
    if (['/about', '/faq', '/apply', '/community', '/playbook'].includes(path)) {
      return { loc: path, priority: 0.9, changefreq: 'monthly', lastmod: new Date().toISOString() }
    }
    // Playbook subpages
    if (path.startsWith('/playbook/')) {
      return { loc: path, priority: 0.8, changefreq: 'monthly', lastmod: new Date().toISOString() }
    }
    // Legal pages — low priority
    if (['/disclaimer', '/privacy', '/terms'].includes(path)) {
      return { loc: path, priority: 0.2, changefreq: 'yearly', lastmod: new Date().toISOString() }
    }
    // Default
    return { loc: path, priority: 0.6, changefreq: 'monthly', lastmod: new Date().toISOString() }
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/desk',
          '/journal',
          '/analytics',
          '/vault',
          '/markets',
          '/floor',
          '/account',
          '/settings',
          '/profile',
          '/protocol',
          '/admin',
          '/login',
          '/initialize',
          '/onboarding',
          '/auth/',
          '/update-password',
          '/miniapp',
          '/verified',
          '/api/',
        ],
      },
      // Block AI scrapers from training on your content
      { userAgent: 'GPTBot',      disallow: ['/'] },
      { userAgent: 'CCBot',       disallow: ['/'] },
      { userAgent: 'anthropic-ai', disallow: ['/'] },
      { userAgent: 'Claude-Web',  disallow: ['/'] },
    ],
    additionalSitemaps: [
      'https://www.mytraderdesk.com/sitemap.xml',
    ],
  },
}
