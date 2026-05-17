import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://mytraderdesk.com',
      priority: 1,
      changeFrequency: 'weekly',
    },
    {
      url: 'https://mytraderdesk.com/about',
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: 'https://mytraderdesk.com/faq',
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: 'https://mytraderdesk.com/community',
      priority: 0.8,
      changeFrequency: 'daily',
    },
    {
      url: 'https://mytraderdesk.com/playbook',
      priority: 0.9,
      changeFrequency: 'weekly',
    },
  ]
}
