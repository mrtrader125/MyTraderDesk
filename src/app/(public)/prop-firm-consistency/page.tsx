import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prop Firm Consistency: How To Keep Funded Accounts | MyTraderDesk",
  description:
    "Stop blowing funded accounts. Learn the execution protocols and risk management systems required for prop firm consistency and scaling.",
  alternates: {
    canonical: "/prop-firm-consistency",
  },
};

export default function PropFirmConsistencyPage() {
  return (
    <main className="bg-[#050505] text-white min-h-screen selection:bg-blue-900 selection:text-white">
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-bold mb-6">
          Protocol 06 // Funded Operations
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
          How To Survive And Scale Funded Prop Firm Accounts
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Passing a challenge is easy. Keeping the capital is the real test. Consistency in a prop firm requires strict drawdown mathematics and rigid operational protocols.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            The Payout Illusion
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              The industry is built on the reality that 95% of traders will pass a challenge, get funded, and blow the account before their first payout. This happens because traders shift their psychology from "trading the system" to "trading for the payout."
            </p>
            <p>
              When you attach emotional weight to the potential withdrawal, you stop executing your edge. You start managing trades based on PnL rather than market structure.
            </p>
          </div>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Drawdown Mathematics
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              Surviving a funded account requires a deep understanding of absolute versus trailing drawdowns. A single string of losses will not blow your account if your risk is managed. What blows the account is emotional leakage during that losing streak—doubling down, moving stops, or revenge trading to "make it back."
            </p>
          </div>
          
          <blockquote className="mt-8 border-l-2 border-blue-500 pl-6 py-2">
            <p className="text-lg text-neutral-200 italic">
              "Your primary job in a prop firm is capital preservation. Profit is just a byproduct of perfect execution."
            </p>
          </blockquote>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Standardizing Risk Operations
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed mb-8">
            <p>
              You must completely decouple your mind from the dollar amount you are risking. Whether it is a $10,000 account or a $300,000 account, the risk must be a standardized, fixed percentage.
            </p>
          </div>

          <div className="bg-[#050505] border border-neutral-900 rounded-xl p-6">
            <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-4">Tactical Checklist // Prop Firm Survival</p>
            <ul className="space-y-3 text-sm text-neutral-300 font-mono">
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Max Risk Per Trade: Fixed % Locked</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Daily Drawdown Limit Set in Terminal</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> No PnL Watching During Execution</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Post-Trade System Grade Required</li>
            </ul>
          </div>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Imperfect Execution Is An Immediate Invalidation
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              In a funded environment, there is zero tolerance for imperfect execution. Moving a stop-loss to breakeven too early because you are scared, or entering a trade late out of FOMO, instantly invalidates your edge. 
            </p>
            <Link href="/trading-execution" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-900 hover:border-blue-300">
              Read the protocol on flawless trading execution →
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-neutral-900 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Protect Your Funded Capital
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            Stop losing accounts to emotional mistakes. Enforce hard operational discipline with MyTraderDesk.
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