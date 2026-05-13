'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import { Shield, Crown, Zap, AlertTriangle, Bookmark, ExternalLink, CreditCard, X, Activity } from 'lucide-react'
import PricingCards from '@/components/pricing/PricingCards'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const fetchSubData = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single()
  return { plan: profile?.plan?.toLowerCase() || 'free' }
}

export default function SubscriptionClient() {
  const { data, isLoading } = useSWR('account_subscription', fetchSubData, { dedupingInterval: 60000 })
  const [showPricing, setShowPricing] = useState(false)

  // 🚨 REPLACE WITH YOUR ACTUAL PORTAL
  const CUSTOMER_PORTAL_URL = "https://your-store-name.lemonsqueezy.com/billing"

  if (isLoading || !data) {
    return (
      <div className="max-w-3xl space-y-6 md:space-y-8 relative">
        <div><div className="h-6 md:h-7 w-32 bg-[#000000] border border-neutral-800 rounded-md animate-pulse mb-2"></div><div className="h-3 md:h-3.5 w-64 bg-[#000000] border border-neutral-800 rounded-md animate-pulse"></div></div>
        <div className="bg-[#000000] border border-neutral-800 rounded-2xl md:rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm"><div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-5 md:gap-6"><div className="flex-1 w-full"><div className="h-2.5 w-20 bg-neutral-900 rounded animate-pulse mb-3"></div><div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4"><div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-neutral-900 animate-pulse shrink-0"></div><div className="h-6 md:h-8 w-40 md:w-48 bg-neutral-900 rounded animate-pulse"></div></div><div className="space-y-2 max-w-md"><div className="h-2.5 md:h-3 w-full bg-neutral-900 rounded animate-pulse"></div><div className="h-2.5 md:h-3 w-3/4 bg-neutral-900 rounded animate-pulse"></div></div></div><div className="w-full md:w-40 h-12 md:h-14 bg-neutral-900 rounded-xl animate-pulse shrink-0"></div></div></div>
        <div className="grid grid-cols-2 gap-3 md:gap-4"><div className="bg-[#000000] border border-neutral-800 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm"><div className="w-full"><div className="h-2.5 w-20 bg-neutral-900 rounded animate-pulse mb-2"></div><div className="h-6 md:h-8 w-12 bg-neutral-900 rounded animate-pulse"></div></div><Bookmark className="text-neutral-800 absolute right-4 bottom-4 md:relative md:right-auto md:bottom-auto w-8 h-8 md:w-10 md:h-10" /></div><div className="bg-[#000000] border border-neutral-800 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm"><div className="w-full"><div className="h-2.5 w-24 bg-neutral-900 rounded animate-pulse mb-2"></div><div className="h-4 w-20 bg-neutral-900 rounded animate-pulse mt-2"></div></div><Activity className="text-neutral-800 absolute right-4 bottom-4 md:relative md:right-auto md:bottom-auto w-8 h-8 md:w-10 md:h-10" /></div></div>
      </div>
    )
  }

  const userPlan = data.plan

  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Billing & Access</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">Manage your active tier and billing statements.</p>
      </div>

      <div className="bg-gradient-to-br from-[#000000] to-[#050505] border border-neutral-800 rounded-2xl md:rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] rounded-full pointer-events-none ${userPlan === 'premium' ? 'bg-amber-500/10' : 'bg-blue-600/5'}`}></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-5">
          <div className="flex-1">
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 block">Active Access Level</span>
            <div className="flex items-center space-x-3">
              {userPlan === 'premium' ? <Crown className="text-amber-500 w-7 h-7" /> : userPlan === 'pro' ? <Zap className="text-blue-500 w-7 h-7" /> : <Shield className="text-neutral-500 w-7 h-7" />}
              <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${userPlan === 'premium' ? 'text-amber-500' : userPlan === 'pro' ? 'text-blue-500' : 'text-neutral-300'}`}>
                {userPlan === 'premium' ? 'Gold Premium' : `${userPlan} Tier`}
              </h2>
            </div>
            <p className="text-[10px] md:text-xs font-medium text-neutral-400 mt-3 max-w-md leading-relaxed">
              {userPlan === 'premium' ? 'Ultimate platform access granted. Full unlock for Gold dashboard.' : userPlan === 'pro' ? 'Maximum standard access. Full unlock for all global swing markets.' : 'Limited free access. Upgrade your plan to bypass time delays.'}
            </p>
          </div>
          {userPlan !== 'premium' && (
            <button onClick={() => setShowPricing(true)} className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shrink-0">
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#000000] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-5">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-[#111] border border-neutral-800 rounded-xl shrink-0"><CreditCard className="text-neutral-400 w-6 h-6" /></div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Financial Portal</h3>
            <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest mt-1 max-w-sm leading-relaxed">Update payment methods, download invoices, and manage billing cycles securely via LemonSqueezy.</p>
          </div>
        </div>
        <a href={CUSTOMER_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="px-6 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center shrink-0">
          Open Portal <ExternalLink size={14} className="ml-2" />
        </a>
      </div>

      {userPlan !== 'free' && (
        <div className="border border-red-500/10 rounded-2xl md:rounded-3xl p-5 md:p-8 bg-red-500/[0.02]">
          <h2 className="text-xs md:text-sm font-black text-red-500 uppercase tracking-widest mb-2 flex items-center"><AlertTriangle className="mr-2" size={16} /> Danger Zone</h2>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-5 leading-relaxed max-w-lg">Canceling your subscription revokes live market access at the end of your billing cycle.</p>
          <a href={CUSTOMER_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex px-6 py-3 border border-red-500/20 text-red-500/80 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors items-center">
            Cancel Subscription <ExternalLink size={12} className="ml-2" />
          </a>
        </div>
      )}

      {showPricing && userPlan !== 'premium' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6">
          <div className="relative w-full max-w-[1200px] h-full max-h-[95dvh] bg-[#000000] border border-neutral-800 rounded-2xl p-4 sm:p-8 shadow-2xl flex flex-col animate-in fade-in">
            <button onClick={() => setShowPricing(false)} className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white bg-[#111] rounded-full z-20"><X size={16} /></button>
            <div className="shrink-0 text-center mb-6 mt-2">
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic">Select <span className="text-blue-500">Plan</span></h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4"><PricingCards userPlan={userPlan} /></div>
          </div>
        </div>
      )}
    </div>
  )
}
