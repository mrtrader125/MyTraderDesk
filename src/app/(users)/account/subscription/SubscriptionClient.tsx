'use client'

import { useState } from 'react'
import { Shield, Crown, Zap, AlertTriangle, Bookmark, ExternalLink, CreditCard, X } from 'lucide-react'
import PricingCards from '@/components/pricing/PricingCards'

export default function SubscriptionClient({ initialPlan, initialSavedCount }: any) {
  const [userPlan] = useState(initialPlan || 'free')
  const [showPricing, setShowPricing] = useState(false)

  // 🚨 REPLACE WITH YOUR ACTUAL PORTAL
  const CUSTOMER_PORTAL_URL = "https://your-store-name.lemonsqueezy.com/billing"

  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Billing & Access</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">Manage your active tier and billing statements.</p>
      </div>

      {/* DYNAMIC PLAN CARD */}
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-neutral-800 rounded-2xl md:rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] rounded-full pointer-events-none ${userPlan === 'premium' ? 'bg-amber-500/10' : 'bg-brand-primary/5'}`}></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-5">
          <div className="flex-1">
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 block">Active Access Level</span>
            <div className="flex items-center space-x-3">
              {userPlan === 'premium' ? <Crown className="text-amber-500 w-7 h-7" /> : userPlan === 'pro' ? <Zap className="text-brand-primary w-7 h-7" /> : <Shield className="text-blue-500 w-7 h-7" />}
              <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${userPlan === 'premium' ? 'text-amber-500' : userPlan === 'pro' ? 'text-brand-primary' : 'text-blue-500'}`}>
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

      {/* BILLING PORTAL INTEGRATION */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-5">
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

      {/* DANGER ZONE */}
      {userPlan !== 'free' && (
        <div className="border border-red-500/10 rounded-2xl md:rounded-3xl p-5 md:p-8 bg-red-500/[0.02]">
          <h2 className="text-xs md:text-sm font-black text-red-500 uppercase tracking-widest mb-2 flex items-center"><AlertTriangle className="mr-2" size={16} /> Danger Zone</h2>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-5 leading-relaxed max-w-lg">Canceling your subscription revokes live market access at the end of your billing cycle.</p>
          <a href={CUSTOMER_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex px-6 py-3 border border-red-500/20 text-red-500/80 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors items-center">
            Cancel Subscription <ExternalLink size={12} className="ml-2" />
          </a>
        </div>
      )}

      {/* PRICING MODAL */}
      {showPricing && userPlan !== 'premium' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6">
          <div className="relative w-full max-w-[1200px] h-full max-h-[95dvh] bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-4 sm:p-8 shadow-2xl flex flex-col animate-in fade-in">
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