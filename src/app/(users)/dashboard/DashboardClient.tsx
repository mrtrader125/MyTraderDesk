"use client"

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import { ShieldCheck, Loader2 } from 'lucide-react'
import GeneralDashboard from './GeneralDashboard'
import PersonalDashboard from './PersonalDashboard'
import { useRouter } from 'next/navigation'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// The SWR Data Fetcher
const fetchDashboardData = async (userId: string) => {
  const [
    { data: profile },
    { data: broadcasts },
    { data: vaultData },
    { data: analyses }
  ] = await Promise.all([
    supabase.from('profiles').select('plan, protocol_established').eq('id', userId).single(),
    supabase.from('notifications').select('*').eq('type', 'BROADCAST').eq('status', 'ACTIVE').order('created_at', { ascending: false }).limit(1),
    supabase.from('user_vault').select('analysis_id, analyses(asset_symbol, timeframe, status)').eq('user_id', userId),
    supabase.from('analyses').select('*').order('created_at', { ascending: false })
  ])

  const formattedWatchlist = vaultData?.map((v: any) => ({
    id: v.analysis_id,
    symbol: v.analyses?.asset_symbol,
    timeframe: v.analyses?.timeframe,
    status: v.analyses?.status
  })) || []

  let activeBroadcast = null
  if (broadcasts && broadcasts.length > 0) {
    const b = broadcasts[0]
    const userTier = profile?.plan ? profile.plan.toUpperCase() : 'DEMO'
    if (b.target_tier === 'ALL' || b.target_tier === userTier) {
      activeBroadcast = b
    }
  }

  const isPro = profile?.plan === 'pro' || profile?.plan === 'premium'
  const safeAnalyses = analyses?.map((setup: any) => {
    if (isPro) return setup
    return { ...setup, notes: null, content: null }
  }) || []

  return {
    profile,
    broadcast: activeBroadcast,
    watchlist: formattedWatchlist,
    setups: safeAnalyses
  }
}

export default function DashboardClient({ userId }: { userId: string }) {
  const router = useRouter()
  const [activeView, setActiveView] = useState<'general' | 'personal'>('general')
  const [isSubmittingProtocol, setIsSubmittingProtocol] = useState(false)

  // 🚀 SWR MAGIC: Caches the data in RAM. Second visit is 0ms.
  const { data, isLoading, mutate } = useSWR(userId ? `dashboard_data_${userId}` : null, () => fetchDashboardData(userId), {
    revalidateOnFocus: false, // Doesn't spam the DB if they switch browser tabs
    dedupingInterval: 60000   // Caches the data for 60 seconds
  })

  useEffect(() => {
    const handleViewChange = (e: any) => {
      if (e.detail === 'general' || e.detail === 'personal') setActiveView(e.detail)
    }
    window.addEventListener('switchDashboardView', handleViewChange)
    return () => window.removeEventListener('switchDashboardView', handleViewChange)
  }, [])

  // Show spinner only on the very first load
  if (isLoading || !data) {
    return (
      <div className="flex h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] w-full items-center justify-center bg-[#050505]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  // The Bouncer: Redirect to onboarding if protocol isn't established
  const showOnboarding = data.profile?.protocol_established === false || data.profile?.protocol_established === null

  const completeProtocol = async () => {
    setIsSubmittingProtocol(true)
    await supabase.from('profiles').update({ protocol_established: true }).eq('id', userId)
    await mutate() // Instantly updates the cached data to remove onboarding screen
    setIsSubmittingProtocol(false)
  }

  return (
    <div className="relative flex flex-col h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] bg-[#050505] overflow-hidden w-full">
      
      {showOnboarding && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="w-full max-w-lg bg-[#0a0a0f] border border-zinc-800 rounded-3xl p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-8">
              <ShieldCheck className="text-blue-500" size={32} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
              Establish <span className="text-blue-500">Protocol</span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-8">
              Terminal access granted. Before engaging the live markets, you must define your operational parameters. These cannot be bypassed.
            </p>

            <button 
              onClick={completeProtocol}
              disabled={isSubmittingProtocol}
              className="w-full bg-white hover:bg-zinc-200 py-4 rounded-xl text-black font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center transition-all disabled:opacity-50"
            >
              {isSubmittingProtocol ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              {isSubmittingProtocol ? 'Writing to Ledger...' : 'Acknowledge & Initialize Desk'}
            </button>
          </div>
        </div>
      )}

      <div className={`relative flex-1 bg-[#050505] overflow-hidden w-full h-full transition-all duration-1000 ${showOnboarding ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100 blur-none'}`}>
        
        {/* FAST CSS TRANSITIONS: duration-200 ease-out translate-y-2 */}
        <div className={`absolute inset-0 w-full h-full transition-all duration-200 ease-out ${activeView === 'general' ? 'opacity-100 translate-y-0 z-10 pointer-events-auto' : 'opacity-0 translate-y-2 -z-10 pointer-events-none'}`}>
          <GeneralDashboard 
            userId={userId} 
            initialPlan={data.profile?.plan?.toLowerCase() || 'demo'} 
            initialBroadcast={data.broadcast} 
            initialWatchlist={data.watchlist} 
            initialSetups={data.setups} 
          />
        </div>

        <div className={`absolute inset-0 w-full h-full transition-all duration-200 ease-out ${activeView === 'personal' ? 'opacity-100 translate-y-0 z-10 pointer-events-auto' : 'opacity-0 translate-y-2 -z-10 pointer-events-none'}`}>
          <PersonalDashboard userId={userId} />
        </div>

      </div>
    </div>
  )
}
