import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Building A Trading Journal That Improves Performance | MyTraderDesk",
  description: "A standard trading journal is useless. Learn how to track behavior, execution quality, and operational discipline to find your true edge.",
  alternates: { canonical: "/trading-journal" }
};

export default function TradingJournalPage() {
  return (
    <main className="bg-[#050505] text-white min-h-screen selection:bg-blue-900 selection:text-white">
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-bold mb-6">Protocol 10 // Data & Analytics</p>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">Building A Journal That Actually Improves Performance</h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Spreadsheets tracking entry and exit prices are dead. Professional journals track operational discipline and behavioral analytics.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">Behavioral Logs vs. Financial Logs</h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>If you only log your PnL, you are only treating the symptoms of bad trading. To fix the root cause, your journal must track missed prep, broken rules, and session fatigue.</p>
          </div>
          <blockquote className="mt-8 border-l-2 border-blue-500 pl-6 py-2">
            <p className="text-lg text-neutral-200 italic">"Data solves emotion. If you look at a 100-trade sample size of flawless execution, the fear of an individual loss disappears."</p>
          </blockquote>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">Capturing The Right Metrics</h2>
          <div className="bg-[#050505] border border-neutral-900 rounded-xl p-6 mt-6">
            <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-4">Essential Logging Framework</p>
            <ul className="space-y-3 text-sm text-neutral-300 font-mono">
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Execution Grade (A, B, C, F)</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Emotional State Baseline</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Confluence Factors Present</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-neutral-900 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Digitize Your Operations</h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">Stop using broken spreadsheets. Let MyTraderDesk track your behavioral analytics automatically.</p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors">Apply For Access</button>
          </div>
        </div>
      </section>
    </main>
  );
}
