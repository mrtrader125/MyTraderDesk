import { Metadata } from 'next'
import Link from 'next/link'
import { Target, Shield, Activity, ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Sentinel Vortex | MyTraderDesk',
  description: 'We built a digital trading floor to give solo operators the confluence, confidence, and structured analysis they need to execute without hesitation.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-400 font-sans selection:bg-white selection:text-black">
      <div className="max-w-5xl mx-auto pt-16 pb-20 px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-16">
          <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            The Philosophy
          </h1>
          <p className="text-neutral-500 text-lg md:text-xl max-w-2xl leading-relaxed">
            Amateurs execute constantly and analyze rarely. Professionals analyze deeply and execute selectively.
          </p>
        </div>

        {/* Main Narrative Block */}
        <div className="bg-[#0A0A0A] border border-neutral-800/60 rounded-2xl p-8 md:p-12 lg:p-16 mb-16 space-y-16">
          
          <div className="relative">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Our Story</h2>
            <p className="text-neutral-400 leading-relaxed text-[15px] max-w-3xl">
              We spent years mastering the markets. We learned the strategies, understood the technicals, and knew exactly what we were supposed to do. But despite having the knowledge, we were still struggling to stay consistent. The problem wasn't a lack of skill; it was human nature. We would get overconfident. As the weeks dragged on, the strict rules we set for ourselves would slowly slip from our minds. We couldn't actively notice it happening, but those small lapses in discipline were destroying our profitability. We realized that knowing everything wasn't enough if we couldn't execute it perfectly every single day.
            </p>
          </div>

          <div className="relative">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">The Shift to a Systematic Floor</h2>
            <p className="text-neutral-400 leading-relaxed text-[15px] max-w-3xl">
              We decided to completely change how we operated. We looked at how institutional professionals work—they don't rely on willpower; they have risk managers, weekly psychological cohorts, and strict accountability. We built that environment for ourselves. We set up systems to train us psychologically every week and enforce our daily routines. We created our own internal "trading floor" to keep us in check. Once we put that relentless accountability in place, we got our consistency back. The boom-and-bust cycle finally stopped.
            </p>
          </div>

          <div className="relative">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Why we built MyTraderDesk</h2>
            <p className="text-neutral-400 leading-relaxed text-[15px] max-w-3xl">
              After seeing how well this system worked for our own floor members, we realized there was a massive gap in the retail space. There are thousands of traders stuck exactly where we were—armed with strategies but lacking consistency because they don't have the resources to build their own professional trading floor or accountability team. We decided to take the exact system that finally made us profitable and make it accessible to the public. We built <strong className="text-white font-medium">Sentinel Vortex</strong> and <strong className="text-white font-medium">MyTraderDesk</strong> to give retail traders the same structural advantage that saved us.
            </p>
          </div>
          
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#0A0A0A] border border-neutral-800/60 p-8 rounded-2xl flex flex-col items-start hover:border-neutral-700 transition-colors">
            <div className="p-3 bg-[#0F0F0F] border border-neutral-800 rounded-lg mb-6">
              <Target className="text-neutral-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-white">Precision</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">No forced trades. We only map high-probability liquidity zones.</p>
          </div>
          
          <div className="bg-[#0A0A0A] border border-neutral-800/60 p-8 rounded-2xl flex flex-col items-start hover:border-neutral-700 transition-colors">
            <div className="p-3 bg-[#0F0F0F] border border-neutral-800 rounded-lg mb-6">
              <Shield className="text-neutral-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-white">Validation</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">Crowdsourced sentiment to validate your own technical bias.</p>
          </div>
          
          <div className="bg-[#0A0A0A] border border-neutral-800/60 p-8 rounded-2xl flex flex-col items-start hover:border-neutral-700 transition-colors">
            <div className="p-3 bg-[#0F0F0F] border border-neutral-800 rounded-lg mb-6">
              <Activity className="text-neutral-400" size={20} />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-white">Clarity</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">Clean, interactive charting from macro to micro timeframes.</p>
          </div>
        </div>

        {/* Action CTA */}
        <div className="bg-[#0A0A0A] border border-neutral-800/60 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="text-xl font-medium text-white tracking-tight mb-2">Ready to execute systematically?</h3>
            <p className="text-neutral-500 text-sm max-w-md">Join the live execution floor. Founding membership is currently capped at 150 operators to ensure quality.</p>
          </div>
          <Link href="/signup" className="shrink-0 px-6 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors text-center w-full md:w-auto flex items-center justify-center gap-2">
            Access The Floor <ArrowUpRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  )
}
