import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prop Firm Consistency: How To Keep Funded Accounts | MyTraderDesk",
  description: "Stop blowing funded accounts. Learn the execution protocols and risk management systems required for prop firm consistency and scaling.",
  alternates: { canonical: "/prop-firm-consistency" }
};

export default function PropFirmConsistencyPage() {
  return (
    <main className="flex-grow">
      <article className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-4">
            <span>Protocol_06</span>
            <span className="text-neutral-700">/</span>
            <span>Funded Operations</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-4">How To Survive And Scale Funded Prop Firm Accounts</h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Passing a challenge is easy. Keeping the capital is the real test. Consistency in a prop firm requires strict drawdown mathematics and rigid operational protocols.
          </p>
        </header>

        <div className="w-full h-px bg-neutral-900 mb-8"></div>

        <div className="space-y-8 text-[13px] sm:text-sm text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">The Payout Illusion</h2>
            <p className="mb-3">The industry is built on the reality that 95% of traders will pass a challenge, get funded, and blow the account before their first payout. This happens because traders shift their psychology from "trading the system" to "trading for the payout."</p>
            <p>When you attach emotional weight to the potential withdrawal, you stop executing your edge. You start managing trades based on PnL rather than market structure.</p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Drawdown Mathematics</h2>
            <p className="mb-3">Surviving a funded account requires a deep understanding of absolute versus trailing drawdowns. A single string of losses will not blow your account if your risk is managed. What blows the account is emotional leakage during that losing streak—doubling down, moving stops, or revenge trading to "make it back."</p>
            <div className="border-l border-blue-900/50 pl-4 py-1 my-5 bg-blue-950/10 rounded-r-sm">
              <p className="text-blue-400/80 font-mono text-xs tracking-tight">
                {">"} "Your primary job in a prop firm is capital preservation. Profit is just a byproduct of perfect execution."
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Standardizing Risk Operations</h2>
            <p className="mb-3">You must completely decouple your mind from the dollar amount you are risking. Whether it is a $10,000 account or a $300,000 account, the risk must be a standardized, fixed percentage.</p>
            <div className="mt-4 p-4 border border-neutral-900 rounded-md bg-[#080808]">
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono mb-3">Tactical Checklist // Prop Firm Survival</p>
              <ul className="space-y-2 text-neutral-300 font-mono text-[11px] sm:text-xs">
                <li>- Max Risk Per Trade: Fixed % Locked</li>
                <li>- Daily Drawdown Limit Set in Terminal</li>
                <li>- No PnL Watching During Execution</li>
                <li>- Post-Trade System Grade Required</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Imperfect Execution Is An Immediate Invalidation</h2>
            <p className="mb-3">In a funded environment, there is zero tolerance for imperfect execution. Moving a stop-loss to breakeven too early because you are scared, or entering a trade late out of FOMO, instantly invalidates your edge.</p>
            <Link href="/trading-execution" className="inline-block mt-2 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-900/50 hover:border-blue-400">Read Protocol_07: Flawless Execution -{">"}</Link>
          </section>
        </div>

        <div className="w-full h-px bg-neutral-900 my-10"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#080808] border border-neutral-900 p-5 rounded-md gap-4 shadow-lg shadow-black/50">
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Protect Your Funded Capital</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Enforce hard operational discipline.</p>
          </div>
          <Link href="/apply" className="px-6 py-3 bg-neutral-200 text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm w-full sm:w-auto text-center">
            Apply For Access
          </Link>
        </div>
      </article>
    </main>
  );
}
