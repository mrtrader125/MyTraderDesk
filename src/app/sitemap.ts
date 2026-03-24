import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// Initialize a basic client just for fetching public data for the sitemap
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mytraderdesk.com'

  // Fetch all analyses to dynamically build our SEO pages
  const { data: analyses } = await supabase
    .from('analyses')
    .select('asset_symbol, created_at')
    .order('created_at', { ascending: false })

  // Extract unique symbols (e.g., just one entry for XAUUSD, one for EURUSD)
  const uniqueSymbols = Array.from(new Set(analyses?.map(a => a.asset_symbol) || []))

  // Map them to sitemap objects
  const dynamicUrls = uniqueSymbols.map((symbol) => ({
    url: `${baseUrl}/analysis/${symbol.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/playbook`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...dynamicUrls,
  ]
}
