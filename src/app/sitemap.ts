import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://mytraderdesk.com',
      lastModified: new Date(),
    },
    {
      url: 'https://mytraderdesk.com/login',
      lastModified: new Date(),
    },
    {
      url: 'https://mytraderdesk.com/dashboard',
      lastModified: new Date(),
    },
  ]
}