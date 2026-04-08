'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Activity, ArrowRight, Target } from 'lucide-react'
import { ASSET_CATEGORIES } from '@/lib/platformConfig'

const CATEGORIES = [
  { id: 'ALL', label: 'All' },
  ...Object.keys(ASSET_CATEGORIES).map(category => ({
    id: category,
    label: category.charAt(0) + category.slice(1).toLowerCase(),
  }))
]

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

export default function MarketsClient({ initialGroupedAnalyses }: any) {
  const router = useRouter()
  const searchParams = useSearchParams() 
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search')?.toLowerCase() || '')
  
  const [groupedAnalyses] = useState<any[]>(initialGroupedAnalyses || [])
  
  const [activeTab, setActiveTab] = useState('ALL')
  const [prevIndex, setPrevIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleSearch = (e: any) => setSearchQuery(e.detail?.toLowerCase() || '')
    window.addEventListener('globalSearch', handleSearch)
    return () => window.removeEventListener('globalSearch', handleSearch)
  }, [])

  const handleTabChange = (id: string, index: number) => {
    setSlideDirection(index > prevIndex ? 'right' : 'left')
    setPrevIndex(index)
    setActiveTab(id)
  }

  const filteredMarkets = groupedAnalyses.filter(market => {
    const matchesTab = activeTab === 'ALL' ? true : market.category === activeTab
    const matchesSearch = (market.symbol || '').toLowerCase().includes(searchQuery)
    return matchesTab && matchesSearch
  })

  if (!mounted) return <div className="w-full bg-[#050505] min-h-screen"></div>

  return (
    <div className="w-full bg-[#050505] p-4 md:p-6 lg:p-8 font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="max-w-[90rem] mx-auto w-full h-full flex flex-col min-h-0">
        
        {/* COMPLETELY UNRESTRICTED CATEGORY TABS */}
        <div className="shrink-0 w-full mb-6 md:mb-8">
          <div className="flex items-center space-x-1.5 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/[0.05] overflow-x-auto w-full scrollbar-hide shadow-sm">
            {CATEGORIES.map((cat, idx) => {
              const active = activeTab === cat.id
              return (
                <button 
                  key={cat.id}
                  onClick={() => handleTabChange(cat.id, idx)}
                  className={`relative flex items-center px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0
                    ${active ? 'bg-white text-black shadow-md scale-[1.02]' : 'text-neutral-500 hover:text-white hover:bg-white/[0.04]'}`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* MARKET CARDS GRID (NO PAYWALL OVERLAYS) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-6 pr-1">
          <div 
            key={`${activeTab}-${searchQuery}`}
            className={`animate-in duration-500 fill-mode-both 
              ${slideDirection === 'right' ? 'slide-in-from-right-12' : 'slide-in-from-left-12'} 
              fade-in h-full`}
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
                {filteredMarkets.map(market => (
                  <div 
                    key={market.symbol}
                    onClick={() => router.push(`/markets/viewport?asset=${market.symbol}&from=markets`)}
                    className={`bg-[#0a0a0a] border rounded-2xl p-5 transition-all duration-300 cursor-pointer group flex flex-col min-h-[140px] relative overflow-hidden
                      ${market.isPrime ? 'border-blue-500/30 bg-blue-500/[0.02] hover:border-blue-500/60 shadow-[0_0_20px_rgba(37,99,235,0.08)]' : 
                        'border-white/[0.04] hover:border-white/10 hover:bg-[#0c0c0c] shadow-sm'}
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

                      {market.isPrime && (
                        <div className="flex items-center px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-sm" title="Prime Setup Active">
                          <Target size={10} className="mr-1.5" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Prime</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        {market.activeCount > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-black text-blue-400" title={`${market.activeCount} Active Setups`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                            {market.activeCount}
                          </div>
                        )}
                        
                        {market.waitingCount > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-black text-amber-400" title={`${market.waitingCount} Waiting Setups`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                            {market.waitingCount}
                          </div>
                        )}

                        {market.activeCount === 0 && market.waitingCount === 0 && (
                          <span className="text-[9px] font-bold text-neutral-500 bg-[#111] px-3 py-1 rounded border border-white/[0.05] uppercase tracking-widest shadow-inner">
                            {market.count} Total
                          </span>
                        )}
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/markets/archive?asset=${market.symbol}&from=markets`); }}
                        className={`w-8 h-8 rounded-lg bg-[#111] border flex items-center justify-center transition-all shrink-0 shadow-sm
                          ${market.isPrime 
                            ? 'border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500' 
                            : 'border-white/[0.05] text-neutral-500 hover:text-white hover:bg-[#222] hover:border-white/10 group-hover:bg-[#151515] group-hover:border-white/10 group-hover:text-white'}
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
