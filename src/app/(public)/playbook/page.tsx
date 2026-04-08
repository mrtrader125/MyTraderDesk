import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ArrowRight, Zap, Database } from 'lucide-react'
import { supabase } from '@/lib/supabase' // Make sure you have your server supabase client here

// 🚨 Cache the playbook archive for 1 hour to keep it incredibly fast
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'The Playbook | Trading Strategies & Confluence',
  description: 'Master multi-timeframe analysis, liquidity concepts, and market sentiment with the official Sentinel Vortex trading playbook.',
  openGraph: {
    title: 'The Playbook | MyTraderDesk',
    description: 'Master multi-timeframe analysis, liquidity concepts, and market sentiment.',
    url: 'https://mytraderdesk.com/playbook',
    siteName: 'Sentinel Vortex',
    type: 'website',
  }
}

export default async function PlaybookPage() {
  // Fetch live articles from Supabase
  const { data: articles, error } = await supabase
    .from('playbook')
    .select('title, slug, category, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">
            The <span className="text-blue-500">Playbook</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl">
            Advanced market mechanics, execution strategies, and structural concepts used by the Sentinel Vortex trading desk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* THE INLINE CONVERSION TRAP */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#111] to-[#050505] border border-blue-500/30 rounded-[2rem] p-8 md:p-12 mb-4 flex flex-col md:flex-row items-center justify-between group overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 mb-8 md:mb-0 md:pr-8 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center justify-center md:justify-start">
                <Zap className="text-blue-500 mr-3 hidden sm:block" size={28} />
                Stop reading theory.
              </h3>
              <p className="text-neutral-400 mt-3 text-sm md:text-base font-medium max-w-lg">
                Create a free account to access our live digital trading floor and see how we apply these exact concepts to today's live markets.
              </p>
            </div>
            
            <Link href="/signup" className="relative z-10 px-8 py-5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)] shrink-0 w-full md:w-auto text-center">
              Join The Floor Free
            </Link>
          </div>

          {/* DYNAMIC ARTICLES FROM DATABASE */}
          {error || !articles?.length ? (
            <div className="col-span-1 md:col-span-2 py-20 text-center border border-neutral-800 rounded-3xl bg-[#0a0a0a]">
              <Database className="mx-auto text-neutral-700 mb-4" size={48} />
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">Playbook is currently being updated.<br/>Check back soon for new strategies.</p>
            </div>
          ) : (
            articles.map((article) => (
              <Link key={article.slug} href={`/playbook/${article.slug}`} className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 hover:border-blue-500/30 transition-colors group flex flex-col justify-between min-h-[250px]">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                      {article.category}
                    </span>
                    <BookOpen size={16} className="text-neutral-600" />
                  </div>
                  <h2 className="text-2xl font-black text-white leading-tight group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h2>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  <span className="flex items-center group-hover:text-white transition-colors">
                    Read Article <ArrowRight size={12} className="ml-2" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
