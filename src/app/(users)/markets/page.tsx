'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Activity, Lock, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  { id: 'ALL', label: 'All', req: 'free' },
  { id: 'FOREX', label: 'Forex', req: 'free' },
  { id: 'GOLD', label: 'Gold', req: 'essential' },
  { id: 'CRYPTO', label: 'Crypto', req: 'pro' },
  { id: 'INDICES', label: 'Indices', req: 'pro' },
  { id: 'STOCKS', label: 'Stocks', req: 'pro' }
]

function MarketsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // LIVE SEARCH STATE
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search')?.toLowerCase() || '')
  
  const [groupedAnalyses, setGroupedAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ALL')
  const [userPlan, setUserPlan] = useState('free')
  
  const [prevIndex, setPrevIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right')

  // INSTANT SEARCH LISTENER
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
    if (userPlan === 'pro') return false
    if (userPlan === 'essential' && reqTier === 'pro') return true
    if (userPlan === 'free' && reqTier !== 'free') return true
    return false
  }

  const filteredMarkets = groupedAnalyses.filter(market => {
    const matchesTab = activeTab === 'ALL' ? true : market.category === activeTab
    // Safe Includes Check
    const matchesSearch = (market.symbol || '').toLowerCase().includes(searchQuery)
    return matchesTab && matchesSearch
  })

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <Activity className="animate-pulse text-blue-500" size={32} />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Loading Markets...</span>
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
                 <Lock size={32} className="text-brand-primary mb-4" />
                 <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Access Restricted</h3>
                 <button onClick={() => router.push('/account/subscription')} className="mt-4 px-6 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Upgrade</button>
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
                onClick={() => router.push(`/markets/viewport?asset=${market.symbol}`)}
                className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 hover:border-neutral-600 transition-all cursor-pointer group flex flex-col min-h-[140px]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-black border border-neutral-800 flex items-center justify-center overflow-hidden relative shrink-0">
                      <img src={market.latestImage} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity duration-500" alt="" />
                      <div className={`absolute bottom-0 right-0 p-1 backdrop-blur-md ${market.latestBias === 'BULLISH' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {market.latestBias === 'BULLISH' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{market.symbol}</h3>
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{market.category}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-neutral-800/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-white bg-white/5 px-2 py-1 rounded">{market.count} Setup{market.count > 1 ? 's' : ''}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); router.push(`/markets/archive?asset=${market.symbol}`); }}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
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
