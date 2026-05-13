import { CreditCard, ExternalLink, ShieldCheck } from 'lucide-react'

export const runtime = 'edge'

export default function BillingPage() {
  // Replace this URL with your actual Lemon Squeezy Customer Portal link
  const CUSTOMER_PORTAL_URL = "https://yourstore.lemonsqueezy.com/billing"

  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Billing & Invoices</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">Manage your payment methods and financial history.</p>
      </div>

      {/* SECURE STATUS CARD */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl md:rounded-3xl p-5 md:p-8 flex items-center justify-between">
        <div className="flex items-start space-x-3 md:space-x-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
            <ShieldCheck className="text-emerald-500 w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <h4 className="text-white text-xs md:text-sm font-black uppercase tracking-tight">Secure Billing Active</h4>
            <p className="text-[9px] md:text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-relaxed mt-1">
              Your payments are processed securely via Lemon Squeezy. <br className="hidden md:block"/>
              We do not store your credit card details on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* PORTAL ACCESS CARD */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 text-center shadow-sm">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-[#111] md:bg-neutral-900 border border-neutral-800 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-5 md:mb-6 shadow-inner">
          <CreditCard className="text-neutral-400 w-5 h-5 md:w-7 md:h-7" />
        </div>
        
        <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight mb-2">Self-Service Portal</h3>
        <p className="text-[9px] md:text-[11px] font-medium text-neutral-500 uppercase tracking-widest max-w-sm mx-auto mb-6 md:mb-8 leading-relaxed px-2">
          Update your payment method, download past invoices, or change your billing cycle directly through our secure partner portal.
        </p>

        {/* 🚨 OPTIMIZED: Swapped button for a 100% Server-Side a-tag */}
        <a 
          href={CUSTOMER_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center space-x-3 w-full max-w-[280px] md:max-w-xs mx-auto py-3.5 md:py-4 bg-white text-black rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <span>Open Billing Portal</span>
          <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* FOOTER NOTE */}
      <p className="text-center text-[8px] md:text-[9px] font-bold text-neutral-700 uppercase tracking-[0.3em] pt-4 md:pt-0">
        MTD Tactical // Financial Operations System
      </p>
    </div>
  )
}
