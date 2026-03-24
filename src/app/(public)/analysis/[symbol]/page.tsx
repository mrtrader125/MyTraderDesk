import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Lock, TrendingUp, TrendingDown, Minus, Shield, Users } from 'lucide-react'

// 1. EXPECTED PARAMETERS
type Props = {
  params: Promise<{ symbol: string }>
}

// 2. THE SEO ENGINE (Runs on the server for Google's bots)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params
  const symbol = resolvedParams.symbol.toUpperCase()

  const { data: setup } = await supabase
    .from('analyses')
    .select('bias, timeframe, created_at, image_url') // Added image_url here
    .eq('asset_symbol', symbol)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  })

  let description = `Get the latest institutional-grade technical analysis, execution zones, and crowdsourced retail sentiment for ${symbol}.`
  if (setup) {
    description = `Live ${setup.timeframe} market structure analysis for ${symbol}. Current desk bias is ${setup.bias || 'Neutral'}. Join to see exact execution zones and community confluence.`
  }

  return {
    title: `${symbol} Technical Analysis & Sentiment (${today}) | MyTraderDesk`,
    description: description,
    keywords: [
      `${symbol} analysis today`,
      `${symbol} technical analysis`,
      `${symbol} retail sentiment`,
      `Trade ${symbol}`,
      `Sentinel Vortex`,
      `Forex confluence`
    ],
    // 🚨 NEW: Added OpenGraph for rich social sharing previews
    openGraph: {
      title: `${symbol} Institutional Setup | MyTraderDesk`,
      description: description,
      url: `https://mytraderdesk.com/analysis/${symbol.toLowerCase()}`,
      siteName: 'Sentinel Vortex',
      type: 'article',
      publishedTime: setup?.created_at,
      images: [
        {
          url: setup?.image_url || '/og-image.jpg', // Dynamically uses the chart image!
          width: 1200,
          height: 630,
          alt: `${symbol} Technical Analysis Chart`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Live Setup | MyTraderDesk`,
      description: description,
      images: [setup?.image_url || '/og-image.jpg'],
    },
  }
}

// 3. THE PAGE UI (Server Rendered for maximum speed)
export default async function PublicAnalysisTeaser({ params }: Props) {
  const resolvedParams = await params
  const symbol = resolvedParams.symbol.toUpperCase()

  // Fetch the data on the server
  const { data: setup, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('asset_symbol', symbol)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Handle Missing Data
  if (error || !setup) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
        <h1 className="text-2xl font-black uppercase tracking-widest mb-4">Market Not Found</h1>
        <Link href="/" className="text-blue-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
          Return Home
        </Link>
      </div>
    )
  }

  const isBull = setup.bias?.toUpperCase() === 'BULLISH'
  const isBear = setup.bias?.toUpperCase() === 'BEARISH'

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
            {symbol} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Analysis</span>
          </h1>
          <p className="text-neutral-500 mt-2 font-bold uppercase tracking-widest text-sm">
            Live Market Overview & Institutional Confluence • {new Date(setup.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: The Teaser Chart */}
          <div className="lg:col-span-2 relative group">
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative">
              
              {/* Top Meta Bar */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                  {setup.timeframe} Timeframe
                </span>
                <span className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-white/10 flex items-center">
                  <Users size={12} className="mr-1.5 text-blue-400" /> Active Setup
                </span>
              </div>

              {/* The Chart (Blurred for public) */}
              <div className="relative aspect-video bg-[#111] overflow-hidden">
                <img 
                  src={setup.image_url} 
                  alt={`${symbol} Technical Analysis`}
                  className="w-full h-full object-cover filter blur-md opacity-40 scale-105"
                />
                
                {/* The Paywall Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-6 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                    <Lock size={24} className="text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Execution Zones Locked</h2>
                  <p className="text-xs font-medium text-neutral-300 max-w-sm mb-8 leading-relaxed">
                    Unlock the exact entry probabilities, multi-timeframe charting, and real-time community sentiment for {symbol}.
                  </p>
                  <Link 
                    href="/signup"
                    className="px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 inline-block"
                  >
                    Unlock {symbol} for $4.99/mo
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Public Metadata */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Directional Bias</h3>
              <div className={`inline-flex items-center w-full justify-center px-4 py-4 rounded-xl text-sm font-black uppercase tracking-widest border shadow-sm ${isBull ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : isBear ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-neutral-800 border-neutral-700 text-white'}`}>
                {isBull ? <TrendingUp size={18} className="mr-2" /> : isBear ? <TrendingDown size={18} className="mr-2" /> : <Minus size={18} className="mr-2" />}
                {setup.bias || 'NEUTRAL'}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Analysis Teaser</h3>
              <p className="text-xs font-medium text-neutral-400 leading-relaxed mb-6">
                Our trading desk has evaluated the current institutional market structure for {symbol}. Significant liquidity pools and imbalance zones have been identified on the {setup.timeframe} chart.
              </p>
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-500 flex items-center uppercase tracking-widest"><Shield size={12} className="mr-1.5" /> Secure Desk</span>
                <Link href="/signup" className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-white transition-colors">
                  Join to read full notes
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
