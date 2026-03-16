'use client'

import { useState, useEffect } from 'react'
import { Search, LineChart, Bookmark, Lock, Activity, ChevronRight, Zap, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function OperatorTerminal() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [userPlan, setUserPlan] = useState('free') 
  const [setups, setSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filter definitions with tier requirements
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
      // 1. Get logged in user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 2. Get their exact plan from the profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
          
        if (profile?.plan) setUserPlan(profile.plan.toLowerCase())

        // 3. Get the real live setups from the analyses table
        const { data: analyses } = await supabase
          .from('analyses')
          .select('*')
          .order('created_at', { ascending: false })

        if (analyses) setSetups(analyses)
      }
      setLoading(false)
    }

    fetchLiveTerminalData()
  }, [])

  // Helper to check if a filter is locked for the current user
  const isLocked = (reqTier: string) => {
    if (userPlan === 'pro') return false
    if (userPlan === 'essential' && reqTier === 'pro') return true
    if (userPlan === 'free' && reqTier !== 'free') return true
    return false
  }

  // Live Filtering Logic
  const filteredSetups = setups.filter(setup => {
    if (activeFilter === 'All') return true
    // Defaults to 'Forex' if the category column is empty so your old setups don't break
    const marketMatch = (setup.category || 'Forex').toLowerCase()
    return marketMatch === activeFilter.toLowerCase()
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-xs">Syncing Terminal...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8 font-sans">
      
      {/* SLIM BROADCAST TICKER */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center px-4 text-blue-400 text-sm font-bold">
        <Activity size={16} className="mr-3 animate-pulse shrink-0" />
        <span className="uppercase tracking-widest text-[10px] mr-3 bg-blue-500/20 px-2 py-1 rounded shrink-0">System Broadcast</span>
        <span className="truncate">Live data feed connected. Welcome to the terminal.</span>
      </div>

      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Intelligence Deployed" value={setups.length.toString()} subtext="Total active setups" icon={Zap} />
        
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Active Clearance</div>
            <div className={`text-2xl font-black uppercase tracking-tighter ${userPlan === 'pro' ? 'text-brand-primary' : userPlan === 'essential' ? 'text-blue-500' : 'text-neutral-400'}`}>
              {userPlan} Tier
            </div>
            {userPlan !== 'pro' && (
              <button className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/10 transition-colors w-max">
                Upgrade Access
              </button>
            )}
          </div>
        </div>

        <MetricCard label="Market Status" value="Online" subtext="Terminal synchronized" icon={LineChart} />
      </div>

      {/* FEED FILTERS & SEARCH */}
      <div className="border-b border-neutral-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Filter Buttons */}
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

        {/* Search Bar */}
        <div className="flex items-center bg-[#0a0a0a] border border-neutral-800 rounded-full px-4 py-2 w-full md:w-64 focus-within:border-neutral-600 transition-colors shrink-0">
          <Search size={14} className="text-neutral-500 mr-2" />
          <input type="text" placeholder="Search symbols..." className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-neutral-500" />
        </div>

      </div>

      {/* COMPACT INTELLIGENCE GRID */}
      <div>
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Latest Deployments</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {filteredSetups.map(setup => (
            <div key={setup.id} className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-4 hover:border-neutral-600 transition-colors cursor-pointer group flex flex-col">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-black text-white tracking-tight">{setup.asset_symbol || 'UNKNOWN'}</h4>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">{setup.category || 'FOREX'}</span>
                </div>
                <button className="text-neutral-600 hover:text-white transition-colors">
                  <Bookmark size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-0.5">Timeframe</div>
                  <div className="text-xs font-bold text-neutral-300">{setup.timeframe || '-'}</div>
                </div>
                <div>
                  <div className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-0.5">Bias</div>
                  <div className={`text-xs font-bold ${setup.bias?.toLowerCase() === 'bullish' ? 'text-emerald-500' : setup.bias?.toLowerCase() === 'bearish' ? 'text-red-500' : 'text-neutral-400'}`}>
                    {setup.bias || '-'}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px] font-bold">
                <span className="flex items-center text-green-500 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                  {setup.status || 'LIVE'}
                </span>
                <span className="text-neutral-500 group-hover:text-white transition-colors flex items-center">
                  View <ChevronRight size={12} className="ml-0.5" />
                </span>
              </div>
            </div>
          ))}

          {filteredSetups.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-500 italic border border-dashed border-neutral-800 rounded-xl">
              No active intelligence deployments found for this filter.
            </div>
          )}

        </div>
      </div>

    </div>
  )
}

function MetricCard({ label, value, subtext, icon: Icon }: any) {
  return (
    <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between group hover:border-neutral-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</div>
        <Icon size={16} className="text-neutral-600 group-hover:text-white transition-colors" />
      </div>
      <div>
        <div className="text-3xl font-black text-white tracking-tighter mb-1">{value}</div>
        <div className="text-xs text-neutral-500 font-medium">{subtext}</div>
      </div>
    </div>
  )
}
