import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Post-Market Trading Review Process | MyTraderDesk",
  description: "Discover the exact post-market review process professional operators use to audit execution, identify mistakes, and improve edge.",
  alternates: { canonical: "/trading-review-process" }
};

export default function TradingReviewProcessPage() {
  return (
    <main className="flex-grow">
      <article className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-4">
            <span>Protocol_09</span>
            <span className="text-neutral-700">/</span>
            <span>Review Operations</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-4">The Post-Market Trading Review Process</h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            The session is not over when the trade closes. Post-market review is where true profitability is built and refined.
          </p>
        </header>

        <div className="w-full h-px bg-neutral-900 mb-8"></div>

        <div className="space-y-8 text-[13px] sm:text-sm text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Grading Execution, Not PnL</h2>
            <p className="mb-3">If you evaluate your session based on how much money you made, you will learn the wrong lessons. A profitable trade that broke your rules is a failure. A losing trade executed flawlessly is a success.</p>
            <p>Your review process must assign a strict letter grade (A to F) based entirely on your adherence to the operator protocols.</p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Identifying Psychological Leakage</h2>
            <p className="mb-3">Use your review time to document your emotional state. Did you experience elevated heart rate during the hold? Did you feel a surge of FOMO before entry? Documenting these physiological responses is how you prevent them tomorrow.</p>
            <Link href="/behavioral-journaling" className="inline-block mt-2 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-900/50 hover:border-blue-400">Connect to behavioral journaling -{">"}</Link>
          </section>
        </div>

        <div className="w-full h-px bg-neutral-900 my-10"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#080808] border border-neutral-900 p-5 rounded-md gap-4 shadow-lg shadow-black/50">
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Enforce The Review</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Audit execution meticulously.</p>
          </div>
          <Link href="/apply" className="px-6 py-3 bg-neutral-200 text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm w-full sm:w-auto text-center">
            Apply For Access
          </Link>
        </div>
      </article>
    </main>
  );
}
