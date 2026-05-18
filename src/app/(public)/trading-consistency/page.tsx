import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trading Consistency For Forex Traders | MyTraderDesk",
  description: "Learn how consistent traders build execution discipline, routines, journaling systems, and behavioral control.",
  alternates: { canonical: "/trading-consistency" }
};

export default function TradingConsistencyPage() {
  return (
    <main className="flex-grow">
      <article className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-4">
            <span>Protocol_01</span>
            <span className="text-neutral-700">/</span>
            <span>Trader Consistency</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-4">Trading Consistency Is Built Through Systems</h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Most traders do not fail because of strategy. They fail because their execution changes every day. Consistency requires an operational framework, not just an edge.
          </p>
        </header>

        <div className="w-full h-px bg-neutral-900 mb-8"></div>

        <div className="space-y-8 text-[13px] sm:text-sm text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Why Most Traders Never Become Consistent</h2>
            <p className="mb-3">The retail trading industry sells the illusion that a better indicator or a new strategy will fix a broken trader. The reality is that inconsistency is a behavioral problem, not an analytical one.</p>
            <p>When a trader lacks a rigid operational structure, they fall victim to randomness. Every session is dictated by emotional baseline rather than logic. This results in revenge trading, overtrading, and ultimately, imperfect execution. If you do not have a hardcoded rule for every variable, you are relying on willpower—which depletes with every passing minute of the session.</p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Consistency Is Not Winning Every Trade</h2>
            <p className="mb-3">A fundamental misunderstanding among developing traders is equating consistency with a 100% win rate. Professional execution is about standardizing the process, not guaranteeing the outcome of a single trade.</p>
            <p className="mb-3">Trading is a game of probabilities. Consistency means maintaining process quality over a large sample size of trades. It is about execution repeatability. If your risk parameters, entry triggers, and management rules are executed identically every single time, long-term positive expectancy takes over.</p>
            <div className="border-l border-blue-900/50 pl-4 py-1 my-5 bg-blue-950/10 rounded-r-sm">
              <p className="text-blue-400/80 font-mono text-xs tracking-tight">
                {">"} "Most traders don’t need a better strategy. They need a repeatable execution process."
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Systems Create Consistency</h2>
            <p className="mb-3">Discipline cannot be forced; it must be engineered. A trading system acts as a barrier between your impulsive brain and your capital. This requires documented routines, non-negotiable checklists, and rigid execution filters.</p>
            <div className="mt-4 p-4 border border-neutral-900 rounded-md bg-[#080808]">
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono mb-3">Tactical Checklist // Pre-Market</p>
              <ul className="space-y-2 text-neutral-300 font-mono text-[11px] sm:text-xs">
                <li>- HTF Bias Confirmed</li>
                <li>- Session Volatility / News Checked</li>
                <li>- Invalidation Zones Mapped</li>
                <li>- Risk Parameters Set</li>
                <li>- Emotional State Calibrated</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">The Cost Of Emotional Trading</h2>
            <p>Emotional leakage destroys accounts faster than bad strategies. Without systematic boundaries, fear of missing out (FOMO) dictates entries, and hesitation causes you to miss valid setups. Every impulsive entry and every broken rule compounds. Operating like a professional means recognizing these emotional spikes and shutting down the session before the damage is done.</p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Why Journaling Changes Performance</h2>
            <p>Amateurs track PnL. Professionals track behavior. Standard trading journals only record the financial outcome, completely missing the execution quality. Behavioral tracking builds awareness, allowing you to stop treating symptoms and fix the root cause.</p>
            <Link href="/trading-routine" className="inline-block mt-4 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-900/50 hover:border-blue-400">Read Protocol_02: Structuring The Routine -{">"}</Link>
          </section>
        </div>

        <div className="w-full h-px bg-neutral-900 my-10"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#080808] border border-neutral-900 p-5 rounded-md gap-4 shadow-lg shadow-black/50">
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Build Your Operating System</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Structure routines and track execution.</p>
          </div>
          <Link href="/apply" className="px-6 py-3 bg-neutral-200 text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm w-full sm:w-auto text-center">
            Apply For Access
          </Link>
        </div>
      </article>
    </main>
  );
}
