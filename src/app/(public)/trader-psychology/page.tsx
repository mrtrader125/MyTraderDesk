import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trader Psychology And Execution Discipline | MyTraderDesk",
  description: "Master trader psychology by understanding dopamine cycles, revenge trading, and how to build unshakeable execution discipline.",
  alternates: { canonical: "/trader-psychology" }
};

export default function TraderPsychologyPage() {
  return (
    <main className="flex-grow">
      <article className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-4">
            <span>Protocol_03</span>
            <span className="text-neutral-700">/</span>
            <span>Trader Psychology</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-4">Trader Psychology And Execution Discipline</h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Your edge means nothing if your mind overrides your system. Execution discipline requires reprogramming how you process fear, loss, and dopamine.
          </p>
        </header>

        <div className="w-full h-px bg-neutral-900 mb-8"></div>

        <div className="space-y-8 text-[13px] sm:text-sm text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">The Mechanics of Emotional Trading</h2>
            <p>Emotional trading is a biological response, not a lack of intelligence. It is driven by dopamine cycles seeking validation and the amygdala perceiving market losses as physical threats. Understanding this allows you to detach your identity from the outcome of a single trade.</p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Revenge Trading & Fear After Losses</h2>
            <p className="mb-3">Revenge trading is the ego attempting to immediately correct a perceived injustice. Conversely, fear after a loss leads to hesitation, causing you to miss high-probability setups. Both stem from a lack of acceptance regarding market randomness.</p>
            <Link href="/behavioral-journaling" className="inline-block mt-2 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-900/50 hover:border-blue-400">Learn how to track emotional states -{">"}</Link>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Behavioral Awareness & Identity</h2>
            <p>Discipline is an identity shift. You must view yourself as a system operator, not a gambler. Emotional pattern recognition—identifying the physiological signs of tilt before you break a rule—is the highest level of trader psychology.</p>
          </section>
        </div>

        <div className="w-full h-px bg-neutral-900 my-10"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#080808] border border-neutral-900 p-5 rounded-md gap-4 shadow-lg shadow-black/50">
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Take Control Of Your Execution</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Track discipline to focus on execution.</p>
          </div>
          <Link href="/apply" className="px-6 py-3 bg-neutral-200 text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm w-full sm:w-auto text-center">
            Apply For Access
          </Link>
        </div>
      </article>
    </main>
  );
}
