'use client'

import { useState, useEffect, useMemo, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Activity, Zap, Globe, TrendingUp, TrendingDown, Minus, BellRing, Bookmark, ChevronRight, ListFilter, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ASSET_CATEGORIES, PLAN_CONFIG } from '@/lib/platformConfig'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams() 
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search')?.toLowerCase() || '')
  const [mounted, setMounted] = useState(false)
  const [userPlan, setUserPlan] = useState('free') 
  const [setups, setSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<any[]>([])
  
  // Broadcast State
  const [activeBroadcast, setActiveBroadcast] = useState<any>(null)

  // FILTER STATE (Persistent)
  const [activeFilter, setActiveFilter] = useState('All')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  // DYNAMIC FILTERS
  const FILTERS = useMemo(() => {
    return [
      { name: 'All', req: 'free' },
      ...Object.keys(ASSET_CATEGORIES).map(category => {
        let requiredTier = 'premium';
        if (PLAN_CONFIG.free.allowedCategories.includes(category)) requiredTier = 'free';
        else if (PLAN_CONFIG.essential.allowedCategories.includes(category)) requiredTier = 'essential';
        else if (PLAN_CONFIG.pro.allowedCategories.includes(category)) requiredTier = 'pro';

        return {
          name: category.charAt(0) + category.slice(1).toLowerCase(),
          req: requiredTier
        }
      })
    ]
  }, [])

  // Load saved filter preference
  useEffect(() => {
    const savedFilter = localStorage.getItem('mtd_dashboard_filter')
    if (savedFilter) setActiveFilter(savedFilter)
  }, [])

  // Click outside to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

          // Fetch Active Broadcasts targeting this user's tier (or ALL)
          const { data: broadcasts } = await supabase
            .from('notifications')
            .select('*')
            .eq('type', 'BROADCAST')
            .eq('status', 'ACTIVE')
            .in('target_tier', ['ALL', profile?.plan ? profile.plan.toUpperCase() : 'FREE'])
            .order('created_at', { ascending: false })
            .limit(1)

          if (broadcasts && broadcasts.length > 0) {
            setActiveBroadcast(broadcasts[0])
          }

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

  // Lock logic
  const isLocked = (reqTier: string) => {
    if (userPlan === 'premium') return false
    if (userPlan === 'pro' && reqTier !== 'premium') return false
    if (userPlan === 'essential' && (reqTier === 'essential' || reqTier === 'free')) return false
    if (userPlan === 'free' && reqTier === 'free') return false
    return true
  }

  const handleFilterSelect = async (filterName: string, locked: boolean) => {
    if (locked) return
    setActiveFilter(filterName)
    localStorage.setItem('mtd_dashboard_filter', filterName)
    setIsFilterOpen(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) supabase.from('activity_logs').insert([{ user_id: user.id, action: 'FILTER_CLICK', search_query: filterName }]).then()
  }

  // --- FEED GROUPING LOGIC ---
  const groupedSetups = useMemo(() => {
    const filtered = setups.filter(setup => {
      const matchesTab = activeFilter === 'All' ? true : (setup.category || 'Forex').toLowerCase() === activeFilter.toLowerCase()
      const matchesSearch = (setup.asset_symbol || '').toLowerCase().includes(searchQuery)
      return matchesTab && matchesSearch
    })

    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    
    const yesterdayDate = new Date(todayDate)
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    
    const startOfWeek = new Date(todayDate)
    startOfWeek.setDate(startOfWeek.getDate() - todayDate.getDay()) // Sunday start

    const groups: Record<string, any[]> = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Older': []
    }

    filtered.forEach(setup => {
      const d = new Date(setup.created_at)
      if (d >= todayDate) groups['Today'].push(setup)
      else if (d >= yesterdayDate) groups['Yesterday'].push(setup)
      else if (d >= startOfWeek) groups['This Week'].push(setup)
      else groups['Older'].push(setup)
    })

    return groups
  }, [setups, activeFilter, searchQuery])

  const totalFilteredCount = useMemo(() => {
    return Object.values(groupedSetups).reduce((acc, arr) => acc + arr.length, 0)
  }, [groupedSetups])

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
    
    const todayCount = setups.filter(s => new Date(s.created_at) >= today).length
    if (todayCount > 0) return { setupCount: todayCount, setupLabel: "Published Today" }
    
    const yesterdayCount = setups.filter(s => new Date(s.created_at) >= yesterday && new Date(s.created_at) < today).length
    return { setupCount: yesterdayCount || setups.length, setupLabel: yesterdayCount > 0 ? "Published Yesterday" : "Active Setups" }
  }, [setups])

