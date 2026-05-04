"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ShieldCheck, Target, Crosshair, Loader2 } from 'lucide-react'
import GeneralDashboard from './GeneralDashboard'
import PersonalDashboard from './PersonalDashboard'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardClient(props: any) {
  const { userId, needsOnboarding } = props

  // Navigation State
  const [activeView, setActiveView] = useState<'general' | 'personal'>('general')
  
  // Onboarding States (Lifted from Personal Dashboard)
  const [showOnboarding, setShowOnboarding] = useState(needsOnboarding)
  const [isSubmittingProtocol, setIsSubmittingProtocol] = useState(false)

  // Listen for the custom event fired by TopNav
  useEffect(() => {
    const handleViewChange = (e: any) => {
      if (e.detail === 'general' || e.detail === 'personal') {
        setActiveView(e.detail)
      }
    }
    window.addEventListener('switchDashboardView', handleViewChange)
    return () => window.removeEventListener('switchDashboardView', handleViewChange)
  }, [])

  // The Submission Protocol
  const completeProtocol = async () => {
    setIsSubmittingProtocol(true)
    if (userId) {
      await supabase.from('profiles').update({ protocol_established: true }).eq('id', userId)
    }
    setShowOnboarding(false)
    setIsSubmittingProtocol(false)
  }

  return (
    <div className="relative flex flex-col h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] bg-[#050505] overflow-hidden w-full">
      
      {/* ========================================= */}
      {/* THE MASTER GHOST OVERLAY                  */}
      {/* ========================================= */}
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

            <div className="space-y-4 mb-10">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl flex items-start gap-4">
                <Target className="text-zinc-500 mt-1" size={20} />
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1">Risk Parameter</h4>
                  <p className="text-xs text-zinc-500">Acknowledge the strict 2-trade maximum daily limit.</p>
                </div>
              </div>
              <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl flex items-start gap-4">
                <Crosshair className="text-zinc-500 mt-1" size={20} />
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1">Data Ingestion</h4>
                  <p className="text-xs text-zinc-500">Prepare your MT5 execution CSV for the automated journal.</p>
                </div>
              </div>
            </div>

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

      {/* ========================================= */}
      {/* THE BLURRED DASHBOARD CONTAINER           */}
      {/* ========================================= */}
      <div className={`relative flex-1 bg-[#050505] overflow-hidden w-full h-full transition-all duration-1000 ${showOnboarding ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100 blur-none'}`}>
        
        {/* GENERAL VIEW */}
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
            activeView === 'general' 
              ? 'opacity-100 translate-y-0 z-10 pointer-events-auto' 
              : 'opacity-0 translate-y-4 -z-10 pointer-events-none'
          }`}
        >
          <GeneralDashboard {...props} />
        </div>

        {/* PERSONAL VIEW */}
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
            activeView === 'personal' 
              ? 'opacity-100 translate-y-0 z-10 pointer-events-auto' 
              : 'opacity-0 translate-y-4 -z-10 pointer-events-none'
          }`}
        >
          {/* We pass userId down just in case PersonalDashboard needs it directly */}
          <PersonalDashboard userId={userId} />
        </div>

      </div>
    </div>
  )
}
