import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Lock, TrendingUp, TrendingDown, Minus, Shield, Users, Unlock, Clock, ArrowRight, Activity } from 'lucide-react'

// Cache this page for 1 hour so it loads instantly for visitors
export const revalidate = 3600;

type Props = {
  params: Promise<{ symbol: string }>
}

// 1. THE SEO ENGINE
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params
  const symbol = resolvedParams.symbol.toUpperCase()

  const { data: setup } = await supabase
    .from('analyses')
    .select('bias, timeframe, created_at, image_url, is_locked') 
    .eq('asset_symbol', symbol)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  })

  let description = `Get the latest institutional-grade technical analysis, execution zones, and crowdsourced retail sentiment for ${symbol}.`
  if (setup) {
    description = `Live ${setup.timeframe} market structure analysis for ${symbol}. Current desk bias is ${setup.bias || 'Neutral'}. ${setup.is_locked === false ? 'View the full structural breakdown.' : 'Join to see exact execution zones and community confluence.'}`
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
    openGraph: {
      title: `${symbol} Institutional Setup | MyTraderDesk`,
      description: description,
      url: `https://mytraderdesk.com/analysis/${symbol.toLowerCase()}`,
      siteName: 'Sentinel Vortex',
      type: 'article',
      publishedTime: setup?.created_at,
      images: [
        {
          url: setup?.image_url || '/og-image.jpg', 
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

// Helper to format "Today", "Yesterday", or Date
function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// 2. THE PAGE UI
export default async function PublicAnalysisTeaser({ params }: Props) {
  const resolvedParams = await params
  const symbol = resolvedParams.symbol.toUpperCase()

  // Fetch the main setup
  const { data: setup, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('asset_symbol', symbol)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 🚨 SEO BOOST: Fetch other recent analyses for internal linking and UX navigation
  const { data: rawRecent } = await supabase
    .from('analyses')
    .select('asset_symbol, timeframe, created_at, bias')
    .neq('asset_symbol', symbol) // Don't show the one we are currently looking at
    .order('created_at', { ascending: false })
    .limit(15);

  // Filter to get only the latest unique symbols for the bottom grid
  const recentSetups = [];
  const seenSymbols = new Set();
  for (const item of (rawRecent || [])) {
    if (!seenSymbols.has(item.asset_symbol)) {
      seenSymbols.add(item.asset_symbol);
      recentSetups.push(item);
      if (recentSetups.length === 3) break; // Limit to 3 cards
    }
  }

  if (error || !setup) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
        <h1 className="text-2xl font-black uppercase tracking-widest mb-4">Market Not Found</h1>
        <Link href="/" className="text-blue-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
          Return to Desk
        </Link>
      </div>
    )
  }

  const isBull = setup.bias?.toUpperCase() === 'BULLISH'
  const isBear = setup.bias?.toUpperCase() === 'BEARISH'
  
  const isLocked = setup.is_locked !== false; 

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20 px-6 selection:bg-blue-500/30 selection:text-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Header with Exact Context */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full mb-4">
            <Activity size={12} className="text-blue-400" />
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
              Latest Release: {formatRelativeDate(setup.created_at)}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
            {symbol} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Analysis</span>
          </h1>
          <p className="text-neutral-500 mt-2 font-bold uppercase tracking-widest text-sm flex items-center justify-center md:justify-start gap-2">
            Institutional Market Structure
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: The Chart */}
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

              {/* Dynamic Chart Rendering */}
              <div className="relative aspect-video bg-[#111] overflow-hidden flex items-center justify-center">
                {setup.image_url ? (
                  <img 
                    src={setup.image_url} 
                    alt={`${symbol} Technical Analysis`}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isLocked ? 'filter blur-md opacity-40 scale-105' : 'opacity-90'}`}
                  />
                ) : (
                  <span className="text-neutral-700 text-xs font-bold uppercase tracking-widest">Awaiting Chart Data</span>
                )}
                
                {/* Dynamic Paywall Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-6 text-center z-20">
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
                      Unlock for $29/mo
                    </Link>
                    <p className="mt-4 text-[9px] font-bold text-cyan-400 uppercase tracking-widest animate-pulse">
                      Founding Cohort strictly capped at 150 members.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Public Metadata & Dynamic Notes */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Directional Bias</h3>
              <div className={`inline-flex items-center w-full justify-center px-4 py-4 rounded-xl text-sm font-black uppercase tracking-widest border shadow-sm ${isBull ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : isBear ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-neutral-800 border-neutral-700 text-white'}`}>
                {isBull ? <TrendingUp size={18} className="mr-2" /> : isBear ? <TrendingDown size={18} className="mr-2" /> : <Minus size={18} className="mr-2" />}
                {setup.bias || 'NEUTRAL'}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">
                {isLocked ? 'Analysis Teaser' : 'Structural Notes'}
              </h3>
              
              <div className="text-xs font-medium text-neutral-400 leading-relaxed mb-6 space-y-3">
                {isLocked ? (
                  <p>Our trading desk has evaluated the current institutional market structure for {symbol}. Significant liquidity pools and imbalance zones have been identified on the {setup.timeframe} chart.</p>
                ) : (
                  <p className="whitespace-pre-wrap">{setup.notes || `Full structural breakdown for ${symbol} confirming our current directional bias.`}</p>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral-500 flex items-center uppercase tracking-widest">
                  {isLocked ? <><Shield size={12} className="mr-1.5" /> Secure Desk</> : <><Unlock size={12} className="mr-1.5 text-emerald-500" /> Public Access</>}
                </span>
                {isLocked && (
                  <Link href="/signup" className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-white transition-colors">
                    Join to read full notes
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 🚨 SEO & UX ADDITION: Recent Market Intelligence Grid */}
        {recentSetups.length > 0 && (
          <div className="mt-20 pt-12 border-t border-zinc-800/50">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase tracking-widest text-white">Recent Market Intelligence</h2>
              <Link href="/" className="text-[10px] font-bold text-neutral-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentSetups.map((recent, idx) => (
                <Link 
                  key={idx} 
                  href={`/analysis/${recent.asset_symbol.toLowerCase()}`}
                  className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-600 rounded-2xl p-6 transition-all group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">{recent.asset_symbol}</h3>
                    <span className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      {recent.timeframe}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                    <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                      recent.bias?.toUpperCase() === 'BULLISH' ? 'text-emerald-500' : 
                      recent.bias?.toUpperCase() === 'BEARISH' ? 'text-red-500' : 'text-zinc-500'
                    }`}>
                      {recent.bias?.toUpperCase() === 'BULLISH' ? <TrendingUp size={12} /> : 
                       recent.bias?.toUpperCase() === 'BEARISH' ? <TrendingDown size={12} /> : <Minus size={12} />}
                      {recent.bias || 'NEUTRAL'}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                      <Clock size={10} /> {formatRelativeDate(recent.created_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
