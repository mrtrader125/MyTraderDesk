import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trading Discipline Is An Engineering Problem | MyTraderDesk",
  description: "Trading discipline is not about motivation. It is about building hard behavioral guardrails and unshakeable operational routines.",
  alternates: { canonical: "/trading-discipline" }
};

export default function TradingDisciplinePage() {
  return (
    <main className="bg-[#050505] text-white min-h-screen selection:bg-blue-900 selection:text-white">
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-bold mb-6">Protocol 08 // Discipline</p>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">Trading Discipline Is An Engineering Problem</h1>
        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Stop relying on motivation. Consistent profitability requires hard behavioral guardrails and unshakeable operational routines.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">The Anti-Guru Reality</h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>Listening to motivational podcasts will not stop you from revenge trading. Reading trading psychology books will not stop you from moving your stop loss. Discipline is not a mindset; it is an engineered framework.</p>
          </div>
          <blockquote className="mt-8 border-l-2 border-blue-500 pl-6 py-2">
            <p className="text-lg text-neutral-200 italic">"You do not rise to the level of your goals. You fall to the level of your systems."</p>
          </blockquote>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">The "Missed Prep" Red Flag</h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>The first sign of a discipline collapse is skipping the routine. If you sit down at the terminal and execute a trade without completing your pre-market checklist, you are already trading on tilt.</p>
            <Link href="/trading-routine" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 border-b border-blue-900">Review the routine protocol →</Link>
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
