'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Lock, Clock, Shield, Crown, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react'
import { getSetupAccess } from '@/lib/access'

function ArchiveContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const asset = searchParams.get('asset')
  
  const [history, setHistory] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState<string>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!asset) return router.push('/markets')

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
        if (profile?.plan) setUserPlan(profile.plan.toLowerCase())
      }

      const { data } = await supabase.from('analyses').select('*').eq('asset_symbol', asset).order('created_at', { ascending: false })
      if (data) setHistory(data)
      setLoading(false)
    }
    loadData()
  }, [asset, router])

  if (loading) {
    return (
      <div className="w-full bg-[#050505] flex items-center justify-center" style={{ height: 'calc(100dvh - 65px)' }}>
        <span className="text-neutral-500 text-[10px] font-black tracking-widest uppercase animate-pulse">Loading Archive...</span>
      </div>
    )
  }

  // --- GROUPING LOGIC ---
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)

  const grouped = { today: [] as any[], yesterday: [] as any[], older: [] as any[] }

  history.forEach(setup => {
    const setupDate = new Date(setup.created_at); setupDate.setHours(0, 0, 0, 0)
    if (setupDate.getTime() === today.getTime()) grouped.today.push(setup)
    else if (setupDate.getTime() === yesterday.getTime()) grouped.yesterday.push(setup)
    else grouped.older.push(setup)
  })

  const ArchiveCard = ({ setup }: { setup: any }) => {
    const dateObj = new Date(setup.created_at)
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const displayText = setup.title || setup.content || `${asset} Setup`
    
    const isBull = setup.bias?.toUpperCase() === 'BULLISH'
    const isBear = setup.bias?.toUpperCase() === 'BEARISH'
    
    const isPrime = setup.is_featured === true;
    const { hasAccess, requiredTier } = getSetupAccess(setup, userPlan)

    return (
      <div 
        onClick={() => router.push(`/markets/viewport?asset=${asset}&from=archive`)}
        className={`bg-[#0a0a0a] border rounded-2xl overflow-hidden flex flex-col group cursor-pointer transition-all duration-300 relative min-h-[200px] md:min-h-[220px]
          ${isPrime ? 'border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : 'border-neutral-800 hover:border-neutral-600 shadow-sm'}
        `}
      >
        <div className="h-28 md:h-32 w-full bg-black relative overflow-hidden border-b border-neutral-800/50 shrink-0">
          <img src={setup.image_url} alt="Setup" className={`w-full h-full object-cover transition-all duration-500 ${hasAccess ? 'opacity-40 group-hover:opacity-100' : 'opacity-10 blur-md grayscale'}`} />
          
          {!hasAccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
              <Lock size={16} className={requiredTier === 'pro' ? 'text-brand-primary mb-1.5' : 'text-blue-500 mb-1.5'} />
              <span className="text-[9px] font-black text-white uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded border border-white/10">
                {requiredTier} TIER
              </span>
            </div>
          )}

          {hasAccess && (
            <>
              {/* TIMEFRAME */}
              <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                {setup.timeframe || '-'}
              </div>

              {/* PRIME BADGE (Top Right) */}
              {isPrime && (
                <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center px-2 py-1 rounded-md border bg-amber-500/20 border-amber-500/30 text-amber-500 backdrop-blur-md shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Target size={10} className="mr-1 md:mr-1.5" />
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Prime</span>
                </div>
              )}

              {/* BIAS PILL (Bottom Right) */}
              <div className={`absolute bottom-2 right-2 md:bottom-3 md:right-3 p-1.5 rounded-lg backdrop-blur-md border ${isBull ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-500' : isBear ? 'bg-red-500/20 border-red-500/20 text-red-500' : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'}`}>
                {isBull ? <TrendingUp size={12} /> : isBear ? <TrendingDown size={12} /> : <Minus size={12} />}
              </div>
            </>
          )}
        </div>

        <div className="p-3 md:p-4 flex flex-col flex-1 justify-between">
          <h3 className={`text-xs md:text-[13px] font-bold line-clamp-2 leading-snug mb-3 transition-colors ${hasAccess ? 'text-neutral-200 group-hover:text-white' : 'text-neutral-600'}`}>
            {hasAccess ? displayText : 'Analysis Locked.'}
          </h3>
          <div className="flex justify-between items-center text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-neutral-500 pt-3 border-t border-neutral-800/50 mt-auto">
            <span className="flex items-center"><Clock size={10} className="mr-1" /> {formattedDate}</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    // 🚨 STRICT LOCK: Internal scrolling only, 100dvh
    <div className="w-full bg-[#050505] font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col min-h-0 relative z-10">
        
        {/* HEADER (Fixed at top) */}
        <div className="flex items-center space-x-3 md:space-x-4 p-4 md:p-6 pb-4 md:pb-6 border-b border-neutral-900 shrink-0 bg-[#0a0a0a]/95 backdrop-blur-md z-20 shadow-sm">
          <button 
            onClick={() => router.push('/markets')}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#111] border border-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-neutral-800 hover:text-white hover:border-neutral-600 transition-all shrink-0 shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic leading-none mb-1">{asset} <span className="text-blue-500">Archive</span></h1>
            <p className="text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Historical Asset Records</p>
          </div>
        </div>

        {/* SCROLLABLE GRID CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-8 md:space-y-12 pb-24 md:pb-6 bg-[#050505]">
          
          {grouped.today.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center">
                Published Today <div className="ml-4 h-px flex-1 bg-neutral-800"></div>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {grouped.today.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
              </div>
            </section>
          )}

          {grouped.yesterday.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                Yesterday <div className="ml-4 h-px flex-1 bg-neutral-800"></div>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {grouped.yesterday.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
              </div>
            </section>
          )}

          {grouped.older.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-4 flex items-center">
                Older Setups <div className="ml-4 h-px flex-1 bg-neutral-800/50"></div>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 opacity-90 hover:opacity-100 transition-opacity">
                {grouped.older.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
              </div>
            </section>
          )}

          {history.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center opacity-50">
              <Shield size={32} className="text-neutral-700 mb-4" />
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">No Historical Data Found</span>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="w-full bg-[#050505]" style={{ height: 'calc(100dvh - 65px)' }}></div>}>
      <ArchiveContent />
    </Suspense>
  )
}
