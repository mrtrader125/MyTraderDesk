import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/account/', '/markets/', '/vault/'], 
    },
    sitemap: 'https://mytraderdesk.com/sitemap.xml',
  }
}
