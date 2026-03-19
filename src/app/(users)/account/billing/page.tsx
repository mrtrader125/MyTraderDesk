'use client'

import { CreditCard, ExternalLink, ShieldCheck } from 'lucide-react'

export default function BillingPage() {
  // Replace this URL with your actual Lemon Squeezy Customer Portal link
  const CUSTOMER_PORTAL_URL = "https://yourstore.lemonsqueezy.com/billing"

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-1">Billing & Invoices</h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Manage your payment methods and financial history.</p>
      </div>

      {/* SECURE STATUS CARD */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 flex items-center justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <ShieldCheck className="text-emerald-500" size={20} />
          </div>
          <div>
            <h4 className="text-neutral-900 dark:text-white text-sm font-black uppercase tracking-tight">Secure Billing Active</h4>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-relaxed mt-1">
              Your payments are processed securely via Lemon Squeezy. <br/>
              We do not store your credit card details on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* PORTAL ACCESS CARD */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 text-center">
        <div className="w-16 h-16 bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CreditCard className="text-neutral-400" size={28} />
        </div>
        
        <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-2">Self-Service Portal</h3>
        <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest max-w-sm mx-auto mb-8 leading-relaxed">
          Update your payment method, download past invoices, or change your billing cycle directly through our secure partner portal.
        </p>

        <button 
          onClick={() => window.open(CUSTOMER_PORTAL_URL, '_blank')}
          className="group flex items-center justify-center space-x-3 w-full max-w-xs mx-auto py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-xl"
        >
          <span>Open Billing Portal</span>
          <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* FOOTER NOTE */}
      <p className="text-center text-[9px] font-bold text-neutral-700 uppercase tracking-[0.3em]">
        MTD Tactical // Financial Operations System
      </p>
    </div>
  )
}
