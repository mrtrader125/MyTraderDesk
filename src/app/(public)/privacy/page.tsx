import { Metadata } from 'next'
import { Lock, EyeOff, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | MyTraderDesk',
  description: 'How we protect your data and maintain terminal security.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <Lock className="mx-auto text-emerald-500 mb-6" size={48} />
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Privacy <span className="text-emerald-500">Protocol</span></h1>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Data Protection Standard 2026</p>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 md:p-12 space-y-8 text-sm leading-relaxed text-neutral-400">
          <section>
            <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center">
              <Shield className="text-emerald-500 mr-3" size={16} /> Data Collection
            </h2>
            <p>We collect only the essential data required to provide terminal access, including your email, name, and subscription status. We use activity logs to improve our market analysis output.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center">
              <EyeOff className="text-emerald-500 mr-3" size={16} /> Financial Security
            </h2>
            <p>MyTraderDesk does not store credit card information. All transactions are processed through Lemon Squeezy, ensuring your financial data never touches our internal servers.</p>
          </section>
        </div>
      </div>
    </div>
  )
}