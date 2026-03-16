'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Lock, Activity, Zap, Globe, TrendingUp, TrendingDown, Minus, BellRing, Bookmark, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function OperatorTerminal() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [userPlan, setUserPlan] = useState('free') 
  const [setups, setSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Watchlist State
  const [watchlist, setWatchlist] = useState<any[]>([])

  const FILTERS = [
    { name: 'All', req: 'free' },
    { name: 'Forex', req: 'free' },
    { name: 'Gold', req: 'essential' },
    { name: 'Crypto', req: 'pro' },
    { name: 'Indices', req: 'pro' },
    { name: 'Stocks', req: 'pro' }
  ]

  useEffect(() => {
    setMounted(true)

    // RUTHLESS LOCAL STORAGE WIPE
    // This destroys any old ghost data from previous builds
    const saved = localStorage.getItem('analysis_watchlist')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Strictly only keep items that are objects AND have a valid UUID
        const validItems = parsed.filter((item: any) => typeof item === 'object' && item.id && item.id.length > 20)
        
        setWatchlist(validItems)
        
        // If it found ghost data, overwrite local storage with the cleaned list
        if (parsed.length !== validItems.length) {
          localStorage.setItem('analysis_watchlist', JSON.stringify(validItems))
        }
      } catch (e) {
        localStorage.removeItem('analysis_watchlist')
      }
    }

    async function fetchLiveTerminalData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single()
            
          if (profile?.plan) setUserPlan(profile.plan.toLowerCase())

          const { data: analyses, error } = await supabase
            .from('analyses')
            .select('*')
            .order('created_at', { ascending: false })

          if (!error && analyses) setSetups(analyses)
        }
      } catch (err) {
        console.error("Dashboard Sync Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveTerminalData()
  }, [])

  // Precision Bookmark Toggle
  const toggleBookmark = (e: React.MouseEvent, setup: any) => {
    e.stopPropagation() 
    let updated = [...watchlist]
    const exists = updated.find(item => item.id === setup.id)
    
    if (exists) {
      // Remove it
      updated = updated.filter(item => item.id !== setup.id)
    } else {
      // Add it precisely
      updated.unshift({ id: setup.id, symbol: setup.asset_symbol, timeframe: setup.timeframe }) 
    }
    
    setWatchlist(updated)
    localStorage.setItem('analysis_watchlist', JSON.stringify(updated))
  }

  const isLocked = (reqTier: string) => {
    if (userPlan === 'pro') return false
    if (userPlan === 'essential' && reqTier === 'pro') return true
    if (userPlan === 'free' && reqTier !== 'free') return true
    return false
  }

  const filteredSetups = setups.filter(setup => {
    if (activeFilter === 'All') return true
    const marketMatch = (setup.category || 'Forex').toLowerCase()
    return marketMatch === activeFilter.toLowerCase()
  })

  const getActiveSession = () => {
    const hour = new Date().getUTCHours()
    if (hour >= 13 && hour < 17) return 'NY / London'
    if (hour >= 13 && hour < 22) return 'New York'
    if (hour >= 8 && hour < 17) return 'London'
    if (hour >= 23 || hour < 8) return 'Asian'
    return 'Inter-Bank'
  }

  let deployCount = 0
  let deployLabel = 'Recent Deployments'

  if (setups.length > 0) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)

    const todayCount = setups.filter(s => new Date(s.created_at) >= today).length
    
    if (todayCount > 0) {
      deployCount = todayCount; deployLabel = "Deployed Today"
    } else {
      const yesterdayCount = setups.filter(s => new Date(s.created_at) >= yesterday && new Date(s.created_at) < today).length
      if (yesterdayCount > 0) {
        deployCount = yesterdayCount; deployLabel = "Deployed Yesterday"
      }
    }
  }

  if (!mounted || loading) {
    return (
      <div className="w-full min-h-[80vh] bg-transparent flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-blue-500" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-xs">Syncing Terminal...</span>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen text-white p-6 md:p-8 font-sans">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT COLUMN: Metrics & Feed ================= */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
          
          {/* TOP METRICS ROW (RE-PROPORTIONED) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Intelligence Card */}
            <div className="md:col-span-4 xl:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between group hover:border-neutral-700 transition-colors overflow-hidden">
              <div className="min-w-0 pr-2">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 truncate">{deployLabel}</div>
                <div className="text-3xl font-black text-white tracking-tighter truncate">{deployCount}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-neutral-400 group-hover:text-white transition-colors shrink-0">
                <Zap size={20} />
              </div>
            </div>

            {/* Market Session Card */}
            <div className="md:col-span-4 xl:col-span-6 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between group hover:border-neutral-700 transition-colors overflow-hidden">
              <div className="min-w-0 pr-2">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 truncate">Market Session</div>
                <div className="text-2xl font-black text-white tracking-tight uppercase italic truncate">{getActiveSession()}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-neutral-400 group-hover:text-white transition-colors animate-pulse shrink-0">
                <Globe size={20} />
              </div>
            </div>
            
            {/* Active Plan Card (Given more room so ESSENTIAL fits perfectly) */}
            <div className="md:col-span-4 xl:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden">
              <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 truncate">Active Plan</div>
              <div className={`text-xl font-black uppercase tracking-widest truncate ${userPlan === 'pro' ? 'text-brand-primary' : userPlan === 'essential' ? 'text-blue-500' : 'text-neutral-400'}`}>
                {userPlan}
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="border-b border-neutral-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
              {FILTERS.map(f => {
                const locked = isLocked(f.req)
                return (
                  <button 
                    key={f.name}
                    onClick={() => !locked && setActiveFilter(f.name)}
                    className={`flex items-center px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap
                      ${activeFilter === f.name 
                        ? 'bg-white text-black' 
                        : locked 
                          ? 'bg-transparent text-neutral-600 cursor-not-allowed hover:bg-neutral-900 border border-transparent' 
                          : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'}`}
                  >
                    {locked && <Lock size={12} className="mr-2 text-yellow-500" />}
                    {f.name}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center bg-[#0a0a0a] border border-neutral-800 rounded-full px-4 py-2 w-full md:w-64 focus-within:border-neutral-600 transition-colors shrink-0">
              <Search size={14} className="text-neutral-500 mr-2" />
              <input type="text" placeholder="Search symbols..." className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-neutral-500" />
            </div>
          </div>

          {/* Feed Grid */}
          <div>
            <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">Intelligence Feed</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              
              {filteredSetups.map(setup => {
                const isBull = setup.bias?.toUpperCase() === 'BULLISH'
                const isBear = setup.bias?.toUpperCase() === 'BEARISH'
                const isBookmarked = watchlist.some(item => item.id === setup.id)

                return (
                  <div 
                    key={setup.id} 
                    onClick={() => router.push(`/analysis/viewport?asset=${setup.asset_symbol}`)}
                    className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-600 hover:bg-white/[0.02] transition-all rounded-xl p-2.5 cursor-pointer group flex items-center justify-between shadow-sm overflow-hidden"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-sm font-black text-white tracking-tight truncate">{setup.asset_symbol || 'UNKNOWN'}</span>
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5 truncate">{setup.timeframe || '-'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button 
                        onClick={(e) => toggleBookmark(e, setup)}
                        className="text-neutral-600 hover:text-white transition-colors p-1"
                      >
                        <Bookmark size={14} className={isBookmarked ? 'fill-amber-500 text-amber-500' : ''} />
                      </button>

                      <div className={`p-1.5 rounded-lg shrink-0 ${isBull ? 'bg-emerald-500/10 text-emerald-500' : isBear ? 'bg-red-500/10 text-red-500' : 'bg-neutral-800 text-neutral-400'}`}>
                        {isBull ? <TrendingUp size={14} /> : isBear ? <TrendingDown size={14} /> : <Minus size={14} />}
                      </div>
                    </div>
                  </div>
                )
              })}

              {filteredSetups.length === 0 && (
                <div className="col-span-full py-12 text-center text-neutral-500 italic border border-dashed border-neutral-800 rounded-xl text-sm">
                  No active intelligence deployments found.
                </div>
              )}

            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: Broadcast & Watchlist ================= */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6 sticky top-6">
          
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center">
                <Activity size={16} className="text-blue-500 mr-2 animate-pulse" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Pulse</h3>
              </div>
              <BellRing size={14} className="text-neutral-500" />
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/20 blur-xl rounded-full"></div>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1.5 relative z-10">System Broadcast</span>
                <p className="text-xs text-blue-100 leading-relaxed font-medium relative z-10">
                  Terminal synced. Monitor setups closely during upcoming high-impact overlap sessions.
                </p>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Network</span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div> Operational</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center">
                <Bookmark size={16} className="text-amber-500 mr-2" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">The Vault</h3>
              </div>
              <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Pinned Targets</span>
            </div>

            <div className="space-y-2">
              {watchlist.length > 0 ? (
                watchlist.slice(0, 6).map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => router.push(`/analysis/viewport?asset=${item.symbol}`)}
                    className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-white tracking-widest truncate max-w-[100px]">{item.symbol}</span>
                      {item.timeframe && <span className="text-[9px] font-bold text-neutral-500 ml-2 uppercase truncate">{item.timeframe}</span>}
                    </div>
                    <ChevronRight size={14} className="text-neutral-600 group-hover:text-white transition-colors shrink-0" />
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-neutral-600 text-xs italic font-medium">
                  No setups pinned to vault.
                </div>
              )}
            </div>
            
            {watchlist.length > 6 && (
              <button 
                onClick={() => router.push('/dashboard/vault')}
                className="w-full mt-3 py-2 text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                View All {watchlist.length} Targets
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
