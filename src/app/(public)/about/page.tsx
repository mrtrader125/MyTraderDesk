import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "About MyTraderDesk | Why We Built A Trader Operating System",

  description:
    "Learn why MyTraderDesk was built to solve trading inconsistency, emotional execution, and lack of trader accountability.",

  alternates: {
    canonical: "https://mytraderdesk.com/about",
  },

  openGraph: {
    title: "About MyTraderDesk",
    description:
      "The story behind building a systematic trader operating system.",
    url: "https://mytraderdesk.com/about",
    siteName: "MyTraderDesk",
    type: "article",
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-400 font-sans selection:bg-white selection:text-black">
      
      {/* 🚨 Expanded width to max-w-5xl to reduce side margins 🚨 */}
      <div className="max-w-5xl mx-auto pt-24 pb-32 px-6 md:px-10 lg:px-12">
        
        {/* Header Section */}
        <div className="mb-16 border-b border-neutral-800/60 pb-12">
          <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            About Ourself
          </h1>
          <p className="text-neutral-500 text-lg leading-relaxed max-w-3xl">
            Why we built MyTraderDesk, and the structural shift required to move from discretionary guessing to a systematic operation.
          </p>
        </div>

        {/* Main Narrative Block */}
        <div className="space-y-16">
          
          <div className="relative">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">The Discretionary Struggle</h2>
            <p className="text-neutral-400 leading-relaxed text-[15px]">
              We spent years mastering the markets. We learned the strategies, understood the technicals, and knew exactly what we were supposed to do. But despite having the knowledge, we were still struggling to stay consistent. The problem wasn't a lack of skill; it was human nature. We would get overconfident. As the weeks dragged on, the strict rules we set for ourselves would slowly slip from our minds. We couldn't actively notice it happening, but those small lapses in discipline were destroying our profitability. We realized that knowing everything wasn't enough if we couldn't execute it perfectly every single day.
            </p>
          </div>

          <div className="relative">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">The Shift to a Systematic Floor</h2>
            <p className="text-neutral-400 leading-relaxed text-[15px]">
              We decided to completely change how we operated. We looked at how institutional professionals work—they don't rely on willpower; they have risk managers, weekly psychological cohorts, and strict accountability. We built that environment for ourselves. We set up systems to train us psychologically every week and enforce our daily routines. We created our own internal "trading floor" to keep us in check. Once we put that relentless accountability in place, we got our consistency back. The boom-and-bust cycle finally stopped.
            </p>
          </div>

          <div className="relative">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Why we built MyTraderDesk</h2>
            <p className="text-neutral-400 leading-relaxed text-[15px]">
              After seeing how well this system worked for our own floor members, we realized there was a massive gap in the retail space. There are thousands of traders stuck exactly where we were—armed with strategies but lacking consistency because they don't have the resources to build their own professional trading floor or accountability team. We decided to take the exact system that finally made us profitable and make it accessible to the public. We built <strong className="text-white font-medium">Sentinel Vortex</strong> and <strong className="text-white font-medium">MyTraderDesk</strong> to give retail traders the same structural advantage that saved us.
            </p>
          </div>
          
        </div>

      </div>
    </div>
  )
}
