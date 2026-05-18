import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trading Consistency For Forex Traders | MyTraderDesk",
  description:
    "Learn how consistent traders build execution discipline, routines, journaling systems, and behavioral control.",
  alternates: {
    canonical: "/trading-consistency",
  },
};

export default function TradingConsistencyPage() {
  return (
    <main className="bg-[#050505] text-white min-h-screen selection:bg-blue-900 selection:text-white">
      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-bold mb-6">
          Protocol 01 // Trader Consistency
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
          Trading Consistency Is Built Through Systems
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Most traders do not fail because of strategy. They fail because their execution changes every day. Consistency requires an operational framework, not just an edge.
        </p>
      </section>

      {/* CONTENT ARCHITECTURE */}
      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        
        {/* SECTION 1 */}
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Why Most Traders Never Become Consistent
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              The retail trading industry sells the illusion that a better indicator or a new strategy will fix a broken trader. The reality is that inconsistency is a behavioral problem, not an analytical one.
            </p>
            <p>
              When a trader lacks a rigid operational structure, they fall victim to randomness. Every session is dictated by emotional baseline rather than logic. This results in revenge trading, overtrading, and ultimately, imperfect execution. If you do not have a hardcoded rule for every variable, you are relying on willpower—which depletes with every passing minute of the session.
            </p>
          </div>
        </div>

        {/* SECTION 2 */}
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Consistency Is Not Winning Every Trade
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              A fundamental misunderstanding among developing traders is equating consistency with a 100% win rate. Professional execution is about standardizing the process, not guaranteeing the outcome of a single trade.
            </p>
            <p>
              Trading is a game of probabilities. Consistency means maintaining process quality over a large sample size of trades. It is about execution repeatability. If your risk parameters, entry triggers, and management rules are executed identically every single time, long-term positive expectancy takes over.
            </p>
          </div>
          
          <blockquote className="mt-8 border-l-2 border-blue-500 pl-6 py-2">
            <p className="text-lg text-neutral-200 italic">
              "Most traders don’t need a better strategy. They need a repeatable execution process."
            </p>
          </blockquote>
        </div>

        {/* SECTION 3 */}
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Systems Create Consistency
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed mb-8">
            <p>
              Discipline cannot be forced; it must be engineered. A trading system acts as a barrier between your impulsive brain and your capital. This requires documented routines, non-negotiable checklists, and rigid execution filters. 
            </p>
            <p>
              When you rely on a system, missed prep becomes an instant red flag. If the pre-market routine is not completed, the terminal remains closed.
            </p>
          </div>

          <div className="bg-[#050505] border border-neutral-900 rounded-xl p-6">
            <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-4">Tactical Checklist // Pre-Market</p>
            <ul className="space-y-3 text-sm text-neutral-300 font-mono">
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> HTF (Higher Time Frame) Bias Confirmed</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Session Volatility / News Events Checked</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Invalidation Zones Mapped</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Risk Parameters Set (Max Daily Loss)</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Emotional State Calibrated</li>
            </ul>
          </div>
        </div>

        {/* SECTION 4 */}
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            The Cost Of Emotional Trading
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              Emotional leakage destroys accounts faster than bad strategies. Without systematic boundaries, fear of missing out (FOMO) dictates entries, and hesitation causes you to miss valid setups. 
            </p>
            <p>
              Every impulsive entry and every broken rule compounds. It is not just the financial loss; it is the psychological capital that is drained. Operating like a professional means recognizing these emotional spikes and having protocols to shut down the session before the damage is done.
            </p>
          </div>
        </div>

        {/* SECTION 5 */}
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Why Journaling Changes Performance
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              Amateurs track PnL. Professionals track behavior. Standard trading journals only record the financial outcome, completely missing the execution quality. 
            </p>
            <p>
              Behavioral tracking builds awareness. By identifying recurring mistakes—such as moving stop losses prematurely or trading outside of defined execution windows—you stop treating the symptoms and start fixing the root cause of your inconsistency.
            </p>
          </div>
        </div>

        {/* SECTION 6 */}
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Building A Repeatable Trading Process
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              To eliminate randomness, you must standardize your daily operations. This begins with pre-market analysis, strictly adhering to defined execution windows, and utilizing hard risk management protocols.
            </p>
            <p>
              Most importantly, the process does not end when the terminal closes. Post-trade review systems are mandatory to grade execution quality. Your goal is not to judge the monetary result, but to grade your adherence to the trading routine itself.
            </p>
            <Link href="/trading-routine" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-900 hover:border-blue-300">
              Read the next protocol: Structuring The Trading Routine →
            </Link>
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="mt-16 pt-16 border-t border-neutral-900 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Build Your Trading Operating System
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            MyTraderDesk helps traders structure routines, track execution, and eliminate behavioral inconsistency through institutional-grade infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors duration-200">
              Apply For Access
            </button>
            <Link href="/protocol/routine" className="px-8 py-3 border border-neutral-700 text-white font-medium rounded-lg hover:bg-neutral-900 transition-colors duration-200">
              Explore The Protocols
            </Link>
          </div>
        </div>

      </section>
    </main>
  );
}
