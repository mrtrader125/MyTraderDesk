import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Building A Trading System You Can Actually Follow | MyTraderDesk",
  description: "Learn how to reduce mental overload and build a robust trading system focused on process design, decision frameworks, and execution filters.",
  alternates: { canonical: "/trading-system" }
};

export default function TradingSystemPage() {
  return (
    <main className="flex-grow">
      <article className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-4">
            <span>Protocol_04</span>
            <span className="text-neutral-700">/</span>
            <span>Trading System</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-4">Building A Trading System You Can Actually Follow</h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            A complex system is a fragile system. To achieve institutional-grade consistency, your framework must minimize decision fatigue and maximize execution clarity.
          </p>
        </header>

        <div className="w-full h-px bg-neutral-900 mb-8"></div>

        <div className="space-y-8 text-[13px] sm:text-sm text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Why Traders Abandon Systems</h2>
            <p>Traders abandon their systems because of execution complexity. When a strategy requires analyzing too many timeframes, lagging indicators, and subjective patterns, it creates cognitive overload. In moments of stress, the brain defaults to impulse rather than complex logic.</p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Decision Frameworks & Execution Filters</h2>
            <p className="mb-3">A robust system relies on binary decision frameworks. If 'A' happens, do 'B'. If 'C' happens, do nothing. Execution filters—such as time of day, volatility thresholds, and previous daily bias—act as physical barriers protecting your capital from suboptimal setups.</p>
            <Link href="/behavioral-journaling" className="inline-block mt-2 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-900/50 hover:border-blue-400">Integrate system with behavioral journaling -{">"}</Link>
          </section>
        </div>

        <div className="w-full h-px bg-neutral-900 my-10"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#080808] border border-neutral-900 p-5 rounded-md gap-4 shadow-lg shadow-black/50">
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Systematize Your Edge</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Deploy execution filters.</p>
          </div>
          <Link href="/apply" className="px-6 py-3 bg-neutral-200 text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm w-full sm:w-auto text-center">
            Apply For Access
          </Link>
        </div>
      </article>
    </main>
  );
}
