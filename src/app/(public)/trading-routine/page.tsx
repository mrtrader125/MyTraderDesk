import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trading Routines Used By Consistent Traders | MyTraderDesk",
  description:
    "Discover the exact pre-market, execution, and review routines professional traders use to eliminate emotional randomness and maintain discipline.",
  alternates: {
    canonical: "/trading-routine",
  },
};

export default function TradingRoutinePage() {
  return (
    <main className="bg-[#050505] text-neutral-300 min-h-screen font-sans selection:bg-blue-900 selection:text-white pb-24">
      {/* Matches the exact width and padding of your Navbar. 
        Top padding reduced to pt-24 to kill the massive gap.
      */}
      <article className="max-w-[1600px] mx-auto px-5 md:px-12 pt-24 md:pt-28 flex justify-start">
        
        {/* Constrains text to a readable width, but keeps it left-aligned with the logo */}
        <div className="max-w-4xl w-full">
          
          {/* DOCUMENT HEADER */}
          <header className="mb-12 border-b border-neutral-800 pb-8">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-6">
              <span>Protocol 02</span>
              <span className="w-1 h-1 bg-blue-600 rounded-none"></span>
              <span>Operations</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Trading Routines Used By Consistent Traders
            </h1>

            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-3xl">
              Amateurs react to the market. Professionals operate on a schedule. A hardcoded routine is the only defense against psychological fatigue and impulsive execution.
            </p>
          </header>

          {/* DOCUMENT BODY */}
          <div className="space-y-12 text-base leading-relaxed">
            
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 tracking-tight">
                Why Routines Matter
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Willpower is a finite resource. If you spend your mental energy deciding when to trade, what to trade, and how much to risk, you will have no psychological capital left for execution. Routines automate the operational side of trading so your focus remains exclusively on the chart.
                </p>
              </div>
              
              <div className="mt-6 border-l-2 border-blue-600 pl-5 py-1">
                <p className="text-neutral-300 font-mono text-sm tracking-tight">
                  "The market is chaotic. Your routine is the only controlled variable."
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 tracking-tight">
                Pre-Market Preparation & Market Filtering
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  The session is won before it begins. A pre-market routine dictates exactly which assets you will watch and which you will ignore. This filtering process eliminates visual noise.
                </p>
                <p>
                  Your preparation must include marking key levels, noting macroeconomic news events, and defining your risk limits for the day. If the setup does not align with the pre-market plan, no execution occurs.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 tracking-tight">
                Session Execution & Risk Limits
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  An execution routine demands strict session timing. You do not stare at charts for 12 hours. You define your operational window, execute your edge, and shut down the terminal. Hard daily loss limits act as the final failsafe against tilt.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 tracking-tight">
                Post-Session Review Systems
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  The day is not over when the trade closes. Review systems grade your adherence to the plan. Tracking your sleep, stress management, and emotional baseline is just as critical as logging your setups.
                </p>
              </div>
            </section>
          </div>

          {/* DOCUMENT FOOTER / CTA */}
          <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Enforce Your Routine</h3>
              <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest">Systematize your edge.</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Link href="/apply" className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors w-full sm:w-auto text-center">
                Apply For Access
              </Link>
            </div>
          </div>

        </div>
      </article>
    </main>
  );
}
