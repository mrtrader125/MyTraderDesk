"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ShieldCheck, Loader2 } from 'lucide-react'
import GeneralDashboard from './GeneralDashboard'
import PersonalDashboard from './PersonalDashboard'
import { useRouter } from 'next/navigation'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardClient() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<'general' | 'personal'>('general')
  const [isSubmittingProtocol, setIsSubmittingProtocol] = useState(false)

  // 1. Initial Empty State (Loads in 0ms)
  const [userId, setUserId] = useState<string>('')
  const [profile, setProfile] = useState<any>({ plan: 'pro', protocol_established: true })
  const [broadcast, setBroadcast] = useState<any>(null)
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [setups, setSetups] = useState<any[]>([])
  
  // 🚨 THE FIX: Track when data finishes downloading
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    const handleViewChange = (e: any) => {
      if (e.detail === 'general' || e.detail === 'personal') setActiveView(e.detail)
    }
    window.addEventListener('switchDashboardView', handleViewChange)
    return () => window.removeEventListener('switchDashboardView', handleViewChange)
  }, [])

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return

      setUserId(user.id)

      // Fetch Profile
      const { data: profileData } = await supabase.from('profiles').select('plan, protocol_established').eq('id', user.id).single()
      if (profileData) setProfile(profileData)

      // Fetch Broadcasts
      const { data: broadcastsData } = await supabase.from('notifications').select('*').eq('type', 'BROADCAST').eq('status', 'ACTIVE').order('created_at', { ascending: false }).limit(1)
      if (broadcastsData && broadcastsData.length > 0) {
        const b = broadcastsData[0]
        const userTier = profileData?.plan ? profileData.plan.toUpperCase() : 'DEMO'
        if (b.target_tier === 'ALL' || b.target_tier === userTier) {
          setBroadcast(b)
        }
      }

      // Fetch Vault
      const { data: vaultData } = await supabase.from('user_vault').select('analysis_id, analyses(asset_symbol, timeframe, status)').eq('user_id', user.id)
      if (vaultData) {
        setWatchlist(vaultData.map((v: any) => ({
          id: v.analysis_id,
          symbol: v.analyses?.asset_symbol,
          timeframe: v.analyses?.timeframe,
          status: v.analyses?.status
        })))
      }

      // Fetch Analyses
      const { data: analysesData } = await supabase.from('analyses').select('*').order('created_at', { ascending: false })
      if (analysesData) {
        const isPro = profileData?.plan === 'pro' || profileData?.plan === 'premium'
        const safeAnalyses = analysesData.map((setup: any) => {
          if (isPro) return setup
          return { ...setup, notes: null, content: null }
        })
        setSetups(safeAnalyses)
      }

      // 🚨 DATA HAS ARRIVED: Trigger the UI to refresh with the real numbers
      setIsDataLoaded(true)
    }

    initData()
  }, [])

  const showOnboarding = profile?.protocol_established === false || profile?.protocol_established === null

  const completeProtocol = async () => {
    setIsSubmittingProtocol(true)
    if (userId) {
      await supabase.from('profiles').update({ protocol_established: true }).eq('id', userId)
      setProfile((prev: any) => ({ ...prev, protocol_established: true }))
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
        
        <div className={`absolute inset-0 w-full h-full transition-all duration-200 ease-out ${activeView === 'general' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 -z-10 pointer-events-none'}`}>
          {/* 🚨 THE KEY TRICK: Forces GeneralDashboard to refresh the millisecond the data arrives */}
          <GeneralDashboard 
            key={`general-${isDataLoaded}`} 
            userId={userId} 
            initialPlan={profile?.plan?.toLowerCase() || 'pro'} 
            initialBroadcast={broadcast} 
            initialWatchlist={watchlist} 
            initialSetups={setups} 
          />
        </div>

        <div className={`absolute inset-0 w-full h-full transition-all duration-200 ease-out ${activeView === 'personal' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 -z-10 pointer-events-none'}`}>
          {/* 🚨 THE KEY TRICK: Prevents PersonalDashboard from sticking on empty data */}
          <PersonalDashboard 
            key={`personal-${isDataLoaded}`}
            userId={userId} 
          />
        </div>

      </div>
    </div>
  )
}
