import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Behavioral Journaling For Traders | MyTraderDesk",
  description: "Move beyond simple PnL tracking. Learn how to log emotional patterns, psychological leakage, and execution mistakes to find your edge.",
  alternates: { canonical: "/behavioral-journaling" }
};

export default function BehavioralJournalingPage() {
  return (
    <main className="flex-grow">
      <article className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-4">
            <span>Protocol_05</span>
            <span className="text-neutral-700">/</span>
            <span>Journaling</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-4">Behavioral Journaling For Traders</h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Standard journals log numbers. Operational journals log human behavior. Identifying your emotional patterns is the fastest way to fix psychological leakage.
          </p>
        </header>

        <div className="w-full h-px bg-neutral-900 mb-8"></div>

        <div className="space-y-8 text-[13px] sm:text-sm text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Moving Beyond PnL</h2>
            <p className="mb-3">Judging your trading by profit and loss alone reinforces outcome bias. You can execute a terrible trade and make money, or execute a perfect trade and lose. Behavioral journaling focuses entirely on how strictly you followed your process, regardless of the financial result.</p>
            <div className="border-l border-blue-900/50 pl-4 py-1 my-5 bg-blue-950/10 rounded-r-sm">
              <p className="text-blue-400/80 font-mono text-xs tracking-tight">
                {">"} "Data solves emotion. If you track the behavior, you can eliminate the mistake."
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-medium text-neutral-200 mb-2 tracking-tight">Tracking Psychological Leakage</h2>
            <p className="mb-3">Psychological leakage occurs when unaddressed emotions slowly degrade your execution. By tagging trades with your emotional state (e.g., Anxious, Bored, Overconfident), you build a matrix of discipline analytics. You will quickly see which emotions correlate with your largest drawdowns.</p>
            <div className="mt-4 p-4 border border-neutral-900 rounded-md bg-[#080808]">
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono mb-3">Tactical Checklist // Behavioral Logging</p>
              <ul className="space-y-2 text-neutral-300 font-mono text-[11px] sm:text-xs">
                <li>- Pre-Trade Emotional State</li>
                <li>- Mid-Trade Management Deviations</li>
                <li>- Post-Trade Clarity Check</li>
                <li>- Execution Grade (A, B, C, F)</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="w-full h-px bg-neutral-900 my-10"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#080808] border border-neutral-900 p-5 rounded-md gap-4 shadow-lg shadow-black/50">
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Audit Your Execution</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Track behavior, not just PnL.</p>
          </div>
          <Link href="/apply" className="px-6 py-3 bg-neutral-200 text-[#050505] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm w-full sm:w-auto text-center">
            Apply For Access
          </Link>
        </div>
      </article>
    </main>
  );
}
