'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Activity, Lock, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { ASSET_CATEGORIES, PLAN_CONFIG } from '@/lib/platformConfig'

const CATEGORIES = [
  { id: 'ALL', label: 'All', req: 'free' },
  ...Object.keys(ASSET_CATEGORIES).map(category => {
    let requiredTier = 'premium';
    if (PLAN_CONFIG.free.allowedCategories.includes(category)) requiredTier = 'free';
    else if (PLAN_CONFIG.essential.allowedCategories.includes(category)) requiredTier = 'essential';
    else if (PLAN_CONFIG.pro.allowedCategories.includes(category)) requiredTier = 'pro';
    return {
      id: category,
      label: category.charAt(0) + category.slice(1).toLowerCase(),
      req: requiredTier
    }
  })
]

// --- THE TRADINGVIEW-STYLE LOGO ENGINE ---
const FLAG_MAP: Record<string, string> = {
  EUR: '🇪🇺', USD: '🇺🇸', GBP: '🇬🇧', JPY: '🇯🇵',
  AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭', NZD: '🇳🇿',
}

const AssetIcon = ({ symbol, category }: { symbol: string, category: string }) => {
  const upperSymbol = symbol.toUpperCase();

  // 1. FOREX: Overlapping TradingView Style Flags
  if (category === 'FOREX' && upperSymbol.length >= 6) {
    const base = upperSymbol.substring(0, 3);
    const quote = upperSymbol.substring(3, 6);
    const flag1 = FLAG_MAP[base] || '🏳️';
    const flag2 = FLAG_MAP[quote] || '🏳️';
    
    return (
      <div className="flex -space-x-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#111] border border-neutral-700 flex items-center justify-center text-xl z-10 shadow-[2px_0_8px_rgba(0,0,0,0.5)] overflow-hidden">
          <span className="scale-[1.8]">{flag1}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#111] border border-neutral-800 flex items-center justify-center text-xl z-0 overflow-hidden opacity-90">
          <span className="scale-[1.8]">{flag2}</span>
        </div>
      </div>
    );
  }

  // 2. METALS / COMMODITIES
  if (upperSymbol.includes('XAU') || upperSymbol.includes('GOLD')) {
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0 border border-amber-400/30">
        Au
      </div>
    );
  }
  if (upperSymbol.includes('XAG') || upperSymbol.includes('SILVER')) {
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(148,163,184,0.2)] shrink-0 border border-slate-300/30">
        Ag
      </div>
    );
  }
  if (upperSymbol.includes('WTI') || upperSymbol.includes('OIL')) {
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neutral-700 to-black flex items-center justify-center text-xl border border-neutral-600 shrink-0">
        🛢️
      </div>
    );
  }

  // 3. CRYPTO
  if (upperSymbol.includes('BTC')) {
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_15px_rgba(249,115,22,0.2)] shrink-0 border border-orange-400/30">
        ₿
      </div>
    );
  }
  if (upperSymbol.includes('ETH')) {
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_15px_rgba(79,70,229,0.2)] shrink-0 border border-indigo-400/30">
        Ξ
      </div>
    );
  }
  if (upperSymbol.includes('SOL')) {
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] shrink-0">
        ◎
      </div>
    );
  }

  // 4. FALLBACK (Indices or Unknowns)
  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0 border border-blue-400/30">
      {upperSymbol.substring(0, 1)}
    </div>
  );
}
// ------------------------------------------

function MarketsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search')?.toLowerCase() || '')
  const [groupedAnalyses, setGroupedAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ALL')
  const [userPlan, setUserPlan] = useState('free')
  
  const [prevIndex, setPrevIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right')

  useEffect(() => {
    const handleSearch = (e: any) => setSearchQuery(e.detail?.toLowerCase() || '')
    window.addEventListener('globalSearch', handleSearch)
    return () => window.removeEventListener('globalSearch', handleSearch)
  }, [])

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
          if (profile?.plan) setUserPlan(profile.plan.toLowerCase())
        }
        const { data, error } = await supabase.from('analyses').select('*').order('created_at', { ascending: false })
        
        if (!error && data) {
          const grouped = data.reduce((acc: any, curr: any) => {
            if (!acc[curr.asset_symbol]) {
              acc[curr.asset_symbol] = {
                symbol: curr.asset_symbol,
                category: (curr.category || 'FOREX').toUpperCase(),
                latestSetupId: curr.id,
                latestImage: curr.image_url,
                latestBias: curr.bias,
                lastUpdated: curr.created_at,
                count: 0,
                timeframes: []
              }
            }
            acc[curr.asset_symbol].count += 1
            if (!acc[curr.asset_symbol].timeframes.includes(curr.timeframe)) {
              acc[curr.asset_symbol].timeframes.push(curr.timeframe)
            }
            return acc
          }, {})
          setGroupedAnalyses(Object.values(grouped))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMarketData()
  }, [])

  const handleTabChange = (id: string, index: number) => {
    setSlideDirection(index > prevIndex ? 'right' : 'left')
    setPrevIndex(index)
    setActiveTab(id)
  }

  const isLocked = (reqTier: string) => {
    if (userPlan === 'premium') return false
    if (userPlan === 'pro' && reqTier !== 'premium') return false
    if (userPlan === 'essential' && (reqTier === 'essential' || reqTier === 'free')) return false
    if (userPlan === 'free' && reqTier === 'free') return false
    return true
  }

  const filteredMarkets = groupedAnalyses.filter(market => {
    const matchesTab = activeTab === 'ALL' ? true : market.category === activeTab
    const matchesSearch = (market.symbol || '').toLowerCase().includes(searchQuery)
    return matchesTab && matchesSearch
  })

  if (loading) return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-[#050505] p-6 md:p-8 overflow-x-hidden">
      <div className="flex flex-col items-center mb-10 mt-2">
        <div className="h-10 w-full max-w-xl bg-neutral-200 dark:bg-[#0a0a0a] border border-neutral-300 dark:border-neutral-800 rounded-2xl animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-card-bg border border-neutral-200 dark:border-card-border shadow-md dark:shadow-card rounded-2xl p-5 min-h-[140px] flex flex-col justify-between animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800/50 shrink-0"></div>
              <div className="space-y-2 w-full pt-1">
                <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-800/50 rounded-md"></div>
                <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-800/50 rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="w-full min-h-screen bg-[#050505] p-6 md:p-8 font-sans overflow-x-hidden">
      <div className="flex flex-col items-center mb-10 mt-2">
        <div className="flex items-center space-x-1 bg-[#0a0a0a] p-1.5 rounded-2xl border border-neutral-800">
          {CATEGORIES.map((cat, idx) => {
            const locked = isLocked(cat.req)
            const active = activeTab === cat.id
            return (
              <button 
                key={cat.id}
                onClick={() => !locked && handleTabChange(cat.id, idx)}
                className={`relative flex items-center px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all
                  ${active ? 'bg-white text-black shadow-xl scale-105' : 
                    locked ? 'text-neutral-600 cursor-not-allowed opacity-50' : 'text-neutral-500 hover:text-white'}`}
              >
                {locked && <Lock size={10} className="mr-1.5" />}
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      <div 
        key={`${activeTab}-${searchQuery}`}
        className={`animate-in duration-500 fill-mode-both 
          ${slideDirection === 'right' ? 'slide-in-from-right-12' : 'slide-in-from-left-12'} 
          fade-in`}
      >
        {filteredMarkets.length === 0 ? (
          <div className="max-w-md mx-auto border border-dashed border-neutral-800 rounded-3xl p-12 flex flex-col items-center text-center bg-[#0a0a0a]">
            {userPlan === 'free' && activeTab !== 'ALL' && activeTab !== 'FOREX' ? (
               <>
                 <Lock size={32} className="text-blue-500 mb-4" />
                 <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Access Restricted</h3>
                 <button onClick={() => router.push('/account/subscription')} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors">Upgrade</button>
               </>
            ) : (
              <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">
                {searchQuery ? `No markets matching "${searchQuery}"` : "No Active Setups"}
              </span>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMarkets.map(market => (
              <div 
                key={market.symbol}
                onClick={() => router.push(`/markets/viewport?asset=${market.symbol}&from=markets`)}
                className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] transition-all duration-300 cursor-pointer group flex flex-col min-h-[140px]"
              >
                <div className="flex justify-between items-start mb-4">
                  
                  <div className="flex items-center space-x-4">
                    {/* NEW: Dynamic Logo Component */}
                    <AssetIcon symbol={market.symbol} category={market.category} />
                    
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">{market.symbol}</h3>
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{market.category}</span>
                    </div>
                  </div>

                  {market.latestBias && (
                    <div className={`flex items-center px-2 py-1 rounded-md border ${market.latestBias === 'BULLISH' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {market.latestBias === 'BULLISH' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                      <span className="text-[9px] font-black uppercase tracking-widest">{market.latestBias}</span>
                    </div>
                  )}
                  
                </div>

                <div className="mt-auto pt-4 border-t border-neutral-800/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-white bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                      {market.count} Setup{market.count > 1 ? 's' : ''}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); router.push(`/markets/archive?asset=${market.symbol}&from=markets`); }}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MarketsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><Activity className="animate-pulse text-blue-500" size={32} /></div>}>
      <MarketsContent />
    </Suspense>
  )
}
