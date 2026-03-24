import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ArrowRight, Zap } from 'lucide-react'

// 🚨 NEW: Added OpenGraph tags
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

const ARTICLES = [
  {
    title: 'How to align multiple timeframes in forex trading',
    category: 'Strategy',
    date: 'March 2026',
    slug: 'multi-timeframe-alignment'
  },
  {
    title: 'Top-down analysis strategy for XAUUSD (Gold)',
    category: 'Commodities',
    date: 'March 2026',
    slug: 'gold-top-down-analysis'
  },
  {
    title: 'How to use retail sentiment to find high-probability setups',
    category: 'Sentiment',
    date: 'February 2026',
    slug: 'retail-sentiment-edge'
  }
]

export default function PlaybookPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">
            The <span className="text-brand-primary">Playbook</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl">
            Advanced market mechanics, execution strategies, and structural concepts used by the Sentinel Vortex trading desk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 🚨 NEW: The Inline Lead-Gen Banner */}
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

          {/* Existing Articles */}
          {ARTICLES.map((article, i) => (
            <Link key={i} href={`/playbook/${article.slug}`} className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 hover:border-neutral-600 transition-colors group flex flex-col justify-between min-h-[250px]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <BookOpen size={16} className="text-neutral-600" />
                </div>
                <h2 className="text-2xl font-black text-white leading-tight group-hover:text-brand-primary transition-colors">
                  {article.title}
                </h2>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                <span>{article.date}</span>
                <span className="flex items-center group-hover:text-white transition-colors">
                  Read Article <ArrowRight size={12} className="ml-2" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
