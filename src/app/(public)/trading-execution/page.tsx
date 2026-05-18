import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trading Execution: Eliminating Hesitation & FOMO | MyTraderDesk",
  description: "Master flawless trading execution. Learn how to bridge the gap between analysis and pulling the trigger without hesitation or fear.",
  alternates: { canonical: "/trading-execution" }
};

export default function TradingExecutionPage() {
  return (
    <main className="flex-grow">
      <article className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-4">
            <span>Protocol_07</span>
            <span className="text-neutral-700">/</span>
            <span>Execution</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-4">Flawless Trading Execution: Eliminating Imperfect Entries</h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Being right on the chart does not matter if you cannot pull the trigger. Master the operational gap between analysis and flawless execution.
          </p>
        </header>

        <div className="w-full h-px bg-neutral-900 mb-8"></div>

        <div className="space-y-8 text-[13px] sm:text-sm text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">The Gap Between Analysis and Execution</h2>
            <p className="mb-3">Amateurs spend years perfecting their technical analysis, completely ignoring the fact that analysis is only 10% of the game. The actual profit is extracted in the execution.</p>
            <p>If you can predict market direction but consistently enter late, exit early, or freeze when your setup appears, your analysis is functionally useless.</p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Operator Protocols & Triggers</h2>
            <p className="mb-3">Execution hesitation stems from ambiguity. If you do not have a binary trigger, your brain has to make a subjective decision in a high-stress environment.</p>
            <div className="mt-4 p-4 border border-neutral-900 rounded-md bg-[#080808]">
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono mb-3">Tactical Checklist // Execution</p>
              <ul className="space-y-2 text-neutral-300 font-mono text-[11px] sm:text-xs">
                <li>- If setup confirms, market execute immediately.</li>
                <li>- No manual stop adjustments.</li>
                <li>- Limit terminal time to 90 minutes.</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="w-full h-px bg-neutral-900 my-10"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#080808] border border-neutral-900 p-5 rounded-md gap-4 shadow-lg shadow-black/50">
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Execute Like A Machine</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Build rigid execution rules.</p>
          </div>
          <Link href="/apply" className="px-6 py-3 bg-neutral-200 text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm w-full sm:w-auto text-center">
            Apply For Access
          </Link>
        </div>
      </article>
    </main>
  );
}
