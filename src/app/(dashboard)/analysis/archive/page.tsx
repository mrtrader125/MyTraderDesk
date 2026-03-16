'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Maximize2, Activity, Lock } from 'lucide-react'

// System Configuration
const CORE_ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF', 'XAUUSD', 'GBPCAD', 'CADJPY', 'EURJPY', 'EURAUD', 'GBPAUD']
const SCALP_TIMEFRAMES = ['5m', '5M', '15m', '15M']
const FAST_TIMEFRAMES = [...SCALP_TIMEFRAMES, '1h', '1H', 'H1']

function ArchiveContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const asset = searchParams.get('asset')
  
  const [history, setHistory] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState<string>('FREE')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!asset) return router.push('/analysis')

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
        if (profile?.plan) setUserPlan(profile.plan.toUpperCase())
      }

      const { data } = await supabase.from('analyses').select('*').eq('asset_symbol', asset).order('created_at', { ascending: false })
      if (data) setHistory(data)
      setLoading(false)
    }
    loadData()
  }, [asset, router])

  if (loading) return <div className="h-screen flex items-center justify-center text-neutral-500 text-[11px] font-medium tracking-widest uppercase">Retrieving Archive...</div>

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
    
    // Authorization Check Engine
    const isCore = CORE_ASSETS.includes(asset || '')
    const tf = setup.timeframe || ''
    const isScalp = SCALP_TIMEFRAMES.includes(tf)
    const isFastDelay = FAST_TIMEFRAMES.includes(tf)

    const ageInHours = (new Date().getTime() - dateObj.getTime()) / (1000 * 60 * 60)
    const requiredDelayHours = isFastDelay ? 24 : 168
    const isTimeUnlocked = ageInHours >= requiredDelayHours
    const requiredTier = (!isCore || isScalp) ? 'PRO' : 'ESSENTIAL'

    let hasAccess = false
    if (userPlan === 'PRO') hasAccess = true
    else if (userPlan === 'ESSENTIAL' && requiredTier === 'ESSENTIAL') hasAccess = true
    else if (isTimeUnlocked) hasAccess = true

    return (
      <div 
        onClick={() => router.push(`/analysis/viewport?asset=${asset}`)}
        className="bg-card-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-xl overflow-hidden flex flex-col group cursor-pointer hover:border-white/[0.08] hover:bg-white/[0.02] transition-all duration-300 shadow-card relative"
      >
        <div className="h-32 w-full bg-app-bg transition-colors duration-700 relative overflow-hidden border-b border-card-border transition-colors duration-700">
          <img 
            src={setup.image_url} 
            alt="Setup" 
            className={`w-full h-full object-cover transition-all duration-500 ${hasAccess ? 'opacity-60 group-hover:opacity-100' : 'opacity-20 blur-sm grayscale'}`}
          />
          
          {!hasAccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
              <Lock size={18} className="text-neutral-400 mb-1.5" />
              <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">{requiredTier} REQUIRED</span>
            </div>
          )}

          {hasAccess && (
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-neutral-300 uppercase tracking-wider border border-card-border transition-colors duration-700">
              {setup.timeframe}
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col">
          <div className="text-[9px] font-semibold text-neutral-500 tracking-widest mb-1.5 flex justify-between items-center">
            <span>{formattedDate}</span>
            <span>{formattedTime}</span>
          </div>
          <h3 className={`text-[13px] font-medium line-clamp-1 transition-colors ${hasAccess ? 'text-neutral-200 group-hover:text-blue-400' : 'text-neutral-600'}`}>
            {hasAccess ? displayText : 'Intelligence Locked'}
          </h3>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full p-6 pt-2 lg:px-8 lg:py-4 space-y-8 relative z-10 max-w-[1600px] mx-auto -mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-card-border transition-colors duration-700">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push('/analysis')} className="w-9 h-9 rounded-lg bg-white/[0.02] border border-card-border transition-colors duration-700 flex items-center justify-center text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors"><ArrowLeft size={16} /></button>
          <div>
            <div className="flex items-center space-x-3 mb-0.5">
              <h1 className="text-xl font-semibold text-white tracking-tight">{asset}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {grouped.today.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center">Today <div className="ml-3 h-px flex-1 bg-white/[0.04]"></div></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {grouped.today.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
            </div>
          </section>
        )}
        {grouped.yesterday.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">Yesterday <div className="ml-3 h-px flex-1 bg-white/[0.04]"></div></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {grouped.yesterday.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
            </div>
          </section>
        )}
        {grouped.older.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest mb-4 flex items-center">Older Setups <div className="ml-3 h-px flex-1 bg-white/[0.04]"></div></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {grouped.older.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default function ArchivePage() {
  return <Suspense fallback={<div>Loading...</div>}><ArchiveContent /></Suspense>
}

