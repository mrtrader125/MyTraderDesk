'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Lock, Clock, Shield, Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react'
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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
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

    const { hasAccess, requiredTier } = getSetupAccess(setup, userPlan)

    return (
      <div 
        onClick={() => router.push(`/markets/viewport?asset=${asset}`)}
        className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col group cursor-pointer hover:border-neutral-600 transition-all duration-300 shadow-sm relative min-h-[220px]"
      >
        <div className="h-32 w-full bg-black relative overflow-hidden border-b border-neutral-800/50">
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
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                {setup.timeframe || '-'}
              </div>
              <div className={`absolute bottom-3 right-3 p-1.5 rounded-lg backdrop-blur-md border ${isBull ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-500' : isBear ? 'bg-red-500/20 border-red-500/20 text-red-500' : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'}`}>
                {isBull ? <TrendingUp size={12} /> : isBear ? <TrendingDown size={12} /> : <Minus size={12} />}
              </div>
            </>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 justify-between">
          <h3 className={`text-[13px] font-bold line-clamp-2 leading-snug mb-3 transition-colors ${hasAccess ? 'text-neutral-200 group-hover:text-white' : 'text-neutral-600'}`}>
            {hasAccess ? displayText : 'Analysis Locked.'}
          </h3>
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-neutral-500 pt-3 border-t border-neutral-800/50">
            <span className="flex items-center"><Clock size={10} className="mr-1" /> {formattedDate}</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] p-6 md:p-8 font-sans">
      <div className="flex items-center space-x-4 mb-10 pb-4 border-b border-neutral-800">
        <button 
          onClick={() => router.push('/markets')}
          className="w-10 h-10 rounded-xl bg-white/5 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-white/10 hover:text-white transition-all shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">{asset} <span className="text-brand-primary">Archive</span></h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Historical Asset Records</p>
        </div>
      </div>

      <div className="space-y-12">
        {grouped.today.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center">
              Published Today <div className="ml-4 h-px flex-1 bg-neutral-800"></div>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {grouped.today.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
            </div>
          </section>
        )}

        {grouped.yesterday.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4 flex items-center">
              Yesterday <div className="ml-4 h-px flex-1 bg-neutral-800"></div>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {grouped.yesterday.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
            </div>
          </section>
        )}

        {grouped.older.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-4 flex items-center">
              Older Setups <div className="ml-4 h-px flex-1 bg-neutral-800/50"></div>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 opacity-80 hover:opacity-100 transition-opacity">
              {grouped.older.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
            </div>
          </section>
        )}

        {history.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <span className="text-sm font-black text-neutral-600 uppercase tracking-widest">No Historical Data Found</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]"></div>}>
      <ArchiveContent />
    </Suspense>
  )
}
