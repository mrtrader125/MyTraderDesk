'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowRight, Lock, Activity, Archive } from 'lucide-react'
import { ASSET_CATEGORIES } from '@/lib/platformConfig'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = [
  { id: 'ALL', label: 'All Markets' },
  ...Object.keys(ASSET_CATEGORIES).map(category => ({
    id: category,
    label: category.charAt(0) + category.slice(1).toLowerCase(),
  }))
]

// 🚀 SWR FETCHER: Grabs fresh market data in the background
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
  const [unseenAssets, setUnseenAssets] = useState<Set<string>>(new Set())

  // 🚀 SWR CACHING
  const { data, isLoading } = useSWR('markets_data', fetchMarketsData, {
    revalidateOnFocus: false,
    dedupingInterval: 60000 
  })

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

  // 🚨 INSTANT SHELL
  if (isLoading || !data) {
    return (
      <div className="w-full bg-transparent p-4 md:p-8 flex flex-col h-[calc(100dvh-65px)]">
        <div className="max-w-[90rem] mx-auto w-full flex flex-col min-h-0">
          <div className="shrink-0 w-64 mb-8 h-8 bg-[#0a0a0a] rounded-md animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className="bg-[#0a0a0a] border border-white/[0.02] rounded-xl h-[100px] animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isProUser = data.plan === 'pro' || data.plan === 'premium'
  const filteredMarkets = data.groupedArray.filter((m: any) => {
    const matchesTab = activeTab === 'ALL' ? true : m.category === activeTab
    const matchesSearch = (m.symbol || '').toLowerCase().includes(searchQuery)
    return matchesTab && matchesSearch
  })

  return (
    <div className="w-full bg-transparent p-4 md:p-8 font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="max-w-[90rem] mx-auto w-full h-full flex flex-col min-h-0">
        
        {/* Sleek Minimalist Nav Pills */}
        <div className="shrink-0 w-full mb-8 relative border-b border-white/[0.05] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {!isProUser && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] rounded-md border border-white/[0.05] text-neutral-500 shrink-0">
                <Lock size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Locked</span>
              </div>
            )}
            
            {CATEGORIES.map((cat) => {
              const active = activeTab === cat.id
              return (
                <button 
                  key={cat.id}
                  onClick={() => { if (isProUser) setActiveTab(cat.id); }}
                  className={`relative flex items-center px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all whitespace-nowrap shrink-0
                    ${active 
                      ? 'bg-white text-black' 
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                    } ${!isProUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dense Institutional Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-6 pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filteredMarkets.map((market: any) => {
              const hasUnseen = unseenAssets.has(market.symbol);
              
              // Formatting the symbol nicely
              const cleanSymbol = market.symbol.toUpperCase().trim()
              const isStandardPair = cleanSymbol.length === 6
              const isArchived = market.activeCount === 0 && market.waitingCount === 0;
              
              return (
                <div 
                  key={market.symbol}
                  // 🚨 1. CARD CLICK -> ALWAYS GOES TO VIEWPORT
                  onClick={() => { 
                    if (isProUser) router.push(`/markets/viewport?asset=${market.symbol}&from=markets`); 
                  }}
                  className={`bg-[#0a0a0a] border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between min-h-[110px] relative group
                    ${!isProUser ? 'opacity-60 grayscale' : 'cursor-pointer hover:border-white/[0.15] hover:bg-[#0c0c0c]'}
                    ${hasUnseen && isProUser ? 'border-blue-500/30' : 'border-white/[0.04]'}
                  `}
                >
                  {/* Top: Asset Identity */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg md:text-xl font-mono text-white tracking-tight flex items-baseline gap-1">
                        {isStandardPair ? (
                          <><span>{cleanSymbol.substring(0,3)}</span><span className="text-neutral-500 text-sm">{cleanSymbol.substring(3,6)}</span></>
                        ) : (
                          cleanSymbol
                        )}
                      </h3>
                      <span className="text-[9px] font-medium text-neutral-500 tracking-widest uppercase">
                        {market.category}
                      </span>
                    </div>
                    
                    {hasUnseen && isProUser && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                    )}
                  </div>

                  {/* Bottom: Setup Data Density */}
                  <div className="flex items-end justify-between mt-4">
                    <div className="flex flex-col gap-0.5 pointer-events-none">
                      {market.activeCount > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-mono tracking-wide">
                          <Activity size={10} /> {market.activeCount} ACTIVE
                        </div>
                      )}
                      {market.waitingCount > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-500/80 font-mono tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 ml-0.5" /> {market.waitingCount} WAIT
                        </div>
                      )}
                      {isArchived && (
                        <span className="text-[10px] text-neutral-600 font-mono uppercase flex items-center gap-1">
                          <Archive size={10} /> Archived
                        </span>
                      )}
                    </div>
                    
                    {/* 🚨 2. ARROW CLICK -> GOES TO ARCHIVE */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // <-- Stops the card click from triggering
                        if (isProUser) router.push(`/markets/archive?asset=${market.symbol}`);
                      }}
                      className="text-neutral-600 hover:text-white p-2 -mr-2 transition-colors duration-200 cursor-pointer relative z-10"
                    >
                      {isProUser ? <ArrowRight size={14} /> : <Lock size={12} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
