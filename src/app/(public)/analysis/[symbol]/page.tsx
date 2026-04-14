import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { TrendingUp, TrendingDown, Minus, Clock, Lock } from 'lucide-react'

// Force fresh data load for immediate updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    .select('bias, timeframe, created_at, image_url') 
    .eq('asset_symbol', symbol)
    .eq('is_locked', false) 
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  })

  if (!setup) {
    return {
      title: `Market Setup Hub | MyTraderDesk`,
      description: `Institutional-grade market structure analysis and directional biases for active pairs.`,
    }
  }

  return {
    title: `${symbol} Analysis (${today}) | MyTraderDesk`,
    description: `Live ${setup.timeframe} public market structure analysis for ${symbol}. Current bias: ${setup.bias || 'Neutral'}.`,
    openGraph: {
      title: `${symbol} Public Setup | MyTraderDesk`,
      images: [{ url: setup.image_url || '/og-image.jpg' }],
    },
  }
}

// Helper to format dates cleanly
function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

// Helper for Bias Colors
function getBiasColor(bias: string) {
  switch (bias?.toUpperCase()) {
    case 'BULLISH': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'BEARISH': return 'text-red-500 bg-red-500/10 border-red-500/20';
    default: return 'text-neutral-400 bg-neutral-800/50 border-neutral-700';
  }
}

// 2. THE PAGE UI
export default async function PublicAnalysisTeaser({ params }: Props) {
  const resolvedParams = await params
  const symbol = resolvedParams.symbol.toUpperCase()

  // STRICTLY fetches the single most recent chart for this symbol
  const { data: setup } = await supabase
    .from('analyses')
    .select('*')
    .eq('asset_symbol', symbol)
    .eq('is_locked', false) 
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Fetches recent setups to build the sidebar
  const { data: rawRecent } = await supabase
    .from('analyses')
    .select('asset_symbol, timeframe, created_at, bias')
    .eq('is_locked', false)
    .order('created_at', { ascending: false })
    .limit(50);

  // STRICT FILTERING: Ensures only the latest 1 chart per instrument is kept
  const allPublicSetups = [];
  const seenSymbols = new Set();
  for (const item of (rawRecent || [])) {
    if (!seenSymbols.has(item.asset_symbol)) {
      seenSymbols.add(item.asset_symbol);
      allPublicSetups.push(item);
    }
  }

  // HUB VIEW (If requested symbol is missing)
  if (!setup) {
    return (
      <div className="h-screen w-full bg-[#0A0A0B] text-neutral-200 font-sans p-6 selection:bg-blue-500/30 flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
          <div className="mb-6 border-b border-neutral-800 pb-4 flex-none">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Market Intelligence Hub</h1>
            <p className="text-sm text-neutral-500 mt-1">Select an active pair to view the latest open-source institutional structural analysis.</p>
          </div>

          <div className="flex-1 overflow-auto">
            {allPublicSetups.length > 0 ? (
              <div className="bg-[#111113] border border-neutral-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#18181B] border-b border-neutral-800 text-neutral-400">
                      <th className="py-3 px-4 font-medium uppercase text-xs tracking-wider">Asset</th>
                      <th className="py-3 px-4 font-medium uppercase text-xs tracking-wider">Timeframe</th>
                      <th className="py-3 px-4 font-medium uppercase text-xs tracking-wider">Directional Bias</th>
                      <th className="py-3 px-4 font-medium uppercase text-xs tracking-wider text-right">Published</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {allPublicSetups.map((recent, idx) => (
                      <tr key={idx} className="hover:bg-[#18181B] transition-colors group">
                        <td className="py-3 px-4">
                          <Link href={`/analysis/${recent.asset_symbol.toLowerCase()}`} className="font-semibold text-white group-hover:text-blue-400 transition-colors block">
                            {recent.asset_symbol}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-neutral-400">{recent.timeframe}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold tracking-wide border ${getBiasColor(recent.bias)}`}>
                            {recent.bias?.toUpperCase() === 'BULLISH' ? <TrendingUp size={12} /> : 
                             recent.bias?.toUpperCase() === 'BEARISH' ? <TrendingDown size={12} /> : <Minus size={12} />}
                            {recent.bias || 'NEUTRAL'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-500 text-xs whitespace-nowrap">
                          {formatRelativeDate(recent.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
               <div className="text-center py-16 border border-neutral-800 rounded-lg bg-[#111113]">
                 <p className="text-neutral-500 text-sm">No public setups currently active.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // MAIN SETUP VIEW
  const relatedSetups = allPublicSetups.filter(s => s.asset_symbol !== symbol).slice(0, 15);
  const isBull = setup.bias?.toUpperCase() === 'BULLISH'
  const isBear = setup.bias?.toUpperCase() === 'BEARISH'

  return (
    // 'h-screen overflow-hidden' ensures no page scrolling. Padding reduced to p-4/p-6
    <div className="h-screen w-full bg-[#0A0A0B] text-neutral-200 font-sans p-4 sm:p-6 overflow-hidden selection:bg-blue-500/30 flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto flex flex-col h-full">
        
        {/* Header - Fixed Height */}
        <div className="flex-none flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-800 pb-4 mb-4 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">{symbol}</h1>
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-xs font-medium">Public View</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <span className="flex items-center gap-1"><Clock size={14} /> {formatRelativeDate(setup.created_at)}</span>
              <span>•</span>
              <span>{setup.timeframe} TF</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] text-neutral-500 uppercase font-semibold tracking-wider mb-1">Desk Bias</span>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold tracking-wide border ${getBiasColor(setup.bias)}`}>
                {isBull ? <TrendingUp size={14} /> : isBear ? <TrendingDown size={14} /> : <Minus size={14} />}
                {setup.bias || 'NEUTRAL'}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Grid Layout - Fills Remaining Space */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          
          {/* Main Chart Column */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
            {/* Chart Container - Flex 1 scales it to take all available space */}
            <div className="flex-1 bg-[#111113] border border-neutral-800 rounded-lg p-1.5 min-h-0 relative">
              <div className="w-full h-full bg-[#050505] rounded overflow-hidden flex items-center justify-center border border-neutral-900 relative">
                {setup.image_url ? (
                  <img 
                    src={setup.image_url} 
                    alt={`${symbol} Technical Analysis`}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-neutral-600 text-sm">Awaiting Chart Data</span>
                )}
              </div>
            </div>

            {/* Subtle Upsell Bar - Fixed Height at bottom */}
            <div className="flex-none flex items-center justify-between bg-[#111113] border border-neutral-800 rounded-lg px-4 py-3">
              <div className="text-sm text-neutral-400">
                To master your trading routine and build consistent profitability, join our private desk.
              </div>
              <Link href="/signup" className="flex items-center gap-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded shadow-md">
                <Lock size={12} /> Join Desk
              </Link>
            </div>
          </div>

          {/* Right Sidebar - Recent Market Intelligence */}
          <div className="lg:col-span-1 h-full min-h-0">
            <div className="bg-[#111113] border border-neutral-800 rounded-lg flex flex-col h-full">
              <div className="flex-none px-4 py-3 border-b border-neutral-800">
                <h3 className="text-sm font-semibold text-white">Latest Setups</h3>
              </div>
              
              {/* Scrollable internal list if there are many unique charts */}
              <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/50">
                {relatedSetups.map((recent, idx) => (
                  <Link 
                    key={idx} 
                    href={`/analysis/${recent.asset_symbol.toLowerCase()}`}
                    className="px-4 py-3 hover:bg-[#18181B] transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors mb-0.5">
                        {recent.asset_symbol}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                        <span>{recent.timeframe}</span>
                        <span>•</span>
                        <span>{formatRelativeDate(recent.created_at).split(',')[0]}</span>
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-bold uppercase ${
                      recent.bias?.toUpperCase() === 'BULLISH' ? 'text-emerald-500' : 
                      recent.bias?.toUpperCase() === 'BEARISH' ? 'text-red-500' : 'text-neutral-500'
                    }`}>
                      {recent.bias?.substring(0, 4)}
                    </span>
                  </Link>
                ))}
                
                {relatedSetups.length === 0 && (
                  <div className="p-4 text-xs text-neutral-500 text-center">No other setups available.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
