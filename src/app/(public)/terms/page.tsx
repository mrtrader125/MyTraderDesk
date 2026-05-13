import { Metadata } from 'next'
import { ShieldCheck, Scale, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | MyTraderDesk',
  description: 'Operating rules and user agreement for the MyTraderDesk terminal.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <Scale className="mx-auto text-blue-500 mb-6" size={48} />
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Terms of <span className="text-blue-500">Service</span></h1>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Last Updated: March 2026</p>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 md:p-12 space-y-8 text-sm leading-relaxed text-neutral-400">
          <section>
            <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> 1. Acceptance of Terms
            </h2>
            <p>By accessing the MyTraderDesk platform, provided by Sentinel Vortex, you agree to be bound by these Terms of Service. If you do not agree to these terms, you are strictly prohibited from using the terminal.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> 2. No Investment Advice
            </h2>
            <p>All content published on MyTraderDesk is for informational and educational purposes only. We are not financial advisors. Any trade execution you perform based on our analysis is done at your own risk.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span> 3. Subscription & Billing
            </h2>
            <p>Payments are handled securely via Lemon Squeezy. Subscriptions auto-renew unless cancelled. Refunds are governed by our internal policy and are typically not provided for partial billing cycles.</p>
          </section>
        </div>
      </div>
    </div>
  )
}