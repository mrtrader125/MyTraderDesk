import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trader Psychology And Execution Discipline | MyTraderDesk",
  description:
    "Master trader psychology by understanding dopamine cycles, revenge trading, and how to build unshakeable execution discipline.",
  alternates: {
    canonical: "/trader-psychology",
  },
};

export default function TraderPsychologyPage() {
  return (
    <main className="bg-[#050505] text-white min-h-screen selection:bg-blue-900 selection:text-white">
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-bold mb-6">
          Protocol 03 // Trader Psychology
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
          Trader Psychology And Execution Discipline
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Your edge means nothing if your mind overrides your system. Execution discipline requires reprogramming how you process fear, loss, and dopamine.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            The Mechanics of Emotional Trading
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              Emotional trading is a biological response, not a lack of intelligence. It is driven by dopamine cycles seeking validation and the amygdala perceiving market losses as physical threats. Understanding this allows you to detach your identity from the outcome of a single trade.
            </p>
          </div>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Revenge Trading & Fear After Losses
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              Revenge trading is the ego attempting to immediately correct a perceived injustice. Conversely, fear after a loss leads to hesitation, causing you to miss high-probability setups. Both stem from a lack of acceptance regarding market randomness.
            </p>
            <Link href="/behavioral-journaling" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-900 hover:border-blue-300">
              Learn how to track these emotional states →
            </Link>
          </div>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Behavioral Awareness & Identity
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              Discipline is an identity shift. You must view yourself as a system operator, not a gambler. Emotional pattern recognition—identifying the physiological signs of tilt before you break a rule—is the highest level of trader psychology.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-neutral-900 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Take Control Of Your Execution
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            MyTraderDesk tracks your discipline so you can focus on execution.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors duration-200">
              Apply For Access
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}