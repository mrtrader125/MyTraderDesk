import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Post-Market Trading Review Process | MyTraderDesk",
  description: "Discover the exact post-market review process professional operators use to audit execution, identify mistakes, and improve edge.",
  alternates: { canonical: "/trading-review-process" }
};

export default function TradingReviewProcessPage() {
  return (
    <main className="bg-[#050505] text-white min-h-screen selection:bg-blue-900 selection:text-white">
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-bold mb-6">Protocol 09 // Review Operations</p>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">The Post-Market Trading Review Process</h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          The session is not over when the trade closes. Post-market review is where true profitability is built and refined.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">Grading Execution, Not PnL</h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>If you evaluate your session based on how much money you made, you will learn the wrong lessons. A profitable trade that broke your rules is a failure. A losing trade executed flawlessly is a success.</p>
            <p>Your review process must assign a strict letter grade (A to F) based entirely on your adherence to the operator protocols.</p>
          </div>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">Identifying Psychological Leakage</h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>Use your review time to document your emotional state. Did you experience elevated heart rate during the hold? Did you feel a surge of FOMO before entry? Documenting these physiological responses is how you prevent them tomorrow.</p>
            <Link href="/behavioral-journaling" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 border-b border-blue-900">Connect this to behavioral journaling →</Link>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-neutral-900 text-center">
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors">Apply For Access</button>
          </div>
        </div>
      </section>
    </main>
  );
}
