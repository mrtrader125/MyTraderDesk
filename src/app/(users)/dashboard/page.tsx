'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Activity, Zap, Globe, TrendingUp, TrendingDown, Minus, BellRing, Bookmark, ChevronRight, Filter, CheckSquare, Square, X, Target, Search, Plus, Layers, Tag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ASSET_CATEGORIES, PLAN_CONFIG } from '@/lib/platformConfig'
import Image from 'next/image'

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
  const [userId, setUserId] = useState<string | null>(null)
  
  // Broadcast State
  const [activeBroadcast, setActiveBroadcast] = useState<any>(null)

  // --- PERMANENT FILTER STATE ---
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [savedCategories, setSavedCategories] = useState<string[]>([]) 
  const [savedSymbols, setSavedSymbols] = useState<string[]>([])
  const [symbolInput, setSymbolInput] = useState('')

  // DYNAMIC FILTERS (Top Tabs)
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
          setUserId(user.id)
          
          // 🚨 UPGRADED: Load permanent filters (Both Categories AND Symbols)
          const localFilters = localStorage.getItem(`mtd_filters_${user.id}`)
          if (localFilters) {
            try {
              const parsed = JSON.parse(localFilters)
              if (Array.isArray(parsed)) {
                // Backwards compatibility for old format
                setSavedCategories(parsed)
              } else {
                setSavedCategories(parsed.categories || [])
                setSavedSymbols(parsed.symbols || [])
              }
            } catch(e) { console.error("Filter parse error", e) }
          }

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

  // --- CORE FILTERING & GROUPING LOGIC ---
  const groupedSetups = useMemo(() => {
    // 1. Apply Filters
    const hasPermanentFilters = savedCategories.length > 0 || savedSymbols.length > 0

    const filtered = setups.filter(setup => {
      const cat = (setup.category || 'Forex').toLowerCase()
      const sym = (setup.asset_symbol || '').toLowerCase()
      
      // Check Permanent Filter (Categories OR Specific Symbols)
      const passesPermanent = !hasPermanentFilters || 
        savedCategories.map(c => c.toLowerCase()).includes(cat) || 
        savedSymbols.map(s => s.toLowerCase()).includes(sym)
      
      // Check Top Tab Filter
      const passesTab = activeFilter === 'All' ? true : cat === activeFilter.toLowerCase()
      
      // Check Global Search
      const passesSearch = sym.includes(searchQuery)
      
      return passesPermanent && passesTab && passesSearch
    })

    // 2. Time-Based Grouping
    const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
    const yesterdayDate = new Date(todayDate); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const weekDate = new Date(todayDate); weekDate.setDate(todayDate.getDate() - 7);

    const groups = {
      today: [] as any[],
      yesterday: [] as any[],
      thisWeek: [] as any[],
      older: [] as any[]
    }

    filtered.forEach(setup => {
      const d = new Date(setup.created_at)
      if (d >= todayDate) groups.today.push(setup)
      else if (d >= yesterdayDate) groups.yesterday.push(setup)
      else if (d >= weekDate) groups.thisWeek.push(setup)
      else groups.older.push(setup)
    })

    return groups
  }, [setups, activeFilter, searchQuery, savedCategories, savedSymbols])

  // --- FILTER SAVE LOGIC ---
  const savePermanentFilters = (cats: string[], syms: string[]) => {
    setSavedCategories(cats)
    setSavedSymbols(syms)
    if (userId) localStorage.setItem(`mtd_filters_${userId}`, JSON.stringify({ categories: cats, symbols: syms }))
    setShowFilterModal(false)
  }

  const handleAddSymbol = () => {
    if (!symbolInput.trim()) return
    const cleanSymbol = symbolInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (cleanSymbol && !savedSymbols.includes(cleanSymbol)) {
      setSavedSymbols([...savedSymbols, cleanSymbol])
    }
    setSymbolInput('')
  }

  const toggleBookmark = async (e: React.MouseEvent, setup: any) => {
    e.stopPropagation() 
    if (!setup || !userId) return

    const exists = watchlist.find(item => item.id === setup.id)
    let updated = [...watchlist]

    if (exists) {
      updated = updated.filter(item => item.id !== setup.id)
      setWatchlist(updated)
      await supabase.from('user_vault').delete().match({ user_id: userId, analysis_id: setup.id })
    } else {
      updated.unshift({ id: setup.id, symbol: setup.asset_symbol, timeframe: setup.timeframe }) 
      setWatchlist(updated)
      await supabase.from('user_vault').insert([{ user_id: userId, analysis_id: setup.id }])
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
    const todayCount = setups.filter(s => new Date(s.created_at) >= new Date(new Date().setHours(0,0,0,0))).length
    if (todayCount > 0) return { setupCount: todayCount, setupLabel: "Published Today" }
    return { setupCount: setups.length, setupLabel: "Active Setups" }
  }, [setups])

  // Helper to render the grid sections
  const renderSetupGrid = (items: any[], title: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 border-b border-neutral-800 pb-2">
          {title} <span className="text-neutral-700 ml-1">({items.length})</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {items.map(setup => {
            const isBull = setup.bias?.toUpperCase() === 'BULLISH'
            const isBear = setup.bias?.toUpperCase() === 'BEARISH'
            const isBookmarked = watchlist.some(item => item.id === setup.id)

            return (
              <div 
                key={setup.id} 
                onClick={async () => {
                  if (userId) supabase.from('activity_logs').insert([{ user_id: userId, action: 'FEED_CLICK', asset_symbol: setup.asset_symbol, timeframe: setup.timeframe }]).then()
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
          })}
        </div>
      </div>
    )
  }

  if (!mounted || loading) {
    return (
      <div className="w-full min-h-[80vh] p-6 md:p-8 font-sans space-y-8">
        <div className="w-full h-32 bg-[#0a0a0a] border border-neutral-800 rounded-[2rem] animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[#0a0a0a] border border-neutral-800 rounded-2xl animate-pulse"></div>)}
        </div>
        <div className="w-full h-64 bg-[#0a0a0a] border border-neutral-800 rounded-3xl animate-pulse"></div>
      </div>
    )
  }

  const totalFiltered = groupedSetups.today.length + groupedSetups.yesterday.length + groupedSetups.thisWeek.length + groupedSetups.older.length
  const noFiltersApplied = savedCategories.length === 0 && savedSymbols.length === 0

  return (
    <div className="w-full bg-[#050505] text-white p-4 md:p-6 font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100vh - 65px)' }}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full min-h-0 max-w-[1800px] mx-auto w-full">
        
        {/* --- LEFT COLUMN: MAIN CONTENT --- */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full min-h-0 space-y-4">
          
          {/* STATS ROW (Shrink-0 prevents it from shrinking) */}
          <div className="shrink-0 grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 xl:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between group hover:border-neutral-700 transition-colors overflow-hidden shadow-sm">
              <div className="min-w-0 pr-2">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 truncate">{setupLabel}</div>
                <div className="text-3xl font-black text-white tracking-tighter truncate">{setupCount}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-neutral-400 group-hover:text-white transition-colors shrink-0"><Zap size={20} /></div>
            </div>

            <div className="md:col-span-4 xl:col-span-6 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between group hover:border-neutral-700 transition-colors overflow-hidden shadow-sm">
              <div className="pr-2 flex flex-col justify-center">
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Trading Session</div>
                <div className="text-lg xl:text-xl font-black text-white tracking-tight uppercase italic leading-none">{getActiveSession()}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl text-neutral-400 group-hover:text-white transition-colors animate-pulse shrink-0"><Globe size={20} /></div>
            </div>
            
            <div className="md:col-span-4 xl:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden shadow-sm">
              <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 truncate">Current Tier</div>
              <div className={`text-xl font-black uppercase tracking-widest truncate ${userPlan === 'premium' ? 'text-amber-500' : userPlan === 'pro' ? 'text-brand-primary' : userPlan === 'essential' ? 'text-blue-500' : 'text-neutral-400'}`}>
                {userPlan === 'premium' ? 'Gold Premium' : userPlan}
              </div>
            </div>
          </div>

          {/* TEMPORARY FILTER TABS */}
          <div className="shrink-0 flex items-center space-x-1 overflow-x-auto scrollbar-hide w-full bg-[#0a0a0a] p-1 rounded-xl border border-neutral-800">
            {FILTERS.map(f => {
              const locked = isLocked(f.req)
              return (
                <button 
                  key={f.name}
                  onClick={async () => {
                    if (!locked) {
                      setActiveFilter(f.name)
                      if (userId) supabase.from('activity_logs').insert([{ user_id: userId, action: 'FILTER_CLICK', search_query: f.name }]).then()
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

          {/* --- SCROLLABLE FEED ENGINE --- */}
          <div className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-2xl relative">
            
            {/* Feed Header */}
            <div className="px-5 py-4 border-b border-neutral-900 bg-[#0d0d0d] flex items-center justify-between shrink-0 z-10 shadow-sm">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <Target size={14} className="text-blue-500" /> Market Analysis Feed
              </h3>
              {/* PERMANENT FILTER BUTTON */}
              <button 
                onClick={() => setShowFilterModal(true)}
                className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded transition-all border ${!noFiltersApplied ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-[#111] text-neutral-500 border-neutral-800 hover:text-white hover:border-neutral-600'}`}
              >
                <Filter size={12} /> {!noFiltersApplied && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-1"></div>}
              </button>
            </div>

            {/* Scrollable Grid Content */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#050505]">
              {totalFiltered === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 opacity-50">
                  <Activity className="w-10 h-10 text-neutral-700 mb-3" />
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">No Setups Found</p>
                  {!noFiltersApplied && <p className="text-[9px] font-bold text-neutral-600 mt-2">Check your permanent preferences</p>}
                </div>
              ) : (
                <>
                  {renderSetupGrid(groupedSetups.today, "Today")}
                  {renderSetupGrid(groupedSetups.yesterday, "Yesterday")}
                  {renderSetupGrid(groupedSetups.thisWeek, "This Week")}
                  {renderSetupGrid(groupedSetups.older, "Older History")}
                </>
              )}
            </div>

          </div>
        </div>

        {/* --- RIGHT COLUMN: WIDGETS --- */}
        <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col h-full min-h-0 overflow-y-auto custom-scrollbar space-y-5 pb-6">
          
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 shadow-sm">
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

          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 shadow-sm">
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
            
            {watchlist.length > 6 && <button onClick={() => router.push('/vault')} className="w-full mt-3 py-2 text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors">View All {watchlist.length} Targets</button>}
          </div>

        </div>
      </div>

      {/* ========================================= */}
      {/* 🚨 PERMANENT PREFERENCES MODAL 🚨           */}
      {/* ========================================= */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0a0a] rounded-2xl border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-neutral-900 bg-[#0d0d0d] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-blue-500" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Feed Preferences</h3>
              </div>
              <button onClick={() => setShowFilterModal(false)} className="text-neutral-500 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="p-5 overflow-y-auto custom-scrollbar space-y-6">
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-relaxed border-b border-neutral-900 pb-4">
                Personalize your market feed. Instruments matching <span className="text-white">ANY</span> of the filters below will be shown. If both are empty, everything is shown.
              </p>
              
              {/* SECTION 1: BROAD CATEGORIES */}
              <div>
                <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Layers size={12} className="text-amber-500"/> Asset Classes
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(ASSET_CATEGORIES).map(cat => {
                    const isChecked = noFiltersApplied || savedCategories.includes(cat)
                    return (
                      <button 
                        key={cat}
                        onClick={() => {
                          let newArr = [...savedCategories]
                          if (noFiltersApplied) {
                            // If they uncheck one when "all" are technically active, auto-populate the rest
                            newArr = Object.keys(ASSET_CATEGORIES).filter(c => c !== cat)
                          } else {
                            if (isChecked) newArr = newArr.filter(c => c !== cat)
                            else newArr.push(cat)
                          }
                          if (newArr.length === 0 && savedSymbols.length === 0) newArr = [] // Reset state completely
                          setSavedCategories(newArr)
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isChecked ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#111] border-neutral-800 hover:border-neutral-600'}`}
                      >
                        <span className={`text-xs font-black uppercase tracking-widest ${isChecked ? 'text-amber-400' : 'text-neutral-500'}`}>{cat}</span>
                        {isChecked ? <CheckSquare size={16} className="text-amber-500" /> : <Square size={16} className="text-neutral-600" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* SECTION 2: SPECIFIC TICKERS */}
              <div>
                <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Tag size={12} className="text-blue-500" /> Specific Instruments
                </h4>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input 
                      type="text"
                      value={symbolInput}
                      onChange={(e) => setSymbolInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSymbol(); } }}
                      placeholder="e.g. GBPJPY, BTCUSD"
                      className="w-full bg-[#111] border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none uppercase placeholder:normal-case transition-all"
                    />
                  </div>
                  <button 
                    onClick={(e) => { e.preventDefault(); handleAddSymbol(); }}
                    className="p-2.5 bg-[#111] hover:bg-blue-500/10 text-neutral-400 hover:text-blue-500 rounded-xl border border-neutral-800 hover:border-blue-500/30 transition-all shrink-0"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-[#111] border border-neutral-800 rounded-xl">
                  {savedSymbols.length === 0 ? (
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest m-auto">No specific targets added</span>
                  ) : (
                    savedSymbols.map(sym => (
                      <span key={sym} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0a0a0a] text-neutral-300 text-[10px] font-black uppercase tracking-widest rounded-lg border border-neutral-700 shadow-sm group">
                        {sym}
                        <button 
                          onClick={() => setSavedSymbols(savedSymbols.filter(s => s !== sym))}
                          className="text-neutral-500 hover:text-red-400 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-neutral-900 bg-[#0d0d0d] shrink-0 space-y-3">
              <button 
                onClick={() => savePermanentFilters(savedCategories, savedSymbols)}
                className="w-full py-3.5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              >
                Save Feed Preferences
              </button>
              
              {!noFiltersApplied && (
                <button 
                  onClick={() => savePermanentFilters([], [])}
                  className="w-full py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-widest hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Reset to Default (Show All)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

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
