'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, Globe, Activity, ChevronRight, MoreHorizontal, Maximize2, Star, Lock, Crown, Shield } from 'lucide-react'

// System Configuration for Rules Engine
const CORE_ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF', 'XAUUSD', 'GBPCAD', 'CADJPY', 'EURJPY', 'EURAUD', 'GBPAUD']

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userPlan, setUserPlan] = useState<string>('FREE')
  const [analyses, setAnalyses] = useState<any[]>([])
  const [featuredSetups, setFeaturedSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
        if (profile?.plan) setUserPlan(profile.plan.toUpperCase())
      }

      const { data } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setAnalyses(data)
        const featured = data.filter(a => a.is_featured === true && new Date(a.featured_until) > new Date())
        setFeaturedSetups(featured)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="h-screen flex items-center justify-center text-neutral-500 text-[11px] font-medium tracking-widest uppercase">Loading Platform...</div>

  // Access Evaluation Helper
  const evaluateAccess = (setup: any) => {
    const isCore = CORE_ASSETS.includes(setup.asset_symbol || '')
    const tf = setup.timeframe || ''
    const lowerTf = tf.toLowerCase().replace(/\s+/g, '')
    const isScalp = lowerTf.includes('5m') || lowerTf.includes('15m')
    const isFastDelay = isScalp || lowerTf.includes('1h') || lowerTf.includes('h1')

    const createdTime = new Date(setup.created_at).getTime()
    const ageInHours = (new Date().getTime() - createdTime) / (1000 * 60 * 60)

    const requiredDelayHours = isFastDelay ? 24 : 168
    const isTimeUnlocked = ageInHours >= requiredDelayHours
    const requiredTier = (!isCore || isScalp) ? 'PRO' : 'ESSENTIAL'

    let hasAccess = false
    if (userPlan === 'PRO') hasAccess = true
    else if (userPlan === 'ESSENTIAL' && requiredTier === 'ESSENTIAL') hasAccess = true
    else if (isTimeUnlocked) hasAccess = true

    return { hasAccess, requiredTier }
  }

  const displaySetups = featuredSetups.length > 0 ? featuredSetups : (analyses.length > 0 ? [analyses[0]] : [])
  const recentAnalyses = analyses.slice(0, 6)
  const uniqueMarkets = Array.from(new Set(analyses.map(a => a.asset_symbol))).length

  return (
    <div className="w-full h-full px-6 pb-6 pt-2 lg:px-8 lg:pb-8 lg:pt-4 space-y-4 -mt-10 relative z-10 max-w-[1600px] mx-auto transition-colors duration-700">

      {/* HEADER */}
      <div className="flex flex-col">
        <h1 className="text-[22px] font-medium text-neutral-100 tracking-wide">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : '!'}
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1">Here's what's happening in your platform today.</p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Total Analyses */}
        <div className="bg-card-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-xl p-5 shadow-card flex flex-col justify-between group hover:border-brand-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-2 text-neutral-400">
             <div className="flex items-center space-x-2 text-[13px] font-medium">
                <div className="p-1.5 bg-brand-primary/10 rounded-md text-brand-primary transition-colors"><BarChart3 size={14} /></div>
                <span>Total Analyses</span>
             </div>
             <MoreHorizontal size={14} className="cursor-pointer hover:text-white transition-colors" />
          </div>
          <h2 className="text-3xl font-semibold text-white tracking-tight mt-2">{analyses.length}</h2>
        </div>

        {/* Markets Covered */}
        <div className="bg-card-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-xl p-5 shadow-card flex flex-col justify-between group hover:border-brand-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-2 text-neutral-400">
             <div className="flex items-center space-x-2 text-[13px] font-medium">
                <div className="p-1.5 bg-brand-primary/10 rounded-md text-brand-primary transition-colors"><Globe size={14} /></div>
                <span>Markets Covered</span>
             </div>
          </div>
          <h2 className="text-3xl font-semibold text-white tracking-tight mt-2">{uniqueMarkets}</h2>
        </div>

        {/* System Status */}
        <div className="bg-card-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-xl p-5 shadow-card flex flex-col justify-between group hover:border-brand-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-2 text-neutral-400">
             <div className="flex items-center space-x-2 text-[13px] font-medium">
                <div className="p-1.5 bg-brand-primary/10 rounded-md text-brand-primary transition-colors"><Activity size={14} /></div>
                <span>System Status</span>
             </div>
          </div>
          <div className="flex items-end space-x-3 mt-2">
             <h2 className="text-3xl font-semibold text-white tracking-tight">Optimal</h2>
             <span className="text-[11px] font-medium text-neutral-500 mb-1.5 flex items-center">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" /> Live
             </span>
          </div>
        </div>

        {/* DYNAMIC SUBSCRIPTION CARD */}
        <div className="bg-card-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-brand-primary/40 transition-colors shadow-brand-glow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 blur-[30px] rounded-full pointer-events-none transition-colors duration-700"></div>
          <div className="flex items-center justify-between mb-2 text-neutral-400 relative z-10">
             <div className="flex items-center space-x-2 text-[13px] font-medium">
                <div className="p-1.5 rounded-md bg-brand-primary/10 text-brand-primary transition-colors duration-700">
                  {userPlan === 'PRO' ? <Crown size={14} /> : userPlan === 'ESSENTIAL' ? <Shield size={14} /> : <TrendingUp size={14} />}
                </div>
                <span>Subscription</span>
             </div>
             {userPlan !== 'PRO' && (
               <button onClick={() => router.push('/settings/billing')} className="text-[10px] font-bold text-white uppercase tracking-wider hover:text-brand-primary transition-colors">Upgrade</button>
             )}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight truncate mt-3 relative z-10 text-brand-primary transition-colors duration-700">
             {userPlan}
          </h2>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* LEFT COLUMN: FEATURED THESIS CAROUSEL */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-card-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-xl shadow-card flex flex-col h-[480px]">
            <div className="p-5 border-b border-card-border transition-colors duration-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                 <h3 className="text-[15px] font-medium text-neutral-200">Featured Setups</h3>
                 {featuredSetups.length > 0 && (
                   <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-bold uppercase tracking-widest rounded border border-amber-500/20 flex items-center">
                     <Star size={10} className="mr-1 fill-amber-500" /> Active Priority
                   </span>
                 )}
              </div>
            </div>

            {/* HORIZONTAL SCROLL CONTAINER */}
            <div className="flex-1 p-4 overflow-x-auto flex gap-4 snap-x snap-mandatory scrollbar-hide">
              {displaySetups.length > 0 ? (
                displaySetups.map((setup) => {
                  const { hasAccess, requiredTier } = evaluateAccess(setup)

                  return (
                  <div
                    key={setup.id}
                    onClick={() => router.push(`/analysis/viewport?asset=${setup.asset_symbol}`)}
                    className="h-full relative rounded-lg overflow-hidden border border-card-border transition-colors duration-700 bg-app-bg transition-colors duration-700 cursor-pointer shrink-0 snap-center group transition-all"
                    style={{ width: displaySetups.length > 1 ? '90%' : '100%' }}
                  >
                    <div className="absolute top-4 left-5 z-20 flex space-x-6 pointer-events-none">
                       <div><span className="text-lg font-semibold text-white drop-shadow-md">{setup.asset_symbol}</span></div>
                    </div>

                    <img
                      src={setup.image_url}
                      alt="Featured Setup"
                      className={`w-full h-full object-cover transition-all duration-500 ${hasAccess ? 'opacity-70 group-hover:opacity-100' : 'opacity-20 blur-sm grayscale'}`}
                    />

                    {/* LOCK OVERLAY */}
                    {!hasAccess && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40">
                        <Lock size={24} className="text-neutral-400 mb-2" />
                        <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">{requiredTier} REQUIRED</span>
                      </div>
                    )}

                    {/* TIMEFRAME BADGE (Hidden if locked to keep UI clean) */}
                    {hasAccess && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10 group-hover:border-brand-primary/50 transition-colors">
                        {setup.timeframe}
                      </div>
                    )}

                    {/* HOVER OVERLAY */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
                      <span className="px-4 py-2 bg-brand-primary/10 backdrop-blur-md text-brand-primary text-[11px] font-medium rounded-lg border border-brand-primary/20 shadow-brand-glow transition-colors">
                        {hasAccess ? 'View Terminal' : 'Unlock Setup'}
                      </span>
                    </div>
                  </div>
                )})
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[13px]">No active setups found.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LATEST FEED */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-card-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-xl shadow-card h-[480px] flex flex-col">
            <div className="p-5 border-b border-card-border transition-colors duration-700 flex items-center justify-between">
              <h3 className="text-[15px] font-medium text-neutral-200">Latest Analysis</h3>
              <button onClick={() => router.push('/analysis')} className="text-[11px] font-medium text-neutral-500 hover:text-brand-primary transition-colors flex items-center">
                View All <ChevronRight size={12} className="ml-1" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
              {recentAnalyses.length > 0 ? (
                <div className="space-y-1">
                  {recentAnalyses.map((item) => {
                    const { hasAccess, requiredTier } = evaluateAccess(item)

                    return (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/analysis/viewport?asset=${item.asset_symbol}`)}
                      className="flex items-center p-3 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <div className="w-14 h-10 rounded-md bg-app-bg transition-colors duration-700 border border-card-border transition-colors duration-700 group-hover:border-brand-primary/30 overflow-hidden shrink-0 relative transition-colors">
                        <img src={item.image_url} className={`w-full h-full object-cover transition-all ${hasAccess ? 'opacity-50 group-hover:opacity-100' : 'opacity-20 blur-[2px] grayscale'}`} />
                        {!hasAccess && <div className="absolute inset-0 flex items-center justify-center"><Lock size={12} className="text-neutral-500" /></div>}
                      </div>

                      <div className="ml-3 flex-1 min-w-0">
                        <h4 className={`text-[13px] font-medium truncate transition-colors ${hasAccess ? 'text-neutral-200 group-hover:text-brand-primary' : 'text-neutral-500'}`}>
                          {item.title || `${item.asset_symbol} Setup`}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] text-neutral-500">{new Date(item.created_at).toLocaleDateString()}</span>
                          <span className="px-1.5 py-0.5 bg-white/[0.03] text-neutral-400 text-[9px] font-medium rounded border border-card-border transition-colors duration-700 group-hover:border-brand-primary/20 group-hover:text-brand-primary transition-colors">
                            {item.asset_symbol}
                          </span>
                        </div>
                      </div>

                      <div className="ml-2 shrink-0 flex items-center space-x-1">
                        {!hasAccess && (
                           <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${requiredTier === 'PRO' ? 'text-purple-400 bg-purple-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                             {requiredTier}
                           </span>
                        )}
                        <span className="text-[10px] text-neutral-600 font-medium group-hover:text-white transition-colors">
                          {item.timeframe}
                        </span>
                      </div>
                    </div>
                  )})}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-600 text-[13px]">Feed is empty.</div>
              )}
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}


