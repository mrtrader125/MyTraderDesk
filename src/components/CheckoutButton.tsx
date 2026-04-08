'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowRight, Loader2 } from 'lucide-react'

interface CheckoutButtonProps {
  billingCycle: 'monthly' | 'annual'
  className?: string
}

export default function CheckoutButton({ billingCycle, className = '' }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)

    try {
      // 1. Get the currently logged-in user
      const { data: { user }, error } = await supabase.auth.getUser()

      // 2. If they somehow aren't logged in, force them to sign up first
      if (error || !user) {
        window.location.href = '/signup'
        return
      }

      // 3. Select the correct Lemon Squeezy Variant ID
      const variantId = billingCycle === 'annual'
        ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_ID
        : process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_ID

      if (!variantId) {
        throw new Error("Missing Lemon Squeezy Variant ID in environment variables.")
      }

      // 🚨 IMPORTANT: Change 'mytraderdesk' below to your actual Lemon Squeezy store slug!
      const storeSlug = 'mytraderdesk' 

      // 4. Construct the secure checkout URL
      // We pass the Supabase user.id as custom data so the webhook can upgrade them!
      const checkoutUrl = `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][user_id]=${user.id}&checkout[email]=${encodeURIComponent(user.email || '')}`

      // 5. Send them to the payment page
      window.location.href = checkoutUrl

    } catch (error) {
      console.error("Checkout error:", error)
      alert("Unable to initiate checkout. Please ensure you are logged in.")
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading}
      className={`inline-flex items-center justify-center px-10 py-4 bg-brand-primary text-black rounded-sm font-black uppercase tracking-widest text-[10px] hover:bg-brand-primary/90 transition-colors shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.2)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>Securely connecting... <Loader2 className="ml-2 w-4 h-4 animate-spin" /></>
      ) : (
        <>Upgrade to Pro <ArrowRight className="ml-2 w-4 h-4" /></>
      )}
    </button>
  )
}
