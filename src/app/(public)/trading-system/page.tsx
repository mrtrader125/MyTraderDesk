import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Building A Trading System You Can Actually Follow | MyTraderDesk",
  description:
    "Learn how to reduce mental overload and build a robust trading system focused on process design, decision frameworks, and execution filters.",
  alternates: {
    canonical: "/trading-system",
  },
};

export default function TradingSystemPage() {
  return (
    <main className="bg-[#050505] text-white min-h-screen selection:bg-blue-900 selection:text-white">
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-bold mb-6">
          Protocol 04 // Trading System
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
          Building A Trading System You Can Actually Follow
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          A complex system is a fragile system. To achieve institutional-grade consistency, your framework must minimize decision fatigue and maximize execution clarity.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Why Traders Abandon Systems
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              Traders abandon their systems because of execution complexity. When a strategy requires analyzing too many timeframes, lagging indicators, and subjective patterns, it creates cognitive overload. In moments of stress, the brain defaults to impulse rather than complex logic.
            </p>
          </div>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Decision Frameworks & Execution Filters
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              A robust system relies on binary decision frameworks. If 'A' happens, do 'B'. If 'C' happens, do nothing. Execution filters—such as time of day, volatility thresholds, and previous daily bias—act as physical barriers protecting your capital from suboptimal setups.
            </p>
            <Link href="/behavioral-journaling" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-900 hover:border-blue-300">
              Integrate your system with behavioral journaling →
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-neutral-900 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Systematize Your Edge
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors duration-200">
              Apply For Access
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}