'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, Crown, Zap, AlertTriangle, Activity, Bookmark, X, ExternalLink } from 'lucide-react'
import PricingCards from '@/components/pricing/PricingCards'

export default function SubscriptionPage() {
  const [userPlan, setUserPlan] = useState('free')
  const [loading, setLoading] = useState(true)
  const [savedCount, setSavedCount] = useState(0)
  const [showPricing, setShowPricing] = useState(false)

  // 🚨 REPLACE THIS WITH YOUR ACTUAL LEMON SQUEEZY STORE URL
  const CUSTOMER_PORTAL_URL = "https://your-store-name.lemonsqueezy.com/billing"

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
        if (profile?.plan) setUserPlan(profile.plan.toLowerCase())
        
        const { count } = await supabase.from('user_vault').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        if (count !== null) setSavedCount(count)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="animate-pulse flex space-x-4 p-8"><Activity className="text-brand-primary" /></div>

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-1">Subscription</h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Manage your active plan and platform access.</p>
      </div>

      {/* DYNAMIC CURRENT PLAN CARD */}
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none ${userPlan === 'premium' ? 'bg-amber-500/10' : 'bg-brand-primary/5'}`}></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6">
          <div>
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 block">Active Plan</span>
            <div className="flex items-center space-x-3">
              {userPlan === 'premium' ? <Crown className="text-amber-500" size={28} /> : userPlan === 'pro' ? <Zap className="text-brand-primary" size={28} /> : userPlan === 'essential' ? <Shield className="text-blue-500" size={28} /> : <Zap className="text-neutral-500" size={28} />}
              <h2 className={`text-3xl font-black uppercase tracking-tighter ${userPlan === 'premium' ? 'text-amber-500' : userPlan === 'pro' ? 'text-brand-primary' : userPlan === 'essential' ? 'text-blue-500' : 'text-neutral-900 dark:text-white'}`}>
                {userPlan === 'premium' ? 'Gold Premium' : `${userPlan} Tier`}
              </h2>
            </div>
            <p className="text-xs font-medium text-neutral-400 mt-2 max-w-md">
              {userPlan === 'premium' 
                ? 'Ultimate platform access granted. Full unlock for Gold dashboard and all exclusive scalping modules.' 
                : userPlan === 'pro' 
                ? 'Maximum standard access. Full unlock for all global swing markets and setups.' 
                : 'Limited free access. Upgrade your plan to unlock restricted global markets and bypass time delays.'}
            </p>
          </div>
          {userPlan !== 'premium' && (
            <button 
              onClick={() => setShowPricing(true)}
              className={`px-8 py-4 bg-brand-primary ${userPlan === 'free' ? 'text-black' : 'text-neutral-900 dark:text-white'} text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.2)] whitespace-nowrap shrink-0`}
            >
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Saved Setups</span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white">{savedCount}</span>
          </div>
          <Bookmark className="text-amber-500 opacity-20" size={32} />
        </div>
        <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Network Status</span>
            <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Operational</span>
          </div>
          <Activity className="text-emerald-500 opacity-20" size={32} />
        </div>
      </div>

      {/* DANGER ZONE - UPDATED CANCELLATION LOGIC */}
      {userPlan !== 'free' && (
        <div className="border border-red-500/10 rounded-3xl p-8 mt-12">
          <h2 className="text-sm font-black text-red-500 uppercase tracking-widest mb-2 flex items-center"><AlertTriangle className="mr-2" size={16} /> Danger Zone</h2>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6 leading-relaxed max-w-lg">
            Canceling your subscription revokes live market access at the end of your billing cycle. You can manage your cancellation securely in the billing portal.
          </p>
          <button 
            onClick={() => window.open(CUSTOMER_PORTAL_URL, '_blank')}
            className="flex items-center px-6 py-3 bg-transparent text-red-500/80 border border-red-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            Cancel Subscription <ExternalLink size={12} className="ml-2" />
          </button>
        </div>
      )}

      {showPricing && userPlan !== 'premium' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-[1200px] bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-6 sm:p-8 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowPricing(false)} className="absolute top-5 right-5 p-2 text-neutral-500 hover:text-neutral-900 dark:text-white bg-neutral-50 dark:bg-[#050505] hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-full transition-colors z-20">
              <X size={16} />
            </button>
            <div className="text-center mb-6 mt-2">
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Select <span className="text-brand-primary">Plan</span></h2>
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">Unlock global market analysis and bypass time delays.</p>
            </div>
            <PricingCards userPlan={userPlan} />
          </div>
        </div>
      )}
    </div>
  )
}
