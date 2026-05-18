import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock3,
  Shield,
  Brain,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trading Routines Used By Consistent Traders | MyTraderDesk",
  description:
    "Discover the exact pre-market, execution, and review systems professional traders use to eliminate emotional randomness and maintain discipline.",
  alternates: {
    canonical: "/trading-routine",
  },
};

const timeline = [
  {
    time: "06:30",
    title: "Pre-Market Analysis",
    description:
      "Review higher timeframe structure, liquidity zones, macro events, and session conditions.",
  },
  {
    time: "07:15",
    title: "Execution Planning",
    description:
      "Define invalidation levels, risk parameters, and exact execution conditions before the market opens.",
  },
  {
    time: "08:00",
    title: "Execution Window",
    description:
      "Operate only during your predefined trading session. No impulsive chart watching.",
  },
  {
    time: "10:30",
    title: "Post-Session Review",
    description:
      "Grade execution quality, emotional discipline, and adherence to system rules.",
  },
];

export default function TradingRoutinePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[45%] bg-blue-600/10 blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[45%] h-[45%] bg-neutral-600/5 blur-[160px]" />
      </div>

      <article className="relative z-10 max-w-[1400px] mx-auto px-5 md:px-10 lg:px-14 pt-32 pb-24">
        {/* HERO */}
        <section className="border border-neutral-900 bg-[#080808]/80 backdrop-blur-xl rounded-[32px] overflow-hidden">
          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-0">
            {/* LEFT */}
            <div className="p-8 md:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-neutral-900">
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-[10px] uppercase tracking-[0.25em] font-bold text-blue-400">
                  Protocol 02
                </div>

                <div className="px-3 py-1 rounded-full border border-neutral-800 bg-[#0f0f0f] text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500">
                  Operations
                </div>

                <div className="px-3 py-1 rounded-full border border-neutral-800 bg-[#0f0f0f] text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500">
                  8 Min Read
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] max-w-4xl">
                Trading Routines Used By
                <span className="block text-blue-500 mt-2">
                  Consistent Traders.
                </span>
              </h1>

              <p className="mt-8 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-3xl">
                Amateurs react emotionally to the market. Professionals operate
                on systems, routines, timing windows, and predefined execution
                structures.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/apply"
                  className="px-7 py-4 bg-blue-600 hover:bg-blue-500 transition-all rounded-2xl text-[11px] uppercase tracking-[0.25em] font-extrabold"
                >
                  Build Your Routine
                </Link>

                <Link
                  href="/trading-consistency"
                  className="px-7 py-4 border border-neutral-800 hover:border-neutral-700 bg-[#0b0b0b] rounded-2xl text-[11px] uppercase tracking-[0.25em] font-extrabold text-neutral-300 transition-all"
                >
                  Trading Consistency
                </Link>
              </div>
            </div>

            {/* RIGHT */}
            <div className="p-8 md:p-10 lg:p-12 bg-gradient-to-b from-[#0b0b0b] to-[#050505] flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold mb-8">
                  Operational Structure
                </div>

                <div className="space-y-5">
                  <div className="border border-neutral-900 bg-[#0d0d0d] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock3 className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-bold">
                        Session Timing
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      Predefined execution windows eliminate random decision
                      making and reduce emotional fatigue.
                    </p>
                  </div>

                  <div className="border border-neutral-900 bg-[#0d0d0d] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-cyan-500" />
                      <span className="text-sm font-bold">
                        Risk Containment
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      Daily loss limits and execution rules protect traders from
                      tilt and revenge trading.
                    </p>
                  </div>

                  <div className="border border-neutral-900 bg-[#0d0d0d] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Brain className="w-5 h-5 text-rose-500" />
                      <span className="text-sm font-bold">
                        Psychological Stability
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      Routines reduce cognitive overload and stabilize execution
                      behavior across sessions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 border border-blue-500/10 bg-blue-500/5 rounded-2xl p-5">
                <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-bold mb-3">
                  Core Principle
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                  “The market is chaotic. Your routine is the only controlled
                  variable.”
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="mt-24">
          <div className="flex items-end justify-between gap-8 mb-12">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold mb-4">
                Daily Workflow
              </div>

              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
                The Daily
                <span className="block text-blue-500 mt-2">
                  Execution Cycle
                </span>
              </h2>
            </div>

            <div className="hidden lg:block max-w-md text-right text-neutral-500 text-sm leading-relaxed">
              Consistency is not built through motivation. It is built through
              repeatable operational structure.
            </div>
          </div>

          <div className="space-y-6">
            {timeline.map((item, index) => (
              <div
                key={index}
                className="group grid md:grid-cols-[160px_1fr] border border-neutral-900 rounded-3xl overflow-hidden hover:border-neutral-800 transition-all"
              >
                <div className="bg-[#0b0b0b] p-8 border-b md:border-b-0 md:border-r border-neutral-900 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-black tracking-tight text-blue-500">
                    {item.time}
                  </span>
                </div>

                <div className="p-8 md:p-10 bg-[#080808] group-hover:bg-[#0b0b0b] transition-all">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 tracking-tight">
                        {item.title}
                      </h3>

                      <p className="text-neutral-400 leading-relaxed max-w-3xl">
                        {item.description}
                      </p>
                    </div>

                    <div className="hidden md:flex w-12 h-12 rounded-2xl border border-neutral-800 items-center justify-center bg-[#111]">
                      <ArrowRight className="w-5 h-5 text-neutral-500" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SYSTEM GRID */}
        <section className="mt-24 grid lg:grid-cols-2 gap-8">
          <div className="border border-neutral-900 rounded-[28px] bg-[#080808] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <h3 className="text-2xl font-black tracking-tight">
                Why Most Traders Fail
              </h3>
            </div>

            <div className="space-y-5 text-neutral-400 leading-relaxed">
              <p>
                Most traders operate without structure. They wake up without a
                predefined execution plan, stare at charts for hours, react to
                random movement, and eventually enter low-quality trades.
              </p>

              <p>
                The result is decision fatigue, emotional instability, and
                inconsistent execution behavior.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                "Overtrading after boredom",
                "Revenge trading after losses",
                "No predefined session windows",
                "Lack of execution review systems",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 border border-neutral-900 rounded-2xl p-4 bg-[#0b0b0b]"
                >
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span className="text-sm text-neutral-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-blue-500/10 rounded-[28px] bg-gradient-to-b from-blue-500/5 to-transparent p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h3 className="text-2xl font-black tracking-tight">
                Professional Response
              </h3>
            </div>

            <div className="space-y-5 text-neutral-300 leading-relaxed">
              <p>
                Consistent traders remove unnecessary decisions from the trading
                process. Their environment, timing, risk, and execution criteria
                are predefined.
              </p>

              <p>
                This transforms trading from emotional reaction into structured
                operational execution.
              </p>
            </div>

            <div className="mt-8 grid gap-4">
              {[
                "Pre-market preparation systems",
                "Defined execution windows",
                "Hard daily risk limits",
                "Behavioral journaling",
                "Post-session execution grading",
              ].map((item) => (
                <div
                  key={item}
                  className="border border-blue-500/10 bg-[#0b0b0b]/80 rounded-2xl px-5 py-4 text-sm text-neutral-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 border border-neutral-900 rounded-[32px] bg-[#080808] overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-center p-10 md:p-14">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-bold mb-5">
                Execution Infrastructure
              </div>

              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none max-w-3xl">
                Build A Trading Environment
                <span className="block text-blue-500 mt-2">
                  Designed For Discipline.
                </span>
              </h2>

              <p className="mt-6 text-neutral-400 max-w-2xl leading-relaxed text-lg">
                MyTraderDesk helps traders structure routines, track execution
                quality, monitor behavioral patterns, and systematize
                consistency.
              </p>
            </div>

            <div className="flex flex-col gap-4 min-w-[240px]">
              <Link
                href="/apply"
                className="px-8 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-center text-[11px] uppercase tracking-[0.25em] font-extrabold transition-all"
              >
                Apply For Access
              </Link>

              <Link
                href="/protocol/system"
                className="px-8 py-5 border border-neutral-800 hover:border-neutral-700 bg-[#0b0b0b] rounded-2xl text-center text-[11px] uppercase tracking-[0.25em] font-extrabold text-neutral-300 transition-all"
              >
                Explore The System
              </Link>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
