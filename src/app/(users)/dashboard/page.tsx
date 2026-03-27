'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Activity, Zap, Globe, TrendingUp, TrendingDown, Minus, BellRing, Bookmark, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams() 
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search')?.toLowerCase() || '')
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [userPlan, setUserPlan] = useState('free') 
  const [setups, setSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<any[]>([])
  
  // Broadcast State
  const [activeBroadcast, setActiveBroadcast] = useState<any>(null)

  // 🚨 NEW: Custom Static Filters based on your request
  const FILTERS = useMemo(() => {
    return [
      { name: 'All', req: 'free' },
      { name: 'Forex (All)', req: 'essential' },
      { name: 'Majors', req: 'free' },
      { name: 'Minors', req: 'essential' },
      { name: 'Commodities', req: 'pro' },
      { name: 'Indices', req: 'pro' },
      { name: 'Stocks', req: 'premium' }
    ]
  }, [])

  useEffect(() => {
    const handleSearch = (e: any) => setSearchQuery(e.detail?.toLowerCase() || '')
    window.addEventListener('globalSearch', handleSearch)
    return () => window.removeEventListener('globalSearch', handleSearch)
  }, [])

  useEffect(() => {
    setMounted(true)
    async function fetchDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
          if (profile?.plan) setUserPlan(profile.plan.toLowerCase())

          const { data: broadcasts } = await supabase
            .from('notifications')
            .select('*')
            .eq('type', 'BROADCAST')
            .eq('status', 'ACTIVE')
            .in('target_tier', ['ALL', profile?.plan ? profile.plan.toUpperCase() : 'FREE'])
            .order('created_at', { ascending: false })
            .limit(1)

          if (broadcasts && broadcasts.length > 0) setActiveBroadcast(broadcasts[0])

          const { data: vaultData } = await supabase.from('user_vault').select('analysis_id, analyses(asset_symbol, timeframe)').eq('user_id', user.id)
          if (vaultData) {
            setWatchlist(vaultData.map((v: any) => ({
              id: v.analysis_id, symbol: v.analyses?.asset_symbol, timeframe: v.analyses?.timeframe
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
    fetchDashboardData()
  }, [])

  const filteredSetups = useMemo(() => {
    return setups.filter(setup => {
      // Logic checks if the active filter name is inside the database category string
      const cat = (setup.category || '').toLowerCase()
      const filterName = activeFilter.toLowerCase().replace(' (all)', '')
      
      const matchesTab = activeFilter === 'All' ? true : cat.includes(filterName)
      const matchesSearch = (setup.asset_symbol || '').toLowerCase().includes(searchQuery)
      return matchesTab && matchesSearch
    })
  }, [setups, activeFilter, searchQuery])

  // 🚨 NEW: Time-based grouping logic
  const { todaySetups, yesterdaySetups, olderSetups } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayArr: any[] = []
    const yesterdayArr: any[] = []
    const olderArr: any[] = []

    filteredSetups.forEach(setup => {
      const setupDate = new Date(setup.created_at)
      if (setupDate >= today) todayArr.push(setup)
      else if (setupDate >= yesterday && setupDate < today) yesterdayArr.push(setup)
      else olderArr.push(setup)
    })

    return { todaySetups: todayArr, yesterdaySetups: yesterdayArr, olderSetups: olderArr }
  }, [filteredSetups])

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
    if (userPlan === 'premium') return false
    if (userPlan === 'pro' && reqTier !== 'premium') return false
    if (userPlan === 'essential' && (reqTier === 'essential' || reqTier === 'free')) return false
    if (userPlan === 'free' && reqTier === 'free') return false
    return true
  }

  const getActiveSession = () => {
    const hour = new Date().getUTCHours()
    if (hour >= 13 && hour < 17) return 'NY / London'
    if (hour >= 13 && hour < 22) return 'New York'
    if (hour >= 8 && hour < 17) return 'London'
    if (hour >= 23 || hour < 8) return 'Asian'
    return 'Inter-Bank'
  }

  const { setupCount, setupLabel } = useMemo(() => {
    if (setups.length === 0) return { setupCount: 0, setupLabel: 'Total Setups' }
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    
    const tCount = setups.filter(s => new Date(s.created_at) >= today).length
    if (tCount > 0) return { setupCount: tCount, setupLabel: "Published Today" }
    
    const yCount = setups.filter(s => new Date(s.created_at) >= yesterday && new Date(s.created_at) < today).length
    return { setupCount: yCount || setups.length, setupLabel: yCount > 0 ? "Published Yesterday" : "Active Setups" }
  }, [setups])

  // Reusable component for rendering a single setup card
  const SetupCard = ({ setup }: { setup: any }) => {
    const isBull = setup.bias?.toUpperCase() === 'BULLISH'
    const isBear = setup.bias?.toUpperCase() === 'BEARISH'
    const isBookmarked = watchlist.some(item => item.id === setup.id)

    return (
      <div 
        onClick={async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) supabase.from('activity_logs').insert([{ user_id: user.id, action: 'FEED_CLICK', asset_symbol: setup.asset_symbol, timeframe: setup.timeframe }]).then()
          router.push(`/markets/viewport?asset=${setup.asset_symbol}&tf=${setup.timeframe}&from=dashboard`)
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
  }

  if (!mounted || loading) {
    return (
      <div className="w-full h-screen p-6 md:p-8 font-sans space-y-8 bg-[#050505] overflow-hidden">
        <div className="w-full h-32 bg-[#0a0a0a] border border-neutral-800 rounded-[2rem] animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-[#0a0a0a] border border-neutral-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="w-full h-64 bg-[#0a0a0a] border border-neutral-800 rounded-3xl animate-pulse"></div>
      </div>
    )
  }

  return (
    // 🚨 APP LOCK: Restricts height and stops global scrolling
    <div className="w-full bg-[#050505] text-white p-4 md:p-6 font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100vh - 65px)' }}>
      <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col min-h-0">
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
          
          {/* LEFT COLUMN: Main Dash Area */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full min-h-0">
            
            {/* STATIC HEADER SECTION (Never scrolls) */}
            <div className="shrink-0 space-y-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 xl:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between group hover:border-neutral-700 transition-colors overflow-hidden">
                  <div className="min-w-0 pr-2">
                    <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 truncate">{setupLabel}</div>
                    <div className="text-3xl font-black text-white tracking-tighter truncate">{setupCount}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl text-neutral-400 group-hover:text-white transition-colors shrink-0"><Zap size={20} /></div>
                </div>

                <div className="md:col-span-4 xl:col-span-6 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between group hover:border-neutral-700 transition-colors overflow-hidden">
                  <div className="min-w-0 pr-2">
                    <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 truncate">Trading Session</div>
                    {/* 🚨 FIXED CROPPING: Removed truncate, added leading-tight for wrap support */}
                    <div className="text-xl md:text-2xl font-black text-white tracking-tight uppercase italic leading-tight">
                      {getActiveSession()}
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl text-neutral-400 group-hover:text-white transition-colors animate-pulse shrink-0"><Globe size={20} /></div>
                </div>
                
                <div className="md:col-span-4 xl:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden">
                  <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 truncate">Current Tier</div>
                  <div className={`text-xl font-black uppercase tracking-widest truncate ${userPlan === 'premium' ? 'text-amber-500' : userPlan === 'pro' ? 'text-blue-400' : userPlan === 'essential' ? 'text-blue-500' : 'text-neutral-400'}`}>
                    {userPlan === 'premium' ? 'Gold Premium' : userPlan}
                  </div>
                </div>
              </div>

              {/* FILTER TABS */}
              <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar w-full bg-[#0a0a0a] p-1.5 rounded-xl border border-neutral-800">
                {FILTERS.map(f => {
                  const locked = isLocked(f.req)
                  return (
                    <button 
                      key={f.name}
                      onClick={async () => {
                        if (!locked) {
                          setActiveFilter(f.name)
                          const { data: { user } } = await supabase.auth.getUser()
                          if (user) supabase.from('activity_logs').insert([{ user_id: user.id, action: 'FILTER_CLICK', search_query: f.name }]).then()
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
            </div>

            {/* 🚨 SCROLLABLE FEED AREA 🚨 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
              <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-4 sticky top-0 bg-[#050505] py-2 z-10">Market Analysis Feed</h3>
              
              {filteredSetups.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 italic border border-dashed border-neutral-800 rounded-xl text-sm">
                  {searchQuery ? `No setups found matching "${searchQuery}"` : "No active market setups found."}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* GROUP: TODAY */}
                  {todaySetups.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest bg-neutral-900 px-3 py-1 rounded">Today</h4>
                        <div className="flex-1 h-px bg-neutral-900"></div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                        {todaySetups.map(setup => <SetupCard key={setup.id} setup={setup} />)}
                      </div>
                    </div>
                  )}

                  {/* GROUP: YESTERDAY */}
                  {yesterdaySetups.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-900/50 px-3 py-1 rounded">Yesterday</h4>
                        <div className="flex-1 h-px bg-neutral-900/50"></div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 opacity-90">
                        {yesterdaySetups.map(setup => <SetupCard key={setup.id} setup={setup} />)}
                      </div>
                    </div>
                  )}

                  {/* GROUP: OLDER */}
                  {olderSetups.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest bg-neutral-900/30 px-3 py-1 rounded">Older</h4>
                        <div className="flex-1 h-px bg-neutral-900/30"></div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 opacity-75 grayscale-[0.2]">
                        {olderSetups.map(setup => <SetupCard key={setup.id} setup={setup} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar (Vault & Broadcasts) */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pb-6 pr-1">
            
            {/* BROADCASTS */}
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 shrink-0">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
                <div className="flex items-center">
                  <Activity size={16} className="text-blue-500 mr-2 animate-pulse" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">System Updates</h3>
                </div>
                <BellRing size={14} className="text-neutral-500" />
              </div>
              
              <div className="space-y-4">
                {activeBroadcast ? (
                  <div className={`p-4 rounded-xl relative overflow-hidden border ${activeBroadcast.urgency === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' : activeBroadcast.urgency === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                    <div className={`absolute top-0 right-0 w-16 h-16 blur-xl rounded-full ${activeBroadcast.urgency === 'CRITICAL' ? 'bg-red-500/20' : activeBroadcast.urgency === 'WARNING' ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}></div>
                    <span className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 relative z-10 ${activeBroadcast.urgency === 'CRITICAL' ? 'text-red-400' : activeBroadcast.urgency === 'WARNING' ? 'text-amber-400' : 'text-blue-400'}`}>
                      {activeBroadcast.title}
                    </span>
                    <p className={`text-xs leading-relaxed font-medium relative z-10 ${activeBroadcast.urgency === 'CRITICAL' ? 'text-red-100' : activeBroadcast.urgency === 'WARNING' ? 'text-amber-100' : 'text-blue-100'}`}>
                      {activeBroadcast.message}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-900/30 border border-neutral-800/50 rounded-xl text-center">
                    <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">No Active Broadcasts</span>
                  </div>
                )}
                
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                  <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">System Status</span>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div> Operational</span>
                </div>
              </div>
            </div>

            {/* THE VAULT */}
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800 shrink-0">
                <div className="flex items-center">
                  <Bookmark size={16} className="text-amber-500 mr-2" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">The Vault</h3>
                </div>
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Saved Setups</span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {watchlist.length > 0 ? (
                  watchlist.slice(0, 8).map((item) => (
                    <div key={item.id} onClick={() => router.push(`/markets/viewport?asset=${item.symbol}&tf=${item.timeframe}&from=dashboard`)} className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl cursor-pointer transition-colors group">
                      <div className="flex items-center">
                        <span className="text-xs font-bold text-white tracking-widest truncate max-w-[100px]">{item.symbol}</span>
                        {item.timeframe && <span className="text-[9px] font-bold text-neutral-500 ml-2 uppercase truncate">{item.timeframe}</span>}
                      </div>
                      <ChevronRight size={14} className="text-neutral-600 group-hover:text-white transition-colors shrink-0" />
                    </div>
                  ))
                ) : <div className="py-6 text-center text-neutral-600 text-xs italic font-medium">No saved setups.</div>}
              </div>
              
              {watchlist.length > 8 && <button onClick={() => router.push('/vault')} className="w-full mt-4 pt-3 border-t border-neutral-800 text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors shrink-0">View All {watchlist.length} Targets</button>}
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4"><Activity className="animate-pulse text-blue-500" size={40} /><span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-xs">Loading Dashboard...</span></div>}>
      <DashboardContent />
    </Suspense>
  )
}
