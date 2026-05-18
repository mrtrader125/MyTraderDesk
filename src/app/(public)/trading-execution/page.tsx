import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trading Execution: Eliminating Hesitation & FOMO | MyTraderDesk",
  description: "Master flawless trading execution. Learn how to bridge the gap between analysis and pulling the trigger without hesitation or fear.",
  alternates: { canonical: "/trading-execution" }
};

export default function TradingExecutionPage() {
  return (
    <main className="bg-[#050505] text-white min-h-screen selection:bg-blue-900 selection:text-white">
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-bold mb-6">Protocol 07 // Execution</p>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">Flawless Trading Execution: Eliminating Imperfect Entries</h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Being right on the chart does not matter if you cannot pull the trigger. Master the operational gap between analysis and flawless execution.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">The Gap Between Analysis and Execution</h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>Amateurs spend years perfecting their technical analysis, completely ignoring the fact that analysis is only 10% of the game. The actual profit is extracted in the execution.</p>
            <p>If you can predict market direction but consistently enter late, exit early, or freeze when your setup appears, your analysis is functionally useless.</p>
          </div>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">Operator Protocols & Triggers</h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed mb-8">
            <p>Execution hesitation stems from ambiguity. If you do not have a binary trigger, your brain has to make a subjective decision in a high-stress environment.</p>
          </div>
          <div className="bg-[#050505] border border-neutral-900 rounded-xl p-6">
            <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-4">Tactical Checklist // Execution</p>
            <ul className="space-y-3 text-sm text-neutral-300 font-mono">
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> If setup confirms, market execute immediately.</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> No manual stop adjustments.</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Limit terminal time to 90 minutes.</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-neutral-900 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Execute Like A Machine</h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">Build rigid execution rules and track your compliance with MyTraderDesk.</p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors">Apply For Access</button>
          </div>
        </div>
      </section>
    </main>
  );
}
