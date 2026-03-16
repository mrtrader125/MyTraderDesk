'use client'

import { useState, useEffect } from 'react'
import { Search, Lock, Activity, Zap, Globe, TrendingUp, TrendingDown, Minus, BellRing } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function OperatorTerminal() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [userPlan, setUserPlan] = useState('free') 
  const [setups, setSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const FILTERS = [
    { name: 'All', req: 'free' },
    { name: 'Forex', req: 'free' },
    { name: 'Gold', req: 'essential' },
    { name: 'Crypto', req: 'pro' },
    { name: 'Indices', req: 'pro' },
    { name: 'Stocks', req: 'pro' }
  ]

  useEffect(() => {
    async function fetchLiveTerminalData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single()
            
          if (profile?.plan) {
            setUserPlan(profile.plan.toLowerCase())
          }

          const { data: analyses, error } = await supabase
            .from('analyses')
            .select('*')
            .order('created_at', { ascending: false })

          if (!error && analyses) {
            setSetups(analyses)
          }
        }
      } catch (err) {
        console.error("Dashboard Sync Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveTerminalData()
  }, [])

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

  // --- DYNAMIC METRIC CALCULATORS ---
  const getActiveSession = () => {
    const hour = new Date().getUTCHours()
    if (hour >= 13 && hour < 17) return 'NY / London Overlap'
    if (hour >= 13 && hour < 22) return 'New York Session'
    if (hour >= 8 && hour < 17) return 'London Session'
    if (hour >= 23 || hour < 8) return 'Tokyo / Sydney'
    return 'Inter-Bank Transition'
  }

  let deployCount = 0
  let deployLabel = 'Recent Deployments'

  if (setups.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayCount = setups.filter(s => new Date(s.created_at) >= today).length
    
    if (todayCount > 0) {
      deployCount = todayCount
      deployLabel = "Deployed Today"
    } else {
      const yesterdayCount = setups.filter(s => new Date(s.created_at) >= yesterday && new Date(s.created_at) < today).length
      if (yesterdayCount > 0) {
        deployCount = yesterdayCount
        deployLabel = "Deployed Yesterday"
      }
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-blue-500" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-xs">Syncing Terminal...</span>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white p-6 md:p-8 space-y-8 font-sans">
      
      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Intelligence Card */}
        <div className="md:col-span-4 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between group hover:border-neutral-700 transition-colors">
          <div>
            <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{deployLabel}</div>
            <div className="text-3xl font-black text-white tracking-tighter">{deployCount}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-xl text-neutral-400 group-hover:text-white transition-colors">
            <Zap size={20} />
          </div>
        </div>

        {/* Market Session Card */}
        <div className="md:col-span-5 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between group hover:border-neutral-700 transition-colors">
          <div>
            <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Market Session</div>
            <div className="text-2xl font-black text-white tracking-tighter uppercase italic">{getActiveSession()}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-xl text-neutral-400 group-hover:text-white transition-colors animate-pulse">
            <Globe size={20} />
          </div>
        </div>
        
        {/* Active Plan Card */}
        <div className="md:col-span-3 bg-[#0a0a0a] border border-neutral-800 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden">
          <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Active Plan</div>
          <div className={`text-lg font-black uppercase tracking-widest ${userPlan === 'pro' ? 'text-brand-primary' : userPlan === 'essential' ? 'text-blue-500' : 'text-neutral-400'}`}>
            {userPlan}
          </div>
        </div>

      </div>

      {/* --- SPLIT LAYOUT: FEED (Left) & BROADCAST (Right) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Intelligence Feed */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
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

                return (
                  <div 
                    key={setup.id} 
                    className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-600 hover:bg-white/[0.02] transition-all rounded-xl p-3 cursor-pointer group flex items-center justify-between shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white tracking-tight">{setup.asset_symbol || 'UNKNOWN'}</span>
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">{setup.timeframe || '-'}</span>
                    </div>
                    
                    <div className={`p-1.5 rounded-lg shrink-0 ${isBull ? 'bg-emerald-500/10 text-emerald-500' : isBear ? 'bg-red-500/10 text-red-500' : 'bg-neutral-800 text-neutral-400'}`}>
                      {isBull ? <TrendingUp size={16} /> : isBear ? <TrendingDown size={16} /> : <Minus size={16} />}
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

        {/* RIGHT COLUMN: System Broadcast Panel */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 sticky top-24">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
              <div className="flex items-center">
                <Activity size={16} className="text-blue-500 mr-2 animate-pulse" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Pulse</h3>
              </div>
              <BellRing size={14} className="text-neutral-500" />
            </div>
            
            <div className="space-y-4">
              
              {/* Primary Active Alert */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/20 blur-xl rounded-full"></div>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1.5 relative z-10">System Broadcast</span>
                <p className="text-xs text-blue-100 leading-relaxed font-medium relative z-10">
                  Live data feed connected. Welcome to the terminal. Expect high volatility during upcoming news overlap.
                </p>
              </div>

              {/* Secondary Status Box */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Network Status</span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                </div>
                <p className="text-xs text-neutral-400 font-medium">All Sentinel Vortex modules are fully operational.</p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