if (!mounted || loading) {
    return (
      <div className="w-full min-h-[80vh] p-6 md:p-8 font-sans space-y-8">
        <div className="w-full h-32 bg-[#0a0a0a] border border-neutral-800 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-[#0a0a0a] border border-neutral-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="w-full h-64 bg-[#0a0a0a] border border-neutral-800 rounded-2xl animate-pulse"></div>
      </div>
    )
  }

  return (
    // 🚨 STRICT VIEWPORT LOCK: flex-col and overflow-hidden ensures the main page NEVER scrolls
    <div className="w-full bg-[#050505] text-white p-4 md:p-6 font-sans flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        
        {/* --- LEFT COLUMN: MAIN DASHBOARD & FEED --- */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full min-h-0 space-y-6">
          
          {/* Top Metric Cards (Fixed at top) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 shrink-0">
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
                {/* 🚨 FIXED CROPPING: Reduced from text-2xl to text-xl xl:text-2xl so "NY / London" fits perfectly */}
                <div className="text-xl xl:text-2xl font-black text-white tracking-tight uppercase italic truncate">{getActiveSession()}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-neutral-400 group-hover:text-white transition-colors animate-pulse shrink-0"><Globe size={20} /></div>
            </div>
            
            <div className="md:col-span-4 xl:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden">
              <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 truncate">Current Tier</div>
              <div className={`text-xl font-black uppercase tracking-widest truncate ${userPlan === 'premium' ? 'text-amber-500' : userPlan === 'pro' ? 'text-brand-primary' : userPlan === 'essential' ? 'text-blue-500' : 'text-neutral-400'}`}>
                {userPlan === 'premium' ? 'Gold Premium' : userPlan}
              </div>
            </div>
          </div>

          {/* 🚨 THE SCROLLABLE FEED SECTION 🚨 */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Feed Header with Permanent Filter */}
            <div className="p-5 border-b border-neutral-900 flex items-center justify-between shrink-0 bg-[#0d0d0d] z-10">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} className="text-blue-500" /> Market Analysis Feed
              </h3>
              
              {/* Dropdown Filter */}
              <div className="relative" ref={filterRef}>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${isFilterOpen ? 'bg-neutral-800 border-neutral-600 text-white' : 'bg-[#111] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'}`}
                >
                  <ListFilter size={14} className={isFilterOpen ? 'text-blue-400' : 'text-neutral-500'} />
                  {activeFilter}
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-[0_0_40px_rgba(0,0,0,1)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-neutral-900 bg-[#0d0d0d]">
                      <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-2">Filter Categories</p>
                    </div>
                    <div className="p-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {FILTERS.map(f => {
                        const locked = isLocked(f.req)
                        const isActive = activeFilter === f.name
                        return (
                          <button 
                            key={f.name}
                            onClick={() => handleFilterSelect(f.name, locked)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-blue-500/10 text-blue-400' : locked ? 'text-neutral-600 cursor-not-allowed opacity-50' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}
                          >
                            <span className="flex items-center gap-2">
                              {locked && <Lock size={12} className="text-neutral-600" />}
                              {f.name}
                            </span>
                            {isActive && <Check size={14} className="text-blue-500" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable List of Setups grouped by Time */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#050505]">
              {totalFilteredCount === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <Target className="w-10 h-10 text-neutral-700 mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
                    {searchQuery ? `No setups matching "${searchQuery}"` : `No active setups in ${activeFilter}`}
                  </p>
                </div>
              ) : (
                Object.entries(groupedSetups).map(([groupName, items]) => {
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={groupName} className="mb-8 last:mb-0">
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-neutral-900/50 px-3 py-1 rounded-full border border-neutral-800/50">
                          {groupName}
                        </h4>
                        <div className="flex-1 h-px bg-neutral-800/50"></div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                        {items.map(setup => {
                          const isBull = setup.bias?.toUpperCase() === 'BULLISH'
                          const isBear = setup.bias?.toUpperCase() === 'BEARISH'
                          const isBookmarked = watchlist.some(item => item.id === setup.id)

                          return (
                            <div 
                              key={setup.id} 
                              onClick={async () => {
                                const { data: { user } } = await supabase.auth.getUser()
                                if (user) supabase.from('activity_logs').insert([{ user_id: user.id, action: 'FEED_CLICK', asset_symbol: setup.asset_symbol, timeframe: setup.timeframe }]).then()
                                router.push(`/markets/viewport?asset=${setup.asset_symbol}&tf=${setup.timeframe}&from=dashboard`)
                              }}
                              className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-600 hover:bg-white/[0.02] transition-all rounded-xl p-3 cursor-pointer group flex flex-col shadow-sm overflow-hidden"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-[#111] px-1.5 py-0.5 rounded border border-neutral-800 truncate">
                                  {setup.timeframe || '-'}
                                </span>
                                <button onClick={(e) => toggleBookmark(e, setup)} className="text-neutral-600 hover:text-white transition-colors">
                                  <Bookmark size={14} className={isBookmarked ? 'fill-amber-500 text-amber-500' : ''} />
                                </button>
                              </div>
                              
                              <div className="flex items-center justify-between mt-auto">
                                <span className="text-sm font-black text-white tracking-tight truncate pr-2">
                                  {setup.asset_symbol || 'UNKNOWN'}
                                </span>
                                <div className={`p-1.5 rounded-lg shrink-0 ${isBull ? 'bg-emerald-500/10 text-emerald-500' : isBear ? 'bg-red-500/10 text-red-500' : 'bg-neutral-800 text-neutral-400'}`}>
                                  {isBull ? <TrendingUp size={14} /> : isBear ? <TrendingDown size={14} /> : <Minus size={14} />}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: WIDGETS --- */}
        {/* 🚨 independent scroll on the right side if the user adds lots of widgets */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col h-full overflow-y-auto custom-scrollbar space-y-6 pr-2">
          
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 shrink-0 shadow-xl">
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
                <div className="p-4 bg-[#111] border border-neutral-800/50 rounded-xl text-center">
                  <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">No Active Broadcasts</span>
                </div>
              )}
              
              <div className="p-3 bg-[#111] border border-neutral-800 rounded-xl flex items-center justify-between">
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">System Status</span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div> Operational</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 shrink-0 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center">
                <Bookmark size={16} className="text-amber-500 mr-2" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">The Vault</h3>
              </div>
              <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Saved Setups</span>
            </div>

            <div className="space-y-2">
              {watchlist.length > 0 ? (
                watchlist.slice(0, 6).map((item) => (
                  <div key={item.id} onClick={() => router.push(`/markets/viewport?asset=${item.symbol}&tf=${item.timeframe}&from=dashboard`)} className="flex items-center justify-between p-3 bg-[#111] hover:bg-neutral-800 border border-neutral-800 rounded-xl cursor-pointer transition-colors group">
                    <div className="flex items-center min-w-0 pr-2">
                      <span className="text-xs font-bold text-white tracking-widest truncate">{item.symbol}</span>
                      {item.timeframe && <span className="text-[9px] font-bold text-neutral-500 ml-2 uppercase truncate">{item.timeframe}</span>}
                    </div>
                    <ChevronRight size={14} className="text-neutral-600 group-hover:text-white transition-colors shrink-0" />
                  </div>
                ))
              ) : <div className="py-6 text-center text-neutral-600 text-xs italic font-medium">No saved setups.</div>}
            </div>
            
            {watchlist.length > 6 && <button onClick={() => router.push('/vault')} className="w-full mt-3 py-3 bg-[#111] rounded-xl text-[10px] font-black text-neutral-500 hover:text-white hover:bg-neutral-800 uppercase tracking-widest transition-colors border border-neutral-800">View All {watchlist.length} Targets</button>}
          </div>

        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-[80vh] bg-[#050505] flex flex-col items-center justify-center space-y-4"><Activity className="animate-pulse text-blue-500" size={40} /><span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-xs">Loading Dashboard...</span></div>}>
      <DashboardContent />
    </Suspense>
  )
}
