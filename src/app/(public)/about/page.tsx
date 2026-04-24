import { Metadata } from 'next'
import Link from 'next/link'
import { Target, Shield, Activity, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Sentinel Vortex | MyTraderDesk',
  description: 'We built a digital trading floor to give solo operators the confluence, confidence, and structured analysis they need to execute without hesitation.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-6">
            The <span className="text-blue-500">Philosophy</span>
          </h1>
          <p className="text-xl text-neutral-400 leading-relaxed">
            Amateurs execute constantly and analyze rarely. Professionals analyze deeply and execute selectively.
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden space-y-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4 text-white">Our Story</h2>
            <p className="text-neutral-400 leading-relaxed">
              We spent years mastering the markets. We learned the strategies, understood the technicals, and knew exactly what we were supposed to do. But despite having the knowledge, we were still struggling to stay consistent. The problem wasn't a lack of skill; it was human nature. We would get overconfident. As the weeks dragged on, the strict rules we set for ourselves would slowly slip from our minds. We couldn't actively notice it happening, but those small lapses in discipline were destroying our profitability. We realized that knowing everything wasn't enough if we couldn't execute it perfectly every single day.
            </p>
          </div>

          <div className="relative z-10">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4 text-white">The Shift to a Systematic Floor</h2>
            <p className="text-neutral-400 leading-relaxed">
              We decided to completely change how we operated. We looked at how institutional professionals work—they don't rely on willpower; they have risk managers, weekly psychological cohorts, and strict accountability. We built that environment for ourselves. We set up systems to train us psychologically every week and enforce our daily routines. We created our own internal "trading floor" to keep us in check. Once we put that relentless accountability in place, we got our consistency back. The boom-and-bust cycle finally stopped.
            </p>
          </div>

          <div className="relative z-10">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4 text-white">Why we built MyTraderDesk</h2>
            <p className="text-neutral-400 leading-relaxed">
              After seeing how well this system worked for our own floor members, we realized there was a massive gap in the retail space. There are thousands of traders stuck exactly where we were—armed with strategies but lacking consistency because they don't have the resources to build their own professional trading floor or accountability team. We decided to take the exact system that finally made us profitable and make it accessible to the public. We built <strong>Sentinel Vortex</strong> and <strong>MyTraderDesk</strong> to give retail traders the same structural advantage that saved us.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-3xl text-center">
            <Target className="mx-auto text-blue-500 mb-4" size={32} />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2 text-white">Precision</h3>
            <p className="text-xs text-neutral-500 font-medium">No forced trades. We only map high-probability liquidity zones.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-3xl text-center">
            <Shield className="mx-auto text-emerald-500 mb-4" size={32} />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2 text-white">Validation</h3>
            <p className="text-xs text-neutral-500 font-medium">Crowdsourced sentiment to validate your own technical bias.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-3xl text-center">
            <Activity className="mx-auto text-purple-500 mb-4" size={32} />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2 text-white">Clarity</h3>
            <p className="text-xs text-neutral-500 font-medium">Clean, interactive charting from macro to micro timeframes.</p>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link href="/signup" className="inline-flex items-center px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            Access The Floor <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

      </div>
    </div>
  )
}
