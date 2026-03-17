'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, Crown, Zap, AlertTriangle, Activity, Bookmark } from 'lucide-react'

export default function SubscriptionPage() {
  const [userPlan, setUserPlan] = useState('free')
  const [loading, setLoading] = useState(true)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
        if (profile?.plan) setUserPlan(profile.plan.toLowerCase())
      }
      
      const saved = localStorage.getItem('analysis_watchlist')
      if (saved) setSavedCount(JSON.parse(saved).length)
      
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="animate-pulse flex space-x-4 p-8"><Activity className="text-brand-primary" /></div>

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Subscription</h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Manage your clearance tier and platform access.</p>
      </div>

      {/* CURRENT PLAN CARD */}
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-neutral-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6">
          <div>
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 block">Active Clearance</span>
            <div className="flex items-center space-x-3">
              {userPlan === 'pro' ? <Crown className="text-brand-primary" size={28} /> : userPlan === 'essential' ? <Shield className="text-blue-500" size={28} /> : <Zap className="text-neutral-500" size={28} />}
              <h2 className={`text-3xl font-black uppercase tracking-tighter ${userPlan === 'pro' ? 'text-brand-primary' : userPlan === 'essential' ? 'text-blue-500' : 'text-white'}`}>
                {userPlan} Tier
              </h2>
            </div>
            <p className="text-xs font-medium text-neutral-400 mt-2 max-w-md">
              {userPlan === 'pro' ? 'Maximum clearance granted. Full access to all markets and priority setups.' : 'Limited clearance. Upgrade to unlock restricted global markets and bypass time-delays.'}
            </p>
          </div>
          {userPlan !== 'pro' && (
            <button className="px-8 py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary/90 transition-colors shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.2)] whitespace-nowrap">
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      {/* USAGE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Vault Targets</span>
            <span className="text-2xl font-black text-white">{savedCount}</span>
          </div>
          <Bookmark className="text-amber-500 opacity-20" size={32} />
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Network Status</span>
            <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Operational</span>
          </div>
          <Activity className="text-emerald-500 opacity-20" size={32} />
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="border border-red-500/10 rounded-3xl p-8 mt-12">
        <h2 className="text-sm font-black text-red-500 uppercase tracking-widest mb-2 flex items-center">
          <AlertTriangle className="mr-2" size={16} /> Danger Zone
        </h2>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6 leading-relaxed max-w-lg">
          Canceling your subscription revokes live intelligence access at the end of your billing cycle.
        </p>
        <button className="px-6 py-3 bg-transparent text-red-500/80 border border-red-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors">
          Cancel Subscription
        </button>
      </div>
    </div>
  )
}
