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
    <main className="bg-[#050505] text-white min-h-screen selection:bg-blue-900 selection:text-white">
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-bold mb-6">
          Protocol 02 // Trading Routine
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
          Trading Routines Used By Consistent Traders
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Amateurs react to the market. Professionals operate on a schedule. A hardcoded routine is the only defense against psychological fatigue and impulsive execution.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Why Routines Matter
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              Willpower is a finite resource. If you spend your mental energy deciding when to trade, what to trade, and how much to risk, you will have no psychological capital left for execution. Routines automate the operational side of trading so your focus remains exclusively on the chart.
            </p>
          </div>
          
          <blockquote className="mt-8 border-l-2 border-blue-500 pl-6 py-2">
            <p className="text-lg text-neutral-200 italic">
              "The market is chaotic. Your routine is the only controlled variable."
            </p>
          </blockquote>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Pre-Market Preparation & Market Filtering
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed mb-8">
            <p>
              The session is won before it begins. A pre-market routine dictates exactly which assets you will watch and which you will ignore. This filtering process eliminates visual noise. 
            </p>
            <p>
              Your preparation must include marking key levels, noting macroeconomic news events, and defining your risk limits for the day. If the setup does not align with the pre-market plan, no execution occurs.
            </p>
          </div>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Session Execution & Risk Limits
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              An execution routine demands strict session timing. You do not stare at charts for 12 hours. You define your operational window, execute your edge, and shut down the terminal. Hard daily loss limits act as the final failsafe against tilt.
            </p>
            <Link href="/trader-psychology" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-900 hover:border-blue-300">
              Understand the psychological impact of structure →
            </Link>
          </div>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Post-Session Review & Daily Consistency Frameworks
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              The day is not over when the trade closes. Review systems grade your adherence to the plan. Tracking your sleep, stress management, and emotional baseline is just as critical as logging your setups.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-neutral-900 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Build Your Trading Operating System
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            Stop relying on motivation. Automate your discipline with MyTraderDesk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors duration-200">
              Apply For Access
            </button>
            <Link href="/protocol/system" className="px-8 py-3 border border-neutral-700 text-white font-medium rounded-lg hover:bg-neutral-900 transition-colors duration-200">
              Explore The Protocols
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}