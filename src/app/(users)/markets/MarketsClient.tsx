'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import { Activity, ArrowRight, Target, Archive, Lock } from 'lucide-react'
import { ASSET_CATEGORIES } from '@/lib/platformConfig'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = [
  { id: 'ALL', label: 'All' },
  ...Object.keys(ASSET_CATEGORIES).map(category => ({
    id: category,
    label: category.charAt(0) + category.slice(1).toLowerCase(),
  }))
]

// --- DUMMY DATA FOR DEMO TIER ---
const DEMO_SETUPS = [
  {
    id: 'demo-1', asset_symbol: 'BTCUSD', direction: 'LONG', category: 'Crypto', timeframe: '4H', bias: 'BULLISH',
    status: 'ACTIVE', notes: '<p><b>Macro:</b> Bullish market structure. Price swept Asian session lows.</p>',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-2', asset_symbol: 'EURUSD', direction: 'SHORT', category: 'Forex', timeframe: '15M', bias: 'BEARISH',
    status: 'WAITING', notes: '<p>Standard premium supply mitigation. DXY is strong.</p>',
    image_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'demo-3', asset_symbol: 'XAUUSD', direction: 'LONG', category: 'Commodities', timeframe: '1D', bias: 'BULLISH',
    status: 'WAITING', notes: '<p>Gold ranging between 2300 and 2350. Buying the discount.</p>',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

const buildDemoGroups = () => {
  const grouped = DEMO_SETUPS.reduce((acc: any, curr: any) => {
    if (!acc[curr.asset_symbol]) {
      acc[curr.asset_symbol] = {
        symbol: curr.asset_symbol, category: (curr.category || 'FOREX').toUpperCase(),
        latestSetupId: curr.id, isPrime: true, lastUpdated: curr.created_at,
        count: 0, activeCount: 0, waitingCount: 0, archivedCount: 0, timeframes: []
      }
    }
    acc[curr.asset_symbol].count += 1
    const status = (curr.status || 'WAITING').toUpperCase()
    if (status === 'ACTIVE') acc[curr.asset_symbol].activeCount += 1
    else if (status === 'WAITING') acc[curr.asset_symbol].waitingCount += 1
    if (!acc[curr.asset_symbol].timeframes.includes(curr.timeframe)) acc[curr.asset_symbol].timeframes.push(curr.timeframe)
    return acc
  }, {})
  return Object.values(grouped)
}

const AssetIcon = ({ symbol, category }: { symbol: string, category: string }) => {
  const cleanSymbol = symbol.toUpperCase().trim();
  let bgTint = "from-neutral-800/80 to-[#0a0a0a]";
  if (category === 'FOREX') bgTint = "from-blue-900/30 to-[#0a0a0a]";
  else if (category === 'CRYPTO') bgTint = "from-purple-900/30 to-[#0a0a0a]";
  else if (category === 'COMMODITY' || category === 'METALS') bgTint = "from-amber-900/30 to-[#0a0a0a]";
  else if (category === 'INDICES' || category === 'STOCKS') bgTint = "from-emerald-900/30 to-[#0a0a0a]";

  if (cleanSymbol.length === 6) {
    const base = cleanSymbol.substring(0, 3);
    const quote = cleanSymbol.substring(3, 6);
    return (
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${bgTint} border border-white/[0.04] flex flex-col items-center justify-center shrink-0 shadow-[inset_0_2px_10px_rgba(255,255,255,0.03)] group-hover:border-blue-500/30 transition-colors duration-500`}>
        <span className="text-[10px] md:text-[11px] font-black text-white leading-none tracking-widest mt-1 font-mono">{base}</span>
        <div className="w-5 md:w-6 h-[1px] bg-white/10 my-[3px] md:my-[4px]"></div>
        <span className="text-[10px] md:text-[11px] font-bold text-neutral-500 leading-none tracking-widest mb-1 font-mono">{quote}</span>
      </div>
    );
  }

  return (
    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${bgTint} border border-white/[0.04] flex items-center justify-center shrink-0 shadow-[inset_0_2px_10px_rgba(255,255,255,0.03)] group-hover:border-blue-500/30 transition-colors duration-500`}>
      <span className="text-[11px] md:text-xs font-black text-white tracking-widest font-mono">
        {cleanSymbol.length > 5 ? cleanSymbol.substring(0, 4) : cleanSymbol}
      </span>
    </div>
  );
}

// 🚀 SWR FETCHER
const fetchMarketsData = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const [ { data: profile }, { data: analyses } ] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', session.user.id).single(),
    supabase.from('analyses').select('*').order('created_at', { ascending: false })
  ])

  let groupedArray: any[] = []
  if (analyses) {
    const grouped = analyses.reduce((acc: any, curr: any) => {
      if (!acc[curr.asset_symbol]) {
        acc[curr.asset_symbol] = {
          symbol: curr.asset_symbol, category: (curr.category || 'FOREX').toUpperCase(),
          latestSetupId: curr.id, isPrime: curr.is_prime || false, lastUpdated: curr.created_at,
          count: 0, activeCount: 0, waitingCount: 0, doneCount: 0, timeframes: []
        }
      }
      acc[curr.asset_symbol].count += 1
      const status = (curr.status || 'WAITING').toUpperCase()
      if (status === 'ACTIVE') acc[curr.asset_symbol].activeCount += 1
      else if (status === 'WAITING') acc[curr.asset_symbol].waitingCount += 1
      else if (status === 'DONE') acc[curr.asset_symbol].doneCount += 1
      if (!acc[curr.asset_symbol].timeframes.includes(curr.timeframe)) acc[curr.asset_symbol].timeframes.push(curr.timeframe)
      if (curr.is_prime) acc[curr.asset_symbol].isPrime = true;
      return acc
    }, {})
    groupedArray = Object.values(grouped)
  }

  return { plan: profile?.plan?.toLowerCase() || 'demo', groupedArray, userId: session.user.id }
}

