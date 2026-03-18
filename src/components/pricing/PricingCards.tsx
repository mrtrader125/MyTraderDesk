'use client'

import { useState } from 'react'
import { CheckCircle2, Zap, Shield, Loader2, Crown } from 'lucide-react'

export default function PricingCards({ userPlan = 'free' }: { userPlan?: string }) {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleCheckout = async (planType: 'ESSENTIAL' | 'PRO' | 'PREMIUM') => {
    setLoadingPlan(planType)
    
    const variantId = planType === 'PREMIUM'
      ? (isYearly ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_YEARLY_ID : process.env.NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_MONTHLY_ID)
      : planType === 'PRO' 
      ? (isYearly ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_ID : process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_ID)
      : (isYearly ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_ESSENTIAL_YEARLY_ID : process.env.NEXT_PUBLIC_LEMONSQUEEZY_ESSENTIAL_MONTHLY_ID)

    if (!variantId) {
      alert("Billing configuration is missing. Ensure you added Premium IDs to your .env.local")
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
      if (data.url) window.location.href = data.url
      else throw new Error(data.error)
    } catch (error) {
      console.error(error)
      alert("Failed to initialize secure checkout.")
      setLoadingPlan(null)
    }
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto flex flex-col items-center">
      <div className="flex items-center gap-2 mb-10 p-1.5 bg-[#050505] border border-neutral-800 rounded-full shadow-inner">
        <button onClick={() => setIsYearly(false)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!isYearly ? 'bg-neutral-800 text-white shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}>Monthly</button>
        <button onClick={() => setIsYearly(true)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isYearly ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30 shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}>
          Yearly <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[8px] tracking-wider">SAVE 16%</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        
        {/* ESSENTIAL CARD */}
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-[1.5rem] p-6 md:p-8 flex flex-col relative overflow-hidden hover:border-blue-500/40 transition-colors shadow-lg">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl w-fit mb-4"><Shield size={20} /></div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1.5">Essential</h3>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-6 leading-relaxed">Forex & Commodities.</p>
          <div className="mb-6">
            <span className="text-3xl font-black text-white">${isYearly ? '49.99' : '4.99'}</span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1.5">/ {isYearly ? 'yr' : 'mo'}</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {['Forex & Commodity Markets', '1H to Monthly Timeframes', 'Updated before NY Session', 'Email Support'].map((f, i) => (
              <li key={i} className="flex items-center text-[10px] font-bold text-neutral-300 uppercase tracking-widest"><CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> {f}</li>
            ))}
          </ul>
          <button onClick={() => handleCheckout('ESSENTIAL')} disabled={loadingPlan !== null || userPlan === 'essential'} className="w-full py-3.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
            {loadingPlan === 'ESSENTIAL' ? <Loader2 size={16} className="animate-spin mx-auto" /> : userPlan === 'essential' ? 'Current Plan' : 'Get Essential'}
          </button>
        </div>

        {/* PRO CARD */}
        <div className="bg-[#050505] border border-brand-primary/40 rounded-[1.5rem] p-6 md:p-8 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.1)] hover:border-brand-primary transition-colors">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-80"></div>
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl w-fit mb-4 shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.2)]"><Zap size={20} /></div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1.5">Professional</h3>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-6 leading-relaxed">Crypto, Indices & Stocks.</p>
          <div className="mb-6">
            <span className="text-3xl font-black text-brand-primary">${isYearly ? '99.99' : '9.99'}</span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1.5">/ {isYearly ? 'yr' : 'mo'}</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {['All Essential Features', 'Crypto, Indices & Stocks', 'On-Spot Live Setups', 'Priority Discord/Feed'].map((f, i) => (
              <li key={i} className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest"><CheckCircle2 size={14} className="text-brand-primary mr-2.5 shrink-0" /> {f}</li>
            ))}
          </ul>
          <button onClick={() => handleCheckout('PRO')} disabled={loadingPlan !== null || userPlan === 'pro'} className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.4)] disabled:opacity-50">
            {loadingPlan === 'PRO' ? <Loader2 size={16} className="animate-spin mx-auto" /> : userPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* GOLD PREMIUM CARD */}
        <div className="bg-[#0a0a0a] border border-amber-500/40 rounded-[1.5rem] p-6 md:p-8 flex flex-col relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.08)] hover:border-amber-500 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none"></div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-4"><Crown size={20} /></div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1.5">Gold Premium</h3>
          <p className="text-[9px] text-amber-500/70 font-bold uppercase tracking-widest mb-6 leading-relaxed">The ultimate day-trader terminal.</p>
          <div className="mb-6">
            <span className="text-3xl font-black text-amber-500">${isYearly ? '1990.00' : '199.00'}</span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1.5">/ {isYearly ? 'yr' : 'mo'}</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {['GOLD TERMINAL Access', 'Fundamentals & Sentiment', 'Scalping Timeframes (1m-30m)', 'Behind-the-Setups Logic'].map((f, i) => (
              <li key={i} className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest"><CheckCircle2 size={14} className="text-amber-500 mr-2.5 shrink-0" /> {f}</li>
            ))}
          </ul>
          <button onClick={() => handleCheckout('PREMIUM')} disabled={loadingPlan !== null || userPlan === 'premium'} className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50">
            {loadingPlan === 'PREMIUM' ? <Loader2 size={16} className="animate-spin mx-auto" /> : userPlan === 'premium' ? 'Current Plan' : 'Get Gold Premium'}
          </button>
        </div>

      </div>
    </div>
  )
}
