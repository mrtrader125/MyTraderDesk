import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trading Discipline Is An Engineering Problem | MyTraderDesk",
  description: "Trading discipline is not about motivation. It is about building hard behavioral guardrails and unshakeable operational routines.",
  alternates: { canonical: "/trading-discipline" }
};

export default function TradingDisciplinePage() {
  return (
    <main className="flex-grow">
      <article className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-4">
            <span>Protocol_08</span>
            <span className="text-neutral-700">/</span>
            <span>Discipline</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-4">Trading Discipline Is An Engineering Problem</h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Stop relying on motivation. Consistent profitability requires hard behavioral guardrails and unshakeable operational routines.
          </p>
        </header>

        <div className="w-full h-px bg-neutral-900 mb-8"></div>

        <div className="space-y-8 text-[13px] sm:text-sm text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">The Anti-Guru Reality</h2>
            <p className="mb-3">Listening to motivational podcasts will not stop you from revenge trading. Reading trading psychology books will not stop you from moving your stop loss. Discipline is not a mindset; it is an engineered framework.</p>
            <div className="border-l border-blue-900/50 pl-4 py-1 my-5 bg-blue-950/10 rounded-r-sm">
              <p className="text-blue-400/80 font-mono text-xs tracking-tight">
                {">"} "You do not rise to the level of your goals. You fall to the level of your systems."
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">The "Missed Prep" Red Flag</h2>
            <p className="mb-3">The first sign of a discipline collapse is skipping the routine. If you sit down at the terminal and execute a trade without completing your pre-market checklist, you are already trading on tilt.</p>
            <Link href="/trading-routine" className="inline-block mt-2 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-900/50 hover:border-blue-400">Review Protocol_02: Routine -{">"}</Link>
          </section>
        </div>

        <div className="w-full h-px bg-neutral-900 my-10"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#080808] border border-neutral-900 p-5 rounded-md gap-4 shadow-lg shadow-black/50">
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Engineer Your Discipline</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Replace motivation with structure.</p>
          </div>
          <Link href="/apply" className="px-6 py-3 bg-neutral-200 text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm w-full sm:w-auto text-center">
            Apply For Access
          </Link>
        </div>
      </article>
    </main>
  );
}
