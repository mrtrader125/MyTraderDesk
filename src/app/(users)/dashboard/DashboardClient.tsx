"use client"

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import { ShieldCheck, Loader2, Zap, Globe, Target } from 'lucide-react'
import GeneralDashboard from './GeneralDashboard'
import PersonalDashboard from './PersonalDashboard'
import { useRouter } from 'next/navigation'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const fetchDashboardData = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const userId = session.user.id
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
    if (b.target_tier === 'ALL' || b.target_tier === userTier) activeBroadcast = b
  }

  const isPro = profile?.plan === 'pro' || profile?.plan === 'premium'
  const safeAnalyses = analyses?.map((setup: any) => {
    if (isPro) return setup
    return { ...setup, notes: null, content: null }
  }) || []

  return {
    userId,
    profile,
    broadcast: activeBroadcast,
    watchlist: formattedWatchlist,
    setups: safeAnalyses
  }
}

export default function DashboardClient() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<'general' | 'personal'>('general')
  const [isSubmittingProtocol, setIsSubmittingProtocol] = useState(false)

  const { data, mutate, isLoading } = useSWR('dashboard_data', fetchDashboardData, {
    revalidateOnFocus: false,
    dedupingInterval: 60000 
  })

  useEffect(() => {
    const handleViewChange = (e: any) => {
      if (e.detail === 'general' || e.detail === 'personal') setActiveView(e.detail)
    }
    window.addEventListener('switchDashboardView', handleViewChange)
    return () => window.removeEventListener('switchDashboardView', handleViewChange)
  }, [])

  // 🚨 1. IF TRULY LOADING (First time or slow network)
  // We show a neutral skeleton so we don't flash "Demo" to a "Pro" user.
  if (isLoading || !data) {
    return (
      <div className="w-full bg-[#050505] p-3 md:p-6 font-sans flex flex-col overflow-hidden h-[calc(100dvh-65px)]">
        <div className="max-w-[1800px] mx-auto w-full h-full space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-3 shrink-0">
             <div className="col-span-2 md:col-span-4 xl:col-span-3 h-24 bg-[#0a0a0a] border border-neutral-800 rounded-2xl animate-pulse"></div>
             <div className="col-span-1 md:col-span-4 xl:col-span-6 h-24 bg-[#0a0a0a] border border-neutral-800 rounded-2xl animate-pulse"></div>
             <div className="col-span-1 md:col-span-4 xl:col-span-3 h-24 bg-[#0a0a0a] border border-neutral-800 rounded-2xl animate-pulse"></div>
          </div>
          <div className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  // 🚨 2. DATA ARRIVED: Now we know exactly who they are
  const showOnboarding = data.profile?.protocol_established === false || data.profile?.protocol_established === null

  const completeProtocol = async () => {
    setIsSubmittingProtocol(true)
    if (data?.userId) {
      await supabase.from('profiles').update({ protocol_established: true }).eq('id', data.userId)
      await mutate() 
    }
    setIsSubmittingProtocol(false)
  }

  return (
    <div className="relative flex flex-col h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] bg-[#050505] overflow-hidden w-full">
      {showOnboarding && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="w-full max-w-lg bg-[#0a0a0f] border border-zinc-800 rounded-3xl p-10 shadow-2xl">
            <h2 className="text-3xl font-black text-white uppercase mb-2 text-center">Establish Protocol</h2>
            <button onClick={completeProtocol} disabled={isSubmittingProtocol} className="w-full bg-white py-4 rounded-xl text-black font-black uppercase tracking-widest mt-6">
               {isSubmittingProtocol ? 'Syncing...' : 'Initialize Desk'}
            </button>
          </div>
        </div>
      )}

      <div className={`relative flex-1 bg-[#050505] overflow-hidden w-full h-full transition-all duration-1000 ${showOnboarding ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
        <div className={`absolute inset-0 w-full h-full transition-all duration-200 ${activeView === 'general' ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
          <GeneralDashboard 
            userId={data.userId} 
            initialPlan={data.profile?.plan?.toLowerCase()} 
            initialBroadcast={data.broadcast} 
            initialWatchlist={data.watchlist} 
            initialSetups={data.setups} 
          />
        </div>
        <div className={`absolute inset-0 w-full h-full transition-all duration-200 ${activeView === 'personal' ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
          <PersonalDashboard userId={data.userId} />
        </div>
      </div>
    </div>
  )
}
