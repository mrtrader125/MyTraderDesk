import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Behavioral Journaling For Traders | MyTraderDesk",
  description:
    "Move beyond simple PnL tracking. Learn how to log emotional patterns, psychological leakage, and execution mistakes to find your edge.",
  alternates: {
    canonical: "/behavioral-journaling",
  },
};

export default function BehavioralJournalingPage() {
  return (
    <main className="bg-[#050505] text-white min-h-screen selection:bg-blue-900 selection:text-white">
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blue-500 font-bold mb-6">
          Protocol 05 // Behavioral Journaling
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
          Behavioral Journaling For Traders
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Standard journals log numbers. Operational journals log human behavior. Identifying your emotional patterns is the fastest way to fix psychological leakage.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Moving Beyond PnL
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed">
            <p>
              Judging your trading by profit and loss alone reinforces outcome bias. You can execute a terrible trade and make money, or execute a perfect trade and lose. Behavioral journaling focuses entirely on how strictly you followed your process, regardless of the financial result.
            </p>
          </div>
          
          <blockquote className="mt-8 border-l-2 border-blue-500 pl-6 py-2">
            <p className="text-lg text-neutral-200 italic">
              "Data solves emotion. If you track the behavior, you can eliminate the mistake."
            </p>
          </blockquote>
        </div>

        <div className="border border-neutral-800 bg-[#080808] rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            Tracking Psychological Leakage
          </h2>
          <div className="space-y-4 text-neutral-400 leading-relaxed mb-8">
            <p>
              Psychological leakage occurs when unaddressed emotions slowly degrade your execution. By tagging trades with your emotional state (e.g., Anxious, Bored, Overconfident), you build a matrix of discipline analytics. You will quickly see which emotions correlate with your largest drawdowns.
            </p>
          </div>

          <div className="bg-[#050505] border border-neutral-900 rounded-xl p-6">
            <p className="text-xs uppercase tracking-widest text-blue-500 font-bold mb-4">Tactical Checklist // Behavioral Logging</p>
            <ul className="space-y-3 text-sm text-neutral-300 font-mono">
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Pre-Trade Emotional State</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Mid-Trade Management Deviations</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Post-Trade Clarity Check</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-neutral-700"></span> Execution Grade (A, B, C, F)</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-neutral-900 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Audit Your Execution
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
            Stop guessing why you are inconsistent. Track your behavior with MyTraderDesk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors duration-200">
              Apply For Access
            </button>
            <Link href="/" className="px-8 py-3 border border-neutral-700 text-white font-medium rounded-lg hover:bg-neutral-900 transition-colors duration-200">
              Return to Homepage
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}