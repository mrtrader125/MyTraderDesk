'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Activity, Lock, Target, ArrowRight } from 'lucide-react'
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

// --- THE UNIVERSAL TYPOGRAPHIC TERMINAL ENGINE ---
const AssetIcon = ({ symbol, category }: { symbol: string, category: string }) => {
  const cleanSymbol = symbol.toUpperCase().trim();
  
  let bgTint = "from-neutral-800/80 to-[#0a0a0a]";
  if (category === 'FOREX') bgTint = "from-blue-900/30 to-[#0a0a0a]";
  else if (category === 'CRYPTO') bgTint = "from-purple-900/30 to-[#0a0a0a]";
  else if (category === 'COMMODITIES' || category === 'METALS') bgTint = "from-amber-900/30 to-[#0a0a0a]";
  else if (category === 'INDICES' || category === 'STOCKS') bgTint = "from-emerald-900/30 to-[#0a0a0a]";

  if (cleanSymbol.length === 6) {
    const base = cleanSymbol.substring(0, 3);
    const quote = cleanSymbol.substring(3, 6);
    return (
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${bgTint} border border-neutral-800/80 flex flex-col items-center justify-center shrink-0 shadow-[inset_0_2px_10px_rgba(255,255,255,0.03)] group-hover:border-blue-500/30 transition-colors duration-500`}>
        <span className="text-[10px] md:text-[11px] font-black text-white leading-none tracking-widest mt-1">{base}</span>
        <div className="w-5 md:w-6 h-[1px] bg-neutral-700/50 my-[3px] md:my-[4px]"></div>
        <span className="text-[10px] md:text-[11px] font-bold text-neutral-500 leading-none tracking-widest mb-1">{quote}</span>
      </div>
    );
  }

  return (
    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${bgTint} border border-neutral-800/80 flex items-center justify-center shrink-0 shadow-[inset_0_2px_10px_rgba(255,255,255,0.03)] group-hover:border-blue-500/30 transition-colors duration-500`}>
      <span className="text-[11px] md:text-xs font-black text-white tracking-widest">
        {cleanSymbol.length > 5 ? cleanSymbol.substring(0, 4) : cleanSymbol}
      </span>
    </div>
  );
}
// -------------------------------------------------

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
                isFeatured: curr.is_featured || false,
                lastUpdated: curr.created_at,
                count: 0,
                timeframes: []
              }
            }
            acc[curr.asset_symbol].count += 1
            if (!acc[curr.asset_symbol].timeframes.includes(curr.timeframe)) {
              acc[curr.asset_symbol].timeframes.push(curr.timeframe)
            }
            if (curr.is_featured) acc[curr.asset_symbol].isFeatured = true;
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

  // SKELETON LOADING (Updated for lock-screen)
  if (loading) return (
    <div className="w-full bg-[#050505] p-4 md:p-8 font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col min-h-0">
        <div className="h-12 w-full max-w-xl bg-[#0a0a0a] border border-neutral-800 rounded-xl animate-pulse mb-6 shrink-0"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 flex-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-4 md:p-5 min-h-[130px] flex items-start space-x-4 animate-pulse">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-neutral-800/50 shrink-0"></div>
              <div className="space-y-2 w-full pt-1">
                <div className="h-4 w-20 bg-neutral-800/50 rounded-md"></div>
                <div className="h-3 w-12 bg-neutral-800/50 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    // 🚨 STRICT LOCK: Internal scrolling only
    <div className="w-full bg-[#050505] p-3 md:p-6 font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col min-h-0">
        
        {/* CATEGORY TABS (Shrink-0 prevents squishing) */}
        <div className="shrink-0 w-full mb-4 md:mb-6">
          {/* 🚨 LEFT ALIGNED FOR MOBILE: overflow-x-auto allows smooth swiping without cutting off tabs */}
          <div className="flex items-center space-x-1.5 bg-[#0a0a0a] p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-neutral-800 overflow-x-auto w-full scrollbar-hide">
            {CATEGORIES.map((cat, idx) => {
              const locked = isLocked(cat.req)
              const active = activeTab === cat.id
              return (
                <button 
                  key={cat.id}
                  onClick={() => !locked && handleTabChange(cat.id, idx)}
                  className={`relative flex items-center px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap shrink-0
                    ${active ? 'bg-white text-black shadow-lg scale-[1.02]' : 
                      locked ? 'text-neutral-600 cursor-not-allowed opacity-50' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
                >
                  {locked && <Lock size={10} className="mr-1.5" />}
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* MARKET CARDS GRID (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-6">
          <div 
            key={`${activeTab}-${searchQuery}`}
            className={`animate-in duration-500 fill-mode-both 
              ${slideDirection === 'right' ? 'slide-in-from-right-12' : 'slide-in-from-left-12'} 
              fade-in h-full`}
          >
            {filteredMarkets.length === 0 ? (
              <div className="max-w-md mx-auto border border-dashed border-neutral-800 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center bg-[#0a0a0a] mt-8 md:mt-12 mx-4">
                {userPlan === 'free' && activeTab !== 'ALL' && activeTab !== 'FOREX' ? (
                   <>
                     <Lock size={32} className="text-blue-500 mb-4" />
                     <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-2">Access Restricted</h3>
                     <button onClick={() => router.push('/account/subscription')} className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors w-full md:w-auto shadow-lg">Upgrade Plan</button>
                   </>
                ) : (
                  <div className="flex flex-col items-center">
                    <Activity size={24} className="text-neutral-700 mb-3" />
                    <span className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      {searchQuery ? `No markets matching "${searchQuery}"` : "No Active Setups"}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filteredMarkets.map(market => (
                  <div 
                    key={market.symbol}
                    onClick={() => router.push(`/markets/viewport?asset=${market.symbol}&from=markets`)}
                    className={`bg-[#0a0a0a] border rounded-2xl p-4 md:p-5 transition-all duration-300 cursor-pointer group flex flex-col min-h-[130px] md:min-h-[140px]
                      ${market.isFeatured ? 'border-amber-500/30 bg-amber-500/[0.02] hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : 'border-neutral-800 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.05)]'}
                    `}
                  >
                    
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <div className="flex items-center space-x-3 md:space-x-4">
                        
                        <AssetIcon symbol={market.symbol} category={market.category} />
                        
                        <div className="flex flex-col justify-center">
                          <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-none mb-1">{market.symbol}</h3>
                          <span className="text-[8px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-none">{market.category}</span>
                        </div>
                      </div>

                      {/* THE "ON RADAR" / PRIME PILL */}
                      {market.isFeatured && (
                        <div className="flex items-center px-2 py-1 md:px-2.5 md:py-1.5 rounded-md border bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                          <Target size={10} className="mr-1 md:mr-1.5" />
                          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Prime</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-3 md:pt-4 border-t border-neutral-800/50 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 bg-[#111] md:bg-neutral-900 px-2.5 py-1 md:px-3 md:py-1.5 rounded-md border border-neutral-800">
                          {market.count} Setup{market.count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/markets/archive?asset=${market.symbol}&from=markets`); }}
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#111] md:bg-neutral-900 border flex items-center justify-center transition-all
                          ${market.isFeatured 
                            ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500' 
                            : 'border-neutral-800 text-neutral-500 hover:text-white hover:bg-blue-600 hover:border-blue-500 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:text-white'}
                        `}
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
