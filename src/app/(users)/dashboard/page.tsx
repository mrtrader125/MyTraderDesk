'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Activity, Zap, Globe, TrendingUp, TrendingDown, Minus, BellRing, Bookmark, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function OperatorTerminal() {
  const router = useRouter()
  const searchParams = useSearchParams() 
  
  // LIVE SEARCH STATE
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search')?.toLowerCase() || '')
  
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [userPlan, setUserPlan] = useState('free') 
  const [setups, setSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<any[]>([])

  const FILTERS = [
    { name: 'All', req: 'free' },
    { name: 'Forex', req: 'free' },
    { name: 'Gold', req: 'essential' },
    { name: 'Crypto', req: 'pro' },
    { name: 'Indices', req: 'pro' },
    { name: 'Stocks', req: 'pro' }
  ]

  // INSTANT SEARCH LISTENER
  useEffect(() => {
    const handleSearch = (e: any) => setSearchQuery(e.detail?.toLowerCase() || '')
    window.addEventListener('globalSearch', handleSearch)
    return () => window.removeEventListener('globalSearch', handleSearch)
  }, [])

  useEffect(() => {
    setMounted(true)

    async function fetchLiveTerminalData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
          if (profile?.plan) setUserPlan(profile.plan.toLowerCase())

          const { data: vaultData } = await supabase
            .from('user_vault')
            .select('analysis_id, analyses(asset_symbol, timeframe)')
            .eq('user_id', user.id)

          if (vaultData) {
            setWatchlist(vaultData.map((v: any) => ({
              id: v.analysis_id,
              symbol: v.analyses?.asset_symbol,
              timeframe: v.analyses?.timeframe
            })))
          }

          const { data: analyses, error } = await supabase.from('analyses').select('*').order('created_at', { ascending: false })
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

  const filteredSetups = useMemo(() => {
    return setups.filter(setup => {
      const matchesTab = activeFilter === 'All' ? true : (setup.category || 'Forex').toLowerCase() === activeFilter.toLowerCase()
      // Safe Includes Check
      const matchesSearch = (setup.asset_symbol || '').toLowerCase().includes(searchQuery)
      return matchesTab && matchesSearch
    })
  }, [setups, activeFilter, searchQuery])

  const toggleBookmark = async (e: React.MouseEvent, setup: any) => {
    e.stopPropagation() 
    if (!setup) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const exists = watchlist.find(item => item.id === setup.id)
    let updated = [...watchlist]

    if (exists) {
      updated = updated.filter(item => item.id !== setup.id)
      setWatchlist(updated)
      await supabase.from('user_vault').delete().match({ user_id: user.id, analysis_id: setup.id })
    } else {
      updated.unshift({ id: setup.id, symbol: setup.asset_symbol, timeframe: setup.timeframe }) 
      setWatchlist(updated)
      await supabase.from('user_vault').insert([{ user_id: user.id, analysis_id: setup.id }])
    }
  }

  const isLocked = (reqTier: string) => {
    if (userPlan === 'pro') return false
    if (userPlan === 'essential' && reqTier === 'pro') return true
    if (userPlan === 'free' && reqTier !== 'free') return true
    return false
  }

  const getActiveSession = () => {
    const hour = new Date().getUTCHours()
    if (hour >= 13 && hour < 17) return 'NY / London'
    if (hour >= 13 && hour < 22) return 'New York'
    if (hour >= 8 && hour < 17) return 'London'
    if (hour >= 23 || hour < 8) return 'Asian'
    return 'Inter-Bank'
  }

  const { deployCount, deployLabel } = useMemo(() => {
    if (setups.length === 0) return { deployCount: 0, deployLabel: 'Deployments' }
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    
    const todayCount = setups.filter(s => new Date(s.created_at) >= today).length
    if (todayCount > 0) return { deployCount: todayCount, deployLabel: "Deployed Today" }
    
    const yesterdayCount = setups.filter(s => new Date(s.created_at) >= yesterday && new Date(s.created_at) < today).length
    return { deployCount: yesterdayCount || setups.length, deployLabel: yesterdayCount > 0 ? "Deployed Yesterday" : "Total Active" }
  }, [setups])

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
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 xl:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between group hover:border-neutral-700 transition-colors overflow-hidden">
              <div className="min-w-0 pr-2">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 truncate">{deployLabel}</div>
                <div className="text-3xl font-black text-white tracking-tighter truncate">{deployCount}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-neutral-400 group-hover:text-white transition-colors shrink-0">
                <Zap size={20} />
              </div>
            </div>

            <div className="md:col-span-4 xl:col-span-6 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between group hover:border-neutral-700 transition-colors overflow-hidden">
              <div className="min-w-0 pr-2">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 truncate">Market Session</div>
                <div className="text-2xl font-black text-white tracking-tight uppercase italic truncate">{getActiveSession()}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-neutral-400 group-hover:text-white transition-colors animate-pulse shrink-0">
                <Globe size={20} />
              </div>
            </div>
            
            <div className="md:col-span-4 xl:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden">
              <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 truncate">Active Plan</div>
              <div className={`text-xl font-black uppercase tracking-widest truncate ${userPlan === 'pro' ? 'text-brand-primary' : userPlan === 'essential' ? 'text-blue-500' : 'text-neutral-400'}`}>
                {userPlan}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide w-full bg-[#0a0a0a] p-1 rounded-xl border border-neutral-800 mt-2">
            {FILTERS.map(f => {
              const locked = isLocked(f.req)
              return (
                <button 
                  key={f.name}
                  onClick={async () => {
                    if (!locked) {
                      setActiveFilter(f.name)
                      const { data: { user } } = await supabase.auth.getUser()
                      if (user) {
                        supabase.from('activity_logs').insert([{
                          user_id: user.id,
                          action: 'FILTER_CLICK',
                          search_query: f.name 
                        }]).then()
                      }
                    }
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${activeFilter === f.name ? 'bg-white text-black shadow-sm' : locked ? 'text-neutral-600 cursor-not-allowed opacity-50' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                >
                  {locked && <Lock size={10} className="mr-1.5" />}
                  {f.name}
                </button>
              )
            })}
          </div>

          <div>
            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-3 mt-4">Intelligence Feed</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredSetups.map(setup => {
                const isBull = setup.bias?.toUpperCase() === 'BULLISH'
                const isBear = setup.bias?.toUpperCase() === 'BEARISH'
                const isBookmarked = watchlist.some(item => item.id === setup.id)

                return (
                  <div 
                    key={setup.id} 
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser()
                      if (user) {
                        supabase.from('activity_logs').insert([{
                          user_id: user.id,
                          action: 'FEED_CLICK',
                          asset_symbol: setup.asset_symbol,
                          timeframe: setup.timeframe
                        }]).then()
                      }
                      router.push(`/markets/viewport?asset=${setup.asset_symbol}&tf=${setup.timeframe}`)
                    }}
                    className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-600 hover:bg-white/[0.02] transition-all rounded-xl p-2.5 cursor-pointer group flex items-center justify-between shadow-sm overflow-hidden"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-sm font-black text-white tracking-tight truncate">{setup.asset_symbol || 'UNKNOWN'}</span>
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5 truncate">{setup.timeframe || '-'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button onClick={(e) => toggleBookmark(e, setup)} className="text-neutral-600 hover:text-white transition-colors p-1">
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
                  {searchQuery ? `No setups found matching "${searchQuery}"` : "No active intelligence deployments found."}
                </div>
              )}
            </div>
          </div>
        </div>

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
                    onClick={() => router.push(`/markets/viewport?asset=${item.symbol}&tf=${item.timeframe}`)}
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
              <button onClick={() => router.push('/vault')} className="w-full mt-3 py-2 text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors">
                View All {watchlist.length} Targets
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-[80vh] bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-blue-500" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-xs">Loading Terminal...</span>
      </div>
    }>
      <OperatorTerminal />
    </Suspense>
  )
}
