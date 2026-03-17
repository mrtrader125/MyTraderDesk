'use client'

import { useState } from 'react'
import { CheckCircle2, Zap, Shield, Loader2 } from 'lucide-react'

// 👇 NEW: Accept the userPlan prop here
export default function PricingCards({ userPlan = 'free' }: { userPlan?: string }) {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleCheckout = async (planType: 'ESSENTIAL' | 'PRO') => {
    setLoadingPlan(planType)
    
    // Resolve the correct ID from .env based on the toggle state
    const variantId = planType === 'PRO' 
      ? (isYearly ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_ID : process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_ID)
      : (isYearly ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_ESSENTIAL_YEARLY_ID : process.env.NEXT_PUBLIC_LEMONSQUEEZY_ESSENTIAL_MONTHLY_ID)

    if (!variantId) {
      alert("Billing configuration is missing. Check your .env.local variables.")
      setLoadingPlan(null)
      return
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId })
      })
      
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error(error)
      alert("Failed to initialize secure checkout.")
      setLoadingPlan(null)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* TOGGLE SWITCH */}
      <div className="flex items-center gap-3 mb-12 p-1.5 bg-app-bg border border-card-border rounded-full shadow-inner">
        <button 
          onClick={() => setIsYearly(false)}
          className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!isYearly ? 'bg-card-border text-white shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          Monthly
        </button>
        <button 
          onClick={() => setIsYearly(true)}
          className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isYearly ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30 shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          Yearly <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[9px]">SAVE 16%</span>
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        
        {/* ESSENTIAL CARD */}
        <div className="bg-app-bg border border-card-border rounded-[2rem] p-8 flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mb-6">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Essential</h3>
          <p className="text-xs text-neutral-400 font-medium mb-6">Standard market clearance and core trading algorithms.</p>
          
          <div className="mb-8">
            <span className="text-4xl font-black text-white">${isYearly ? '49.99' : '4.99'}</span>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-2">/ {isYearly ? 'year' : 'month'}</span>
          </div>

          <ul className="space-y-4 mb-10 flex-1">
            {['Core Forex & Gold Markets', 'Standard Analysis Delay', 'Basic Position Sizing', 'Email Support'].map((feature, i) => (
              <li key={i} className="flex items-center text-sm font-medium text-neutral-300">
                <CheckCircle2 size={16} className="text-blue-500 mr-3 shrink-0" /> {feature}
              </li>
            ))}
          </ul>

          <button 
            onClick={() => handleCheckout('ESSENTIAL')}
            // 👇 NEW: Disable if they are already on essential
            disabled={loadingPlan !== null || userPlan === 'essential'}
            className="w-full py-4 rounded-xl bg-card-border hover:bg-neutral-700 text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loadingPlan === 'ESSENTIAL' ? <Loader2 size={18} className="animate-spin" /> : userPlan === 'essential' ? 'Current Plan' : 'Get Essential'}
          </button>
        </div>

        {/* PRO CARD */}
        <div className="bg-card-bg border border-brand-primary/30 rounded-[2rem] p-8 flex flex-col relative overflow-hidden shadow-brand-glow hover:border-brand-primary transition-colors">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent"></div>
          
          <div className="p-4 bg-brand-primary/10 text-brand-primary rounded-2xl w-fit mb-6 shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.3)]">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Pro Terminal</h3>
          <p className="text-xs text-neutral-400 font-medium mb-6">Maximum clearance. All premium modules and real-time feeds.</p>
          
          <div className="mb-8">
            <span className="text-4xl font-black text-brand-primary">${isYearly ? '99.99' : '9.99'}</span>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-2">/ {isYearly ? 'year' : 'month'}</span>
          </div>

          <ul className="space-y-4 mb-10 flex-1">
            {['All Essential Features', 'Premium Exotics & Crypto', 'Zero-Delay Intelligence', 'Advanced Scalping Arrays', 'Priority 24/7 Support'].map((feature, i) => (
              <li key={i} className="flex items-center text-sm font-medium text-white">
                <CheckCircle2 size={16} className="text-brand-primary mr-3 shrink-0" /> {feature}
              </li>
            ))}
          </ul>

          <button 
            onClick={() => handleCheckout('PRO')}
            disabled={loadingPlan !== null}
            className="w-full py-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.4)] disabled:opacity-50"
          >
            {loadingPlan === 'PRO' ? <Loader2 size={18} className="animate-spin" /> : 'Upgrade to Pro'}
          </button>
        </div>

      </div>
    </div>
  )
}
