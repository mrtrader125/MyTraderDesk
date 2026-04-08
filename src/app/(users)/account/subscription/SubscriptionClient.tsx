'use client'

import { useState } from 'react'
import { Shield, Crown, Zap, AlertTriangle, Activity, Bookmark, X, ExternalLink } from 'lucide-react'
import PricingCards from '@/components/pricing/PricingCards'

// 🚨 INJECTED VIA SERVER PROPS
export default function SubscriptionClient({ initialPlan, initialSavedCount }: any) {
  // State is instantly populated from the server
  const [userPlan] = useState(initialPlan || 'free')
  const [savedCount] = useState(initialSavedCount || 0)
  const [showPricing, setShowPricing] = useState(false)

  // REPLACE THIS WITH YOUR ACTUAL LEMON SQUEEZY STORE URL
  const CUSTOMER_PORTAL_URL = "https://your-store-name.lemonsqueezy.com/billing"

  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Subscription</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">Manage your active plan and platform access.</p>
      </div>

      {/* DYNAMIC CURRENT PLAN CARD */}
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-neutral-800 rounded-2xl md:rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className={`absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 blur-[80px] md:blur-[100px] rounded-full pointer-events-none ${userPlan === 'premium' ? 'bg-amber-500/10' : 'bg-brand-primary/5'}`}></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-5 md:gap-6">
          <div className="flex-1">
            <span className="text-[9px] md:text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 block">Active Plan</span>
            <div className="flex items-center space-x-2 md:space-x-3">
              {userPlan === 'premium' ? <Crown className="text-amber-500 w-6 h-6 md:w-7 md:h-7" /> : userPlan === 'pro' ? <Zap className="text-brand-primary w-6 h-6 md:w-7 md:h-7" /> : userPlan === 'essential' ? <Shield className="text-blue-500 w-6 h-6 md:w-7 md:h-7" /> : <Zap className="text-neutral-500 w-6 h-6 md:w-7 md:h-7" />}
              <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${userPlan === 'premium' ? 'text-amber-500' : userPlan === 'pro' ? 'text-brand-primary' : userPlan === 'essential' ? 'text-blue-500' : 'text-white'}`}>
                {userPlan === 'premium' ? 'Gold Premium' : `${userPlan} Tier`}
              </h2>
            </div>
            <p className="text-[10px] md:text-xs font-medium text-neutral-400 mt-2 md:mt-3 max-w-md leading-relaxed">
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
              className={`w-full md:w-auto px-8 py-3.5 md:py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] whitespace-nowrap shrink-0 flex justify-center`}
            >
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[9px] md:text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Saved Setups</span>
            <span className="text-xl md:text-2xl font-black text-white">{savedCount}</span>
          </div>
          <Bookmark className="text-amber-500 opacity-20 absolute right-4 bottom-4 md:relative md:opacity-30 md:right-auto md:bottom-auto w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110" />
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-[9px] md:text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Network Status</span>
            <span className="text-[10px] md:text-sm font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Operational</span>
          </div>
          <Activity className="text-emerald-500 opacity-20 absolute right-4 bottom-4 md:relative md:opacity-30 md:right-auto md:bottom-auto w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110" />
        </div>
      </div>

      {/* DANGER ZONE - UPDATED CANCELLATION LOGIC */}
      {userPlan !== 'free' && (
        <div className="border border-red-500/10 rounded-2xl md:rounded-3xl p-5 md:p-8 mt-8 md:mt-12 bg-red-500/[0.02]">
          <h2 className="text-xs md:text-sm font-black text-red-500 uppercase tracking-widest mb-2 flex items-center"><AlertTriangle className="mr-2" size={16} /> Danger Zone</h2>
          <p className="text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-5 md:mb-6 leading-relaxed max-w-lg">
            Canceling your subscription revokes live market access at the end of your billing cycle. You can manage your cancellation securely in the billing portal.
          </p>
          
          {/* 🚨 OPTIMIZED: Replaced button with standard HTML anchor tag for faster JS-free rendering */}
          <a 
            href={CUSTOMER_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-transparent text-red-500/80 border border-red-500/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            Cancel Subscription <ExternalLink size={12} className="ml-2" />
          </a>
        </div>
      )}

      {/* FULL SCREEN PRICING MODAL */}
      {showPricing && userPlan !== 'premium' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6">
          <div className="relative w-full max-w-[1200px] h-full max-h-[95dvh] bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-[2rem] p-4 sm:p-8 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="shrink-0 text-center mb-4 md:mb-6 mt-2 relative">
              <button onClick={() => setShowPricing(false)} className="absolute top-0 right-0 md:-top-4 md:-right-4 p-2 text-neutral-500 hover:text-white bg-[#111] border border-neutral-800 rounded-full transition-colors z-20 shadow-lg">
                <X size={16} />
              </button>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic">Select <span className="text-blue-500">Plan</span></h2>
              <p className="text-neutral-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1.5 px-4">Unlock global market analysis and bypass time delays.</p>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
              <PricingCards userPlan={userPlan} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
