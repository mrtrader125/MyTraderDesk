'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Star, Clock, ChevronRight, Activity, BarChart2, Crown, Shield } from 'lucide-react'

const CORE_ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF', 'XAUUSD', 'GBPCAD', 'CADJPY', 'EURJPY', 'EURAUD', 'GBPAUD']

export default function AnalysisPage() {
  const router = useRouter()
  const [groupedAnalyses, setGroupedAnalyses] = useState<any[]>([])
  const [pinnedSymbols, setPinnedSymbols] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('analysis_watchlist')
    if (saved) setPinnedSymbols(JSON.parse(saved))

    async function fetchAnalyses() {
      const { data } = await supabase.from('analyses').select('*').order('created_at', { ascending: false })

      if (data) {
        const grouped = data.reduce((acc: any, curr: any) => {
          if (!acc[curr.asset_symbol]) {
            acc[curr.asset_symbol] = {
              symbol: curr.asset_symbol,
              latestImage: curr.image_url,
              lastUpdated: curr.created_at,
              count: 0,
              timeframes: [],
              isCore: CORE_ASSETS.includes(curr.asset_symbol)
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
      setLoading(false)
    }
    fetchAnalyses()
  }, [])

  const handleTogglePin = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation() 
    let updated = [...pinnedSymbols]
    if (updated.includes(symbol)) {
      updated = updated.filter(s => s !== symbol)
    } else {
      updated.push(symbol)
    }
    setPinnedSymbols(updated)
    localStorage.setItem('analysis_watchlist', JSON.stringify(updated))
  }

  if (loading) return <div className="h-screen flex items-center justify-center text-neutral-500 text-[11px] font-medium tracking-widest uppercase">Loading Intelligence...</div>

  const pinnedMarkets = groupedAnalyses.filter(a => pinnedSymbols.includes(a.symbol))
  const otherMarkets = groupedAnalyses.filter(a => !pinnedSymbols.includes(a.symbol))

  const MarketCard = ({ market, isPinned }: { market: any, isPinned: boolean }) => (
    <div 
      onClick={() => router.push(`/analysis/viewport?asset=${market.symbol}`)}
      className="bg-card-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-xl p-5 hover:bg-white/[0.02] hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[160px]"
    >
      <div className="flex justify-between items-start z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-app-bg transition-colors duration-700 border border-card-border transition-colors duration-700 flex items-center justify-center shrink-0 overflow-hidden relative">
            <img src={market.latestImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt={market.symbol} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white tracking-tight">{market.symbol}</h3>
              {!market.isCore ? (
                <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 text-[8px] font-bold uppercase tracking-wider rounded border border-purple-500/20 flex items-center">
                  <Crown size={8} className="mr-1" /> PRO
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase tracking-wider rounded border border-blue-500/20 flex items-center">
                  <Shield size={8} className="mr-1" /> ESSENTIAL
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-neutral-500 mt-0.5">
              <Clock size={10} />
              <span className="text-[10px] font-medium">{new Date(market.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={(e) => handleTogglePin(e, market.symbol)}
          className={`p-2 rounded-lg transition-colors z-20 relative ${isPinned ? 'text-amber-500 bg-amber-500/10' : 'text-neutral-600 hover:text-white hover:bg-white/5'}`}
        >
          <Star size={16} className={isPinned ? 'fill-amber-500' : ''} />
        </button>
      </div>

      <div className="mt-6 flex items-end justify-between z-10">
        <div className="flex flex-col space-y-1.5">
          <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Active Setups</span>
          <div className="flex items-center space-x-2">
            <span className="text-[13px] font-semibold text-white bg-white/[0.03] px-2 py-1 rounded border border-card-border transition-colors duration-700">
              {market.count} Report{market.count > 1 ? 's' : ''}
            </span>
            <div className="flex space-x-1">
              {market.timeframes.slice(0, 3).map((tf: string) => (
                <span key={tf} className="text-[9px] font-bold text-neutral-400 bg-black px-1.5 py-0.5 rounded uppercase">{tf}</span>
              ))}
              {market.timeframes.length > 3 && <span className="text-[9px] font-bold text-neutral-600 bg-black px-1.5 py-0.5 rounded">+{market.timeframes.length - 3}</span>}
            </div>
          </div>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); router.push(`/analysis/archive?asset=${market.symbol}`); }}
          className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-500 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors z-20 relative"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="w-full h-full p-6 lg:px-8 lg:py-6 space-y-10">
      <div className="flex flex-col mb-4">
        <h1 className="text-[22px] font-medium text-neutral-100 tracking-wide">Market Intelligence</h1>
        <p className="text-[13px] text-neutral-500 mt-1">Browse available asset analyses and operational setups.</p>
      </div>

      {pinnedMarkets.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-neutral-300">
            <Star size={16} className="text-amber-500 fill-amber-500/20" />
            <h2 className="text-[15px] font-medium">Pinned Watchlist</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {pinnedMarkets.map(market => <MarketCard key={market.symbol} market={market} isPinned={true} />)}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-neutral-300 pb-2 border-b border-card-border transition-colors duration-700">
          <BarChart2 size={16} className="text-blue-500" />
          <h2 className="text-[15px] font-medium">Global Markets</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {otherMarkets.map(market => <MarketCard key={market.symbol} market={market} isPinned={false} />)}
        </div>
      </section>
    </div>
  )
}

