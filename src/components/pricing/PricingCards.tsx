'use client'

import { useState } from 'react'
import { CheckCircle2, Zap, Shield, Loader2 } from 'lucide-react'

export default function PricingCards({ userPlan = 'free' }: { userPlan?: string }) {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleCheckout = async (planType: 'ESSENTIAL' | 'PRO') => {
    setLoadingPlan(planType)
    
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
    <div className="w-full max-w-[760px] mx-auto flex flex-col items-center">
      {/* TOGGLE SWITCH - SCALED DOWN */}
      <div className="flex items-center gap-2 mb-8 p-1.5 bg-[#050505] border border-neutral-800 rounded-full shadow-inner">
        <button 
          onClick={() => setIsYearly(false)}
          className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!isYearly ? 'bg-neutral-800 text-white shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          Monthly
        </button>
        <button 
          onClick={() => setIsYearly(true)}
          className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isYearly ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30 shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          Yearly <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[8px] tracking-wider">SAVE 16%</span>
        </button>
      </div>

      {/* CARDS - COMPACT GAP & WIDTH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        
        {/* ESSENTIAL CARD */}
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-[1.5rem] p-6 md:p-7 flex flex-col relative overflow-hidden group hover:border-blue-500/40 transition-colors shadow-lg">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl w-fit mb-4">
            <Shield size={20} />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1.5">Essential</h3>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-5 leading-relaxed">Standard market clearance & core algorithms.</p>
          
          <div className="mb-6">
            <span className="text-3xl font-black text-white">${isYearly ? '49.99' : '4.99'}</span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1.5">/ {isYearly ? 'yr' : 'mo'}</span>
          </div>

          <ul className="space-y-3.5 mb-8 flex-1">
            {['Core Forex & Gold Markets', 'Standard Analysis Delay', 'Basic Position Sizing', 'Email Support'].map((feature, i) => (
              <li key={i} className="flex items-center text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> {feature}
              </li>
            ))}
          </ul>

          <button 
            onClick={() => handleCheckout('ESSENTIAL')}
            disabled={loadingPlan !== null || userPlan === 'essential'}
            className="w-full py-3.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-600 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loadingPlan === 'ESSENTIAL' ? <Loader2 size={16} className="animate-spin" /> : userPlan === 'essential' ? 'Current Plan' : 'Get Essential'}
          </button>
        </div>

        {/* PRO CARD */}
        <div className="bg-[#050505] border border-brand-primary/30 rounded-[1.5rem] p-6 md:p-7 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.05)] hover:border-brand-primary/60 transition-colors">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50"></div>
          
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl w-fit mb-4 shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.2)]">
            <Zap size={20} />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1.5">Pro Terminal</h3>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-5 leading-relaxed">Maximum clearance. All premium modules.</p>
          
          <div className="mb-6">
            <span className="text-3xl font-black text-brand-primary">${isYearly ? '99.99' : '9.99'}</span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1.5">/ {isYearly ? 'yr' : 'mo'}</span>
          </div>

          <ul className="space-y-3.5 mb-8 flex-1">
            {['All Essential Features', 'Premium Exotics & Crypto', 'Zero-Delay Intelligence', 'Advanced Scalping Arrays', 'Priority 24/7 Support'].map((feature, i) => (
              <li key={i} className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-brand-primary mr-2.5 shrink-0" /> {feature}
              </li>
            ))}
          </ul>

          <button 
            onClick={() => handleCheckout('PRO')}
            disabled={loadingPlan !== null}
            className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)] disabled:opacity-50"
          >
            {loadingPlan === 'PRO' ? <Loader2 size={16} className="animate-spin" /> : 'Upgrade to Pro'}
          </button>
        </div>

      </div>
    </div>
  )
}
