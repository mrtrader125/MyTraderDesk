'use client'

import { useState } from 'react'
import { CheckCircle2, Zap, Shield, Loader2, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function PricingCards({ userPlan = 'free' }: { userPlan?: string }) {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoadingPlan('PRO')
    
    // 1. Get the Lemon Squeezy Variant ID
    const variantId = isYearly 
      ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_ID 
      : process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_ID

    if (!variantId) {
      alert("Billing configuration is missing. Ensure you added the correct IDs to your .env.")
      setLoadingPlan(null)
      return
    }

    try {
      // 2. Get the currently logged-in user
      const { data: { user }, error } = await supabase.auth.getUser()

      // 3. If they aren't logged in, redirect to signup
      if (error || !user) {
        window.location.href = '/signup'
        return
      }

      // 4. Construct the secure checkout URL with their Supabase ID attached
      const storeSlug = 'mytraderdesk' 
      const checkoutUrl = `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][user_id]=${user.id}&checkout[email]=${encodeURIComponent(user.email || '')}`

      // 5. Send them directly to Lemon Squeezy
      window.location.href = checkoutUrl

    } catch (error) {
      console.error(error)
      alert("Failed to initialize secure checkout.")
      setLoadingPlan(null)
    }
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col items-center">
      {/* BILLING TOGGLE */}
      <div className="flex items-center gap-2 mb-10 p-1.5 bg-[#000000] border border-neutral-800 rounded-full shadow-inner">
        <button onClick={() => setIsYearly(false)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!isYearly ? 'bg-neutral-800 text-white shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}>Monthly</button>
        <button onClick={() => setIsYearly(true)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isYearly ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30 shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}>
          Annually <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[8px] tracking-wider">SAVE 16%</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        
        {/* FREE / DEMO TIER CARD */}
        <div className="bg-[#000000] border border-neutral-800 rounded-[1.5rem] p-6 md:p-8 flex flex-col relative overflow-hidden shadow-lg">
          <div className="p-3 bg-neutral-800/50 text-neutral-400 rounded-xl w-fit mb-4"><Shield size={20} /></div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1.5">Terminal Demo</h3>
          <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-6 leading-relaxed">Take a risk-free tour of the terminal interface and see the operational protocol in action.</p>
          <div className="mb-6">
            <span className="text-3xl font-black text-white">$0</span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1.5">/ forever</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-neutral-500 mr-2.5 shrink-0" /> Platform UI walkthrough
            </li>
            <li className="flex items-center text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-neutral-500 mr-2.5 shrink-0" /> Read-only historical setups
            </li>
            <li className="flex items-center text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-neutral-500 mr-2.5 shrink-0" /> Journaling mechanism preview
            </li>
            <li className="flex items-center text-[10px] font-bold text-neutral-600 uppercase tracking-widest opacity-60">
              <Lock size={14} className="text-neutral-600 mr-2.5 shrink-0" /> Live Floor trade validation
            </li>
            <li className="flex items-center text-[10px] font-bold text-neutral-600 uppercase tracking-widest opacity-60">
              <Lock size={14} className="text-neutral-600 mr-2.5 shrink-0" /> Daily 4H & LTF chart updates
            </li>
            <li className="flex items-center text-[10px] font-bold text-neutral-600 uppercase tracking-widest opacity-60">
              <Lock size={14} className="text-neutral-600 mr-2.5 shrink-0" /> Pre-outcome behavioral journaling
            </li>
          </ul>

          <button disabled className="w-full py-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-[10px] font-black uppercase tracking-widest transition-all">
            Current Plan
          </button>
        </div>

        {/* PROFESSIONAL CARD */}
        <div className="bg-[#000000] border border-blue-500/40 rounded-[1.5rem] p-6 md:p-8 flex flex-col relative overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.15)] hover:border-blue-500 transition-colors">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl w-fit mb-4 shadow-[0_0_15px_rgba(37,99,235,0.2)]"><Zap size={20} /></div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1.5">Pro Operator</h3>
          <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mb-6 leading-relaxed">The complete institutional-grade toolkit and behavioral enforcement system.</p>
          
          <div className="mb-6">
            <span className="text-3xl font-black text-blue-500">${isYearly ? '500' : '50'}</span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1.5">/ {isYearly ? 'yr' : 'mo'}</span>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> Guided routine & system setup
            </li>
            <li className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> Sunday macro & invalidation levels
            </li>
            <li className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> Personal Vault for pair tracking
            </li>
            <li className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> Daily 4H & LTF chart updates
            </li>
            <li className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> Live Floor trade validation
            </li>
            <li className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> Strict mechanical execution rules
            </li>
            <li className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> Pre-outcome behavioral journaling
            </li>
            <li className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> Saturday data-driven reviews
            </li>
            <li className="flex items-center text-[10px] font-bold text-white uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-blue-500 mr-2.5 shrink-0" /> Active mentor accountability
            </li>
          </ul>

          <button 
            onClick={handleCheckout} 
            disabled={loadingPlan !== null || userPlan === 'pro'} 
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 relative z-10"
          >
            {loadingPlan === 'PRO' ? <Loader2 size={16} className="animate-spin mx-auto" /> : userPlan === 'pro' ? 'Current Plan' : 'Upgrade to Professional'}
          </button>
        </div>

      </div>
    </div>
  )
}
