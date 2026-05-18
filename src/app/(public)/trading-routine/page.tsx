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
      {/* max-w-4xl gives it the perfect width for desktop reading. 
        pt-16 gives it breathing room from your global navbar. 
      */}
      <article className="max-w-4xl mx-auto px-6 pt-16 md:pt-24">
        
        {/* DOCUMENT HEADER */}
        <header className="mb-12">
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-mono text-blue-500 mb-6">
            <span>Protocol_02</span>
            <span className="text-neutral-700">/</span>
            <span className="text-neutral-400">Operations</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Trading Routines Used By Consistent Traders
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-3xl">
            Amateurs react to the market. Professionals operate on a schedule. A hardcoded routine is the only defense against psychological fatigue and impulsive execution.
          </p>
        </header>

        <div className="w-full h-px bg-gradient-to-r from-neutral-800 to-transparent mb-12"></div>

        {/* DOCUMENT BODY */}
        <div className="space-y-12 text-base md:text-lg text-neutral-300 leading-relaxed">
          
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 tracking-tight">
              Why Routines Matter
            </h2>
            <p className="mb-4">
              Willpower is a finite resource. If you spend your mental energy deciding when to trade, what to trade, and how much to risk, you will have no psychological capital left for execution. Routines automate the operational side of trading so your focus remains exclusively on the chart.
            </p>
            
            {/* Operator Quote Block */}
            <div className="border-l-2 border-blue-600 pl-6 py-3 my-8 bg-gradient-to-r from-blue-900/20 to-transparent rounded-r-lg">
              <p className="text-blue-400 font-mono text-sm md:text-base tracking-tight">
                {">"} "The market is chaotic. Your routine is the only controlled variable."
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 tracking-tight">
              Pre-Market Preparation & Market Filtering
            </h2>
            <p className="mb-4">
              The session is won before it begins. A pre-market routine dictates exactly which assets you will watch and which you will ignore. This filtering process eliminates visual noise.
            </p>
            <p>
              Your preparation must include marking key levels, noting macroeconomic news events, and defining your risk limits for the day. If the setup does not align with the pre-market plan, no execution occurs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 tracking-tight">
              Session Execution & Risk Limits
            </h2>
            <p>
              An execution routine demands strict session timing. You do not stare at charts for 12 hours. You define your operational window, execute your edge, and shut down the terminal. Hard daily loss limits act as the final failsafe against tilt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 tracking-tight">
              Post-Session Review Systems
            </h2>
            <p>
              The day is not over when the trade closes. Review systems grade your adherence to the plan. Tracking your sleep, stress management, and emotional baseline is just as critical as logging your setups.
            </p>
          </section>
        </div>

        {/* DOCUMENT FOOTER / CTA */}
        <div className="mt-20 bg-[#080808] border border-neutral-800/60 p-8 md:p-10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl shadow-black/50">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Enforce Your Routine</h3>
            <p className="text-sm text-neutral-500 font-mono uppercase tracking-widest">Systematize your edge.</p>
          </div>
          <Link href="/apply" className="px-8 py-3.5 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-200 transition-colors w-full md:w-auto text-center">
            Apply For Access
          </Link>
        </div>

      </article>
    </main>
  );
}
