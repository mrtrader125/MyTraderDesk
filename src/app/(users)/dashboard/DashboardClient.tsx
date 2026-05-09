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

  // 🚀 SWR Caching
  const { data, mutate } = useSWR('dashboard_data', fetchDashboardData, {
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

  // 🚨 THE FIX: Safe default data. 
  // This allows the layout to render INSTANTLY while SWR fetches the real data in the background.
  const safeData = data || {
    userId: '',
    profile: { plan: 'demo', protocol_established: true }, // Assumes true initially to prevent flash
    broadcast: null,
    watchlist: [],
    setups: []
  }

  // Only show onboarding if we have data AND it explicitly says false
  const showOnboarding = data && (data.profile?.protocol_established === false || data.profile?.protocol_established === null)

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
          <div className="w-full max-w-lg bg-[#0a0a0f] border border-zinc-800 rounded-3xl p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-8">
              <ShieldCheck className="text-blue-500" size={32} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
              Establish <span className="text-blue-500">Protocol</span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-8">
              Terminal access granted. Before engaging the live markets, you must define your operational parameters.
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
        
        {/* General View */}
        <div className={`absolute inset-0 w-full h-full transition-all duration-200 ease-out ${activeView === 'general' ? 'opacity-100 translate-y-0 z-10 pointer-events-auto' : 'opacity-0 translate-y-2 -z-10 pointer-events-none'}`}>
          <GeneralDashboard 
            userId={safeData.userId} 
            initialPlan={safeData.profile?.plan?.toLowerCase() || 'demo'} 
            initialBroadcast={safeData.broadcast} 
            initialWatchlist={safeData.watchlist} 
            initialSetups={safeData.setups} 
          />
        </div>

        {/* Personal View */}
        <div className={`absolute inset-0 w-full h-full transition-all duration-200 ease-out ${activeView === 'personal' ? 'opacity-100 translate-y-0 z-10 pointer-events-auto' : 'opacity-0 translate-y-2 -z-10 pointer-events-none'}`}>
          <PersonalDashboard userId={safeData.userId} />
        </div>

      </div>
    </div>
  )
}