export default function MarketsClient() {
  const router = useRouter()
  const searchParams = useSearchParams() 
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search')?.toLowerCase() || '')
  
  const [activeTab, setActiveTab] = useState('ALL')
  const [prevIndex, setPrevIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right')
  const [unseenAssets, setUnseenAssets] = useState<Set<string>>(new Set())

  // 🚀 SWR CACHE
  const { data, isLoading } = useSWR('markets_data', fetchMarketsData, { dedupingInterval: 60000 })

  useEffect(() => {
    const handleSearch = (e: any) => setSearchQuery(e.detail?.toLowerCase() || '')
    window.addEventListener('globalSearch', handleSearch)
    return () => window.removeEventListener('globalSearch', handleSearch)
  }, [])

  useEffect(() => {
    const fetchUnseenStatus = async () => {
      if (!data?.userId || data?.plan !== 'pro') return;
      const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString();
      const { data: recentSetups } = await supabase.from('analyses').select('id, asset_symbol').in('status', ['ACTIVE', 'WAITING']).gte('created_at', sevenDaysAgo);
      if (!recentSetups || recentSetups.length === 0) return;
      const { data: seenData } = await supabase.from('user_seen_setups').select('analysis_id').eq('user_id', data.userId);
      const seenIds = new Set(seenData?.map(s => s.analysis_id) || []);
      const unseen = new Set<string>();
      recentSetups.forEach(setup => { if (!seenIds.has(setup.id)) unseen.add(setup.asset_symbol); });
      setUnseenAssets(unseen);
    };
    if (data) fetchUnseenStatus();
  }, [data]);

  // 🚨 INSTANT SKELETON
  if (isLoading || !data) {
    return (
      <div className="w-full bg-[#050505] p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100dvh-65px)]">
        <div className="max-w-[90rem] mx-auto w-full flex flex-col min-h-0">
          <div className="shrink-0 w-full mb-6 md:mb-8 h-10 bg-[#0a0a0a] rounded-xl border border-neutral-800 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 min-h-[140px] animate-pulse">
                <div className="w-14 h-14 bg-neutral-900 rounded-xl mb-4"></div>
                <div className="h-4 w-24 bg-neutral-900 rounded mt-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isProUser = data.plan === 'pro' || data.plan === 'premium'
  const finalGroups = isProUser ? data.groupedArray : buildDemoGroups()

  const handleTabChange = (id: string, index: number) => {
    setSlideDirection(index > prevIndex ? 'right' : 'left')
    setPrevIndex(index)
    setActiveTab(id)
  }

  const filteredMarkets = finalGroups.filter(market => {
    const matchesTab = activeTab === 'ALL' ? true : market.category === activeTab
    const matchesSearch = (market.symbol || '').toLowerCase().includes(searchQuery)
    return matchesTab && matchesSearch
  })

  return (
    <div className="w-full bg-[#050505] p-4 md:p-6 lg:p-8 font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="max-w-[90rem] mx-auto w-full h-full flex flex-col min-h-0">
        
        <div className="shrink-0 w-full mb-6 md:mb-8 flex items-center gap-4">
          <div className="flex items-center space-x-1.5 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/[0.05] overflow-x-auto w-full scrollbar-hide shadow-sm relative">
            {!isProUser && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl border border-white/[0.02]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5"><Lock size={12}/> Global Markets</span>
              </div>
            )}
            {CATEGORIES.map((cat, idx) => {
              const active = activeTab === cat.id
              return (
                <button 
                  key={cat.id}
                  onClick={() => { if (isProUser) handleTabChange(cat.id, idx); }}
                  className={`relative flex items-center px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0
                    ${active ? 'bg-white text-black shadow-md scale-[1.02]' : 'text-neutral-500 hover:text-white hover:bg-white/[0.04]'}`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
          
          {!isProUser && (
            <div className="hidden md:flex shrink-0 items-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shadow-sm h-full">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                Sandbox Mode <Lock size={12} className="stroke-[3]" />
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-6 pr-1">
          <div 
            key={`${activeTab}-${searchQuery}`}
            className={`animate-in duration-500 fill-mode-both ${slideDirection === 'right' ? 'slide-in-from-right-12' : 'slide-in-from-left-12'} fade-in h-full`}
          >
            {filteredMarkets.length === 0 ? (
              <div className="max-w-2xl mx-auto border border-white/[0.05] rounded-3xl p-12 md:p-20 flex flex-col items-center text-center bg-[#0a0a0a] mt-12 shadow-sm">
                <div className="flex flex-col items-center opacity-50">
                  <Activity size={32} className="text-neutral-600 mb-5 stroke-1" />
                  <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">
                    {searchQuery ? `No markets matching "${searchQuery}"` : "No Active Setups"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
                {filteredMarkets.map(market => {
                  const hasUnseen = unseenAssets.has(market.symbol);
                  return (
                    <div 
                      key={market.symbol}
                      onClick={() => { if (isProUser) router.push(`/markets/viewport?asset=${market.symbol}&from=markets`); }}
                      className={`bg-[#0a0a0a] border rounded-2xl p-5 transition-all duration-300 flex flex-col min-h-[140px] relative overflow-hidden
                        ${!isProUser ? 'opacity-80' : 'cursor-pointer group'}
                        ${hasUnseen && isProUser ? 'border-blue-500/20 bg-blue-500/[0.02] shadow-[0_0_15px_rgba(59,130,246,0.05)]' : ''}
                        ${market.isPrime && !hasUnseen && isProUser ? 'border-blue-500/30 bg-blue-500/[0.02] hover:border-blue-500/60 shadow-[0_0_20px_rgba(37,99,235,0.08)]' : ''}
                        ${!market.isPrime && !hasUnseen && isProUser ? 'border-white/[0.04] hover:border-white/10 hover:bg-[#0c0c0c] shadow-sm' : ''}
                        ${!isProUser ? 'border-white/[0.04] shadow-sm' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-5 z-10">
                        <div className="flex items-center space-x-3.5">
                          <AssetIcon symbol={market.symbol} category={market.category} />
                          <div className="flex flex-col justify-center gap-1.5">
                            <h3 className="text-xl font-black text-white tracking-tight leading-none font-mono">{market.symbol}</h3>
                            <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest leading-none bg-[#111] px-1.5 py-0.5 rounded w-fit border border-white/[0.02]">{market.category}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          {hasUnseen && isProUser && (
                            <div className="flex items-center px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                              <span className="relative flex h-1.5 w-1.5 mr-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                              </span>
                              <span className="text-[8px] font-black uppercase tracking-widest">New</span>
                            </div>
                          )}
                          {market.isPrime && (
                            <div className="flex items-center px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-sm" title="Prime Setup Active">
                              <Target size={10} className="mr-1.5" />
                              <span className="text-[8px] font-black uppercase tracking-widest">Prime</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                          {market.activeCount > 0 && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" title={`${market.activeCount} Active Setups`}></div>}
                          {market.waitingCount > 0 && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" title={`${market.waitingCount} Waiting Setups`}></div>}
                          {market.activeCount === 0 && market.waitingCount === 0 && market.archivedCount > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800/30 border border-neutral-700/50 rounded text-[10px] font-black text-neutral-500" title={`${market.archivedCount} Archived Setups`}>
                              <Archive size={10} /> Archived
                            </div>
                          )}
                          {market.activeCount === 0 && market.waitingCount === 0 && !market.archivedCount && (
                            <span className="text-[9px] font-bold text-neutral-500 bg-[#111] px-3 py-1 rounded border border-white/[0.05] uppercase tracking-widest shadow-inner">
                              {market.count} Total
                            </span>
                          )}
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); if (isProUser) router.push(`/markets/archive?asset=${market.symbol}&from=markets`); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 shadow-sm
                            ${!isProUser ? 'bg-[#111] border border-white/[0.05] text-neutral-600 cursor-not-allowed' : market.isPrime ? 'bg-[#111] border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500' : 'bg-[#111] border border-white/[0.05] text-neutral-500 hover:text-white hover:bg-[#222] hover:border-white/10 group-hover:bg-[#151515] group-hover:border-white/10 group-hover:text-white'}
                          `}
                        >
                          {isProUser ? <ArrowRight size={14} /> : <Lock size={12} />}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
