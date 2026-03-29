'use client'

import { useState } from 'react'
import { CheckCircle2, Zap, Shield, Loader2 } from 'lucide-react'

export default function PricingCards({ userPlan = 'free' }: { userPlan?: string }) {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleCheckout = async (planType: 'PRO') => {
    setLoadingPlan(planType)
    
    // We only have one paid tier now: PRO
    const variantId = isYearly 
      ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_ID 
      : process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_ID

    if (!variantId) {
      alert("Billing configuration is missing. Ensure you added the correct IDs to your .env.local")
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
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* BILLING TOGGLE */}
      <div className="flex items-center gap-2 mb-10 p-1.5 bg-[#050505] border border-neutral-800 rounded-full shadow-inner">
        <button 
          onClick={() => setIsYearly(false)} 
          className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!isYearly ? 'bg-neutral-800 text-white shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          Monthly
        </button>
        <button 
          onClick={() => setIsYearly(true)} 
          className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isYearly ? 'bg-blue-600/20 text-blue-500 border border-blue-500/30 shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          Yearly <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[8px] tracking-wider">SAVE 14%</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        {/* FREE CARD (THE LOBBY) */}
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-[1.5rem] p-6 md:p-8 flex flex-col relative overflow-hidden transition-colors shadow-lg">
          <div className="p-3 bg-neutral-800/50 text-neutral-400 rounded-xl w-fit mb-4">
            <Shield size={20} />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1.5">The Lobby</h3>
          <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-6 leading-relaxed">Basic platform access.</p>
          
          <div className="mb-6">
            <span className="text-3xl font-black text-white">$0</span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1.5">/ forever</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            {['Delayed Analysis Feed', 'Read-Only Floor Access', 'Basic Playbook Access'].map((f, i) => (
              <li key={i} className="flex items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-neutral-600 mr-2.5 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          
          <button 
            disabled 
            className="w-full py-3.5 rounded-xl bg-[#111] border border-neutral-800 text-neutral-500 text-[10px] font-black uppercase tracking-widest cursor-not-allowed transition-all"
          >
            {userPlan === 'free' ? 'Current Plan' : 'Free Tier'}
          </button>
        </div>

        {/* PRO CARD (ALL ACCESS) */}
        <div className="bg-[#050505] border border-blue-500/40 rounded-[1.5rem] p-6 md:p-8 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:border-blue-500 transition-colors md:-translate-y-2">
          {/* Glowing Top Edge */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80"></div>
          
          {/* Badge */}
          <div className="absolute -top-4 right-6 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
            All Access
          </div>
          
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl w-fit mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Zap size={20} />
          </div>
          
          <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1.5">Pro Terminal</h3>
          <p className="text-[9px] text-blue-400/80 font-bold uppercase tracking-widest mb-6 leading-relaxed">Full institutional analysis.</p>
          
          <div className="mb-6">
            <span className="text-3xl font-black text-blue-500">${isYearly ? '299' : '29'}</span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1.5">/ {isYearly ? 'yr' : 'mo'}</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            {['Real-time Global Markets', 'Full Community Voting Rights', 'Context Debate Access', 'Priority Live Squawk'].map((f, i) => (
              <li key={i} className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          
          <button 
            onClick={() => handleCheckout('PRO')} 
            disabled={loadingPlan !== null || userPlan === 'pro'} 
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 active:scale-[0.98]"
          >
            {loadingPlan === 'PRO' ? <Loader2 size={16} className="animate-spin mx-auto" /> : userPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
          </button>
        </div>

      </div>
    </div>
  )
}
