'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Clock, Activity, BarChart2, Crown, Shield, Lock, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'

// Define categories and their clearance requirements
const CATEGORIES = [
  { id: 'ALL', label: 'All Markets', req: 'free' },
  { id: 'FOREX', label: 'Forex', req: 'free' },
  { id: 'GOLD', label: 'Gold', req: 'essential' },
  { id: 'CRYPTO', label: 'Crypto', req: 'pro' },
  { id: 'INDICES', label: 'Indices', req: 'pro' },
  { id: 'STOCKS', label: 'Stocks', req: 'pro' }
]

export default function MarketsPage() {
  const router = useRouter()
  const [groupedAnalyses, setGroupedAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Tab State & User Plan
  const [activeTab, setActiveTab] = useState('ALL')
  const [userPlan, setUserPlan] = useState('free')

  useEffect(() => {
    async function fetchMarketData() {
      try {
        // 1. Fetch User Plan
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
          if (profile?.plan) setUserPlan(profile.plan.toLowerCase())
        }

        // 2. Fetch Analyses
        const { data, error } = await supabase.from('analyses').select('*').order('created_at', { ascending: false })

        if (!error && data) {
          // 3. Group by Asset Symbol, preserving the newest setup's data for the card front
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

  const isLocked = (reqTier: string) => {
    if (userPlan === 'pro') return false
    if (userPlan === 'essential' && reqTier === 'pro') return true
    if (userPlan === 'free' && reqTier !== 'free') return true
    return false
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 bg-[#050505]">
        <Activity className="animate-pulse text-blue-500" size={40} />
        <span className="text-[10px] font-black tracking-widest uppercase text-neutral-500">Loading Markets...</span>
      </div>
    )
  }

  // Filter the grouped markets based on the active tab
  const filteredMarkets = groupedAnalyses.filter(market => {
    if (activeTab === 'ALL') return true
    return market.category === activeTab
  })

  // The sleek Market Card
  const MarketCard = ({ market }: { market: any }) => {
    const isBull = market.latestBias?.toUpperCase() === 'BULLISH'
    const isBear = market.latestBias?.toUpperCase() === 'BEARISH'
    const reqTier = market.category === 'CRYPTO' || market.category === 'INDICES' || market.category === 'STOCKS' ? 'PRO' : market.category === 'GOLD' ? 'ESSENTIAL' : 'FREE'

    return (
      <div 
        // 1. Main Click Target: Go to Viewport (Latest Chart)
        onClick={() => router.push(`/analysis/viewport?asset=${market.symbol}`)}
        className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 hover:bg-white/[0.02] hover:border-neutral-600 transition-all cursor-pointer group flex flex-col justify-between min-h-[140px] shadow-sm"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-black border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden relative">
              <img src={market.latestImage} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity duration-500" alt={market.symbol} />
              
              {/* Bias Overlay Icon */}
              <div className={`absolute bottom-0 right-0 p-1 rounded-tl-lg backdrop-blur-md ${isBull ? 'bg-emerald-500/20 text-emerald-500' : isBear ? 'bg-red-500/20 text-red-500' : 'bg-neutral-800/80 text-neutral-400'}`}>
                {isBull ? <TrendingUp size={10} /> : isBear ? <TrendingDown size={10} /> : <Minus size={10} />}
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-white tracking-tight">{market.symbol}</h3>
              </div>
              <div className="flex items-center space-x-1.5 mt-1">
                {reqTier === 'PRO' ? (
                  <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase tracking-wider rounded flex items-center border border-brand-primary/20"><Crown size={8} className="mr-1" /> PRO</span>
                ) : reqTier === 'ESSENTIAL' ? (
                  <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-wider rounded flex items-center border border-blue-500/20"><Shield size={8} className="mr-1" /> ESSENTIAL</span>
                ) : (
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{market.category}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-neutral-800 flex items-end justify-between">
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Active Deployments</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white bg-white/5 px-2 py-1 rounded">
                {market.count} Setup{market.count > 1 ? 's' : ''}
              </span>
              <span className="text-[10px] text-neutral-500 font-medium flex items-center">
                <Clock size={10} className="mr-1" /> {new Date(market.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* 2. Secondary Click Target: Go to Archive (All Charts) */}
          <button 
            onClick={(e) => { e.stopPropagation(); router.push(`/analysis/archive?asset=${market.symbol}`); }}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 hover:scale-110 transition-all shrink-0"
            title="View All History"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] p-6 md:p-8 font-sans overflow-x-hidden">
      
      {/* ULTRA-COMPACT HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
          Global <span className="text-brand-primary">Markets</span>
        </h1>
      </div>

      {/* DYNAMIC CATEGORY TABS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 border-b border-neutral-800 scrollbar-hide">
        {CATEGORIES.map(cat => {
          const locked = isLocked(cat.req)
          return (
            <button 
              key={cat.id}
              onClick={() => !locked && setActiveTab(cat.id)}
              className={`flex items-center px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${activeTab === cat.id 
                  ? 'bg-white text-black shadow-lg' 
                  : locked 
                    ? 'bg-transparent text-neutral-600 cursor-not-allowed border border-transparent' 
                    : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent'}`}
            >
              {locked && <Lock size={14} className="mr-2 text-neutral-600" />}
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* ANIMATED SLIDING CONTAINER */}
      <div key={activeTab} className="animate-in slide-in-from-right-8 fade-in duration-500">
        
        {/* PAYWALL / EMPTY STATE */}
        {filteredMarkets.length === 0 ? (
          <div className="w-full border border-dashed border-neutral-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-[#0a0a0a]">
            {activeTab !== 'ALL' && activeTab !== 'FOREX' && userPlan === 'free' ? (
               <>
                 <Lock size={40} className="text-brand-primary mb-4" />
                 <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{activeTab} Intelligence Locked</h3>
                 <p className="text-sm font-medium text-neutral-400 max-w-md mb-6">You need an upgraded clearance level to access live setups in this market sector.</p>
                 <button onClick={() => router.push('/settings/billing')} className="px-6 py-3 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary/90 transition-colors shadow-brand-glow">
                   Upgrade Access
                 </button>
               </>
            ) : (
              <>
                <BarChart2 size={40} className="text-neutral-700 mb-4" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">No Active Deployments</h3>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">There are currently no setups in the {activeTab} sector.</p>
              </>
            )}
          </div>
        ) : (
          /* MARKETS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMarkets.map(market => (
              <MarketCard key={market.symbol} market={market} />
            ))}
          </div>
        )}

      </div>

    </div>
  )
}
