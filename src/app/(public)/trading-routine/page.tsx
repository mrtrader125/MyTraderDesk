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
    <main className="bg-[#050505] text-neutral-300 min-h-screen font-sans selection:bg-blue-900 selection:text-white">
      {/* 1. max-w-[1600px] matches your exact navbar width. 
        2. pt-20 clears the navbar but removes the massive extra gap.
        3. Removed mx-auto from the text column so it perfectly left-aligns with your logo.
      */}
      <article className="max-w-[1600px] mx-auto px-5 md:px-12 pt-20 pb-16">
        
        {/* max-w-4xl limits line length for readability, but fills the space better than a narrow column */}
        <div className="max-w-4xl">
          
          {/* DOCUMENT HEADER */}
          <header className="mb-6">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-3">
              <span>Protocol_02</span>
              <span className="text-neutral-700">/</span>
              <span>Operations</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 mb-2">
              Trading Routines Used By Consistent Traders
            </h1>

            <p className="text-sm text-neutral-400 leading-relaxed max-w-3xl">
              Amateurs react to the market. Professionals operate on a schedule. A hardcoded routine is the only defense against psychological fatigue and impulsive execution.
            </p>
          </header>

          <div className="w-full h-px bg-neutral-900 mb-6"></div>

          {/* DOCUMENT BODY */}
          <div className="space-y-6 text-[13px] sm:text-sm text-neutral-400 leading-relaxed">
            
            <section>
              <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-1 tracking-tight">
                Why Routines Matter
              </h2>
              <p className="mb-2">
                Willpower is a finite resource. If you spend your mental energy deciding when to trade, what to trade, and how much to risk, you will have no psychological capital left for execution. Routines automate the operational side of trading so your focus remains exclusively on the chart.
              </p>
              
              {/* Terminal-style quote block */}
              <div className="border-l border-blue-900/50 pl-4 py-1 my-3 bg-blue-950/10 rounded-r-sm">
                <p className="text-blue-400/80 font-mono text-xs tracking-tight">
                  {">"} "The market is chaotic. Your routine is the only controlled variable."
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-1 tracking-tight">
                Pre-Market Preparation & Market Filtering
              </h2>
              <p className="mb-2">
                The session is won before it begins. A pre-market routine dictates exactly which assets you will watch and which you will ignore. This filtering process eliminates visual noise.
              </p>
              <p>
                Your preparation must include marking key levels, noting macroeconomic news events, and defining your risk limits for the day. If the setup does not align with the pre-market plan, no execution occurs.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-1 tracking-tight">
                Session Execution & Risk Limits
              </h2>
              <p>
                An execution routine demands strict session timing. You do not stare at charts for 12 hours. You define your operational window, execute your edge, and shut down the terminal. Hard daily loss limits act as the final failsafe against tilt.
              </p>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-1 tracking-tight">
                Post-Session Review Systems
              </h2>
              <p>
                The day is not over when the trade closes. Review systems grade your adherence to the plan. Tracking your sleep, stress management, and emotional baseline is just as critical as logging your setups.
              </p>
            </section>
          </div>

          <div className="w-full h-px bg-neutral-900 my-8"></div>

          {/* DOCUMENT FOOTER / CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#080808] border border-neutral-900 p-4 rounded-md gap-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-200">Enforce Your Routine</h3>
              <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Systematize your edge.</p>
            </div>
            <Link href="/apply" className="px-5 py-2.5 bg-neutral-200 text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm w-full sm:w-auto text-center">
              Apply For Access
            </Link>
          </div>

        </div>
      </article>
    </main>
  );
}
