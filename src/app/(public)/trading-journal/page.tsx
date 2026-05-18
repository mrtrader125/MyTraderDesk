import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Building A Trading Journal That Improves Performance | MyTraderDesk",
  description: "A standard trading journal is useless. Learn how to track behavior, execution quality, and operational discipline to find your true edge.",
  alternates: { canonical: "/trading-journal" }
};

export default function TradingJournalPage() {
  return (
    <main className="flex-grow">
      <article className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-4">
            <span>Protocol_10</span>
            <span className="text-neutral-700">/</span>
            <span>Data & Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-4">Building A Journal That Actually Improves Performance</h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Spreadsheets tracking entry and exit prices are dead. Professional journals track operational discipline and behavioral analytics.
          </p>
        </header>

        <div className="w-full h-px bg-neutral-900 mb-8"></div>

        <div className="space-y-8 text-[13px] sm:text-sm text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Behavioral Logs vs. Financial Logs</h2>
            <p className="mb-3">If you only log your PnL, you are only treating the symptoms of bad trading. To fix the root cause, your journal must track missed prep, broken rules, and session fatigue.</p>
            <div className="border-l border-blue-900/50 pl-4 py-1 my-5 bg-blue-950/10 rounded-r-sm">
              <p className="text-blue-400/80 font-mono text-xs tracking-tight">
                {">"} "Data solves emotion. If you look at a 100-trade sample size of flawless execution, the fear of an individual loss disappears."
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Capturing The Right Metrics</h2>
            <div className="mt-4 p-4 border border-neutral-900 rounded-md bg-[#080808]">
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono mb-3">Essential Logging Framework</p>
              <ul className="space-y-2 text-neutral-300 font-mono text-[11px] sm:text-xs">
                <li>- Execution Grade (A, B, C, F)</li>
                <li>- Emotional State Baseline</li>
                <li>- Confluence Factors Present</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="w-full h-px bg-neutral-900 my-10"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#080808] border border-neutral-900 p-5 rounded-md gap-4 shadow-lg shadow-black/50">
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Digitize Your Operations</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Let MyTraderDesk track behavior.</p>
          </div>
          <Link href="/apply" className="px-6 py-3 bg-neutral-200 text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm w-full sm:w-auto text-center">
            Apply For Access
          </Link>
        </div>
      </article>
    </main>
  );
}
