import PricingCards from '@/components/pricing/PricingCards'
import { CreditCard } from 'lucide-react'

export default function BillingSettingsPage() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      
      <header className="border-b border-card-border pb-8">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">
          Terminal <span className="text-brand-primary">Billing</span>
        </h1>
        <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
          <CreditCard size={14} className="text-brand-primary" /> 
          Manage Subscriptions & Clearance
        </p>
      </header>

      <section className="pt-8">
        <PricingCards />
      </section>

    </div>
  )
}
