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

  // 🚨 INSTANT SHELL: Shown for 0.1s on first load, then data pops in
  if (isLoading || !data) {
    return (
      <div className="w-full bg-[#050505] p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100dvh-65px)]">
        <div className="max-w-[90rem] mx-auto w-full flex flex-col min-h-0">
          <div className="shrink-0 w-full mb-6 md:mb-8 h-10 bg-[#0a0a0a] rounded-xl animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 min-h-[140px] animate-pulse"></div>
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
    <div className="w-full bg-[#050505] p-4 md:p-6 lg:p-8 font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="max-w-[90rem] mx-auto w-full h-full flex flex-col min-h-0">
        
        <div className="shrink-0 w-full mb-6 md:mb-8 flex items-center gap-4">
          <div className="flex items-center space-x-1.5 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/[0.05] overflow-x-auto w-full scrollbar-hide shadow-sm relative">
            {!isProUser && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl border border-white/[0.02]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5"><Lock size={12}/> Global Markets</span>
              </div>
            )}
            {CATEGORIES.map((cat) => {
              const active = activeTab === cat.id
              return (
                <button 
                  key={cat.id}
                  onClick={() => { if (isProUser) setActiveTab(cat.id); }}
                  className={`relative flex items-center px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0
                    ${active ? 'bg-white text-black shadow-md' : 'text-neutral-500 hover:text-white hover:bg-white/[0.04]'}`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-6 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
            {filteredMarkets.map((market: any) => {
              const hasUnseen = unseenAssets.has(market.symbol);
              return (
                <div 
                  key={market.symbol}
                  onClick={() => { if (isProUser) router.push(`/markets/viewport?asset=${market.symbol}&from=markets`); }}
                  className={`bg-[#0a0a0a] border rounded-2xl p-5 transition-all duration-300 flex flex-col min-h-[140px] relative overflow-hidden
                    ${!isProUser ? 'opacity-80' : 'cursor-pointer group hover:border-neutral-600'}
                    ${hasUnseen && isProUser ? 'border-blue-500/20 bg-blue-500/[0.02]' : 'border-white/[0.04]'}
                  `}
                >
                  <div className="flex justify-between items-start mb-5 z-10">
                    <div className="flex items-center space-x-3.5">
                      <AssetIcon symbol={market.symbol} category={market.category} />
                      <div className="flex flex-col justify-center gap-1.5">
                        <h3 className="text-xl font-black text-white tracking-tight font-mono">{market.symbol}</h3>
                        <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest bg-[#111] px-1.5 py-0.5 rounded border border-white/[0.02]">{market.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      {market.activeCount > 0 && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" title="Active"></div>}
                      {market.waitingCount > 0 && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" title="Waiting"></div>}
                    </div>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#111] border border-white/[0.05] text-neutral-500 group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
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
