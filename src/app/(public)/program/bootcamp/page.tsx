'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

export default function BootcampPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-white/10 selection:text-white">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-neutral-900 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          
          <Link
            href="/"
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-neutral-500 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft size={14} />
            Back
          </Link>

          <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-600 font-medium">
            Trader Bootcamp
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">

          <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 font-semibold">
            Professional Trader Development Program
          </span>

          <h1 className="mt-6 text-5xl md:text-6xl leading-[1.02] tracking-tight font-semibold text-white">
            Trader Bootcamp
          </h1>

          <p className="mt-8 text-lg leading-8 text-neutral-400 max-w-2xl mx-auto">
            A structured environment designed to help traders improve
            consistency through routine, execution discipline,
            behavioral tracking, and systematic decision-making.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
            
            <Link
              href="#apply"
              className="h-12 px-8 rounded-xl bg-white text-black text-[11px] uppercase tracking-[0.16em] font-semibold flex items-center justify-center hover:bg-neutral-200 transition-colors"
            >
              Apply For Cohort
            </Link>

            <div className="text-sm text-neutral-500">
              Limited intake • Guided training
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">

          <div className="border-t border-neutral-900 pt-14">
            <div className="grid lg:grid-cols-[220px_1fr] gap-10">

              <div>
                <span className="text-[11px] uppercase tracking-[0.16em] text-neutral-500 font-semibold">
                  Overview
                </span>
              </div>

              <div className="space-y-6">
                <p className="text-[15px] leading-8 text-neutral-300">
                  The Trader Bootcamp is built for traders who already
                  understand the basics of the market but struggle with
                  consistency, execution, emotional discipline, or routine.
                </p>

                <p className="text-[15px] leading-8 text-neutral-400">
                  Instead of focusing on shortcuts or signal dependency,
                  the program focuses on helping traders build a structured
                  process around analysis, execution, journaling, and review.
                </p>

                <p className="text-[15px] leading-8 text-neutral-400">
                  The goal is simple: reduce emotional decision-making and
                  develop a repeatable professional workflow.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">

          <div className="mb-12">
            <span className="text-[11px] uppercase tracking-[0.16em] text-neutral-500 font-semibold">
              What You&apos;ll Get
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-[#0B0B0B] border border-neutral-800 rounded-3xl p-7">
              <h3 className="text-xl font-medium text-white mb-4">
                Structured Routine
              </h3>

              <p className="text-sm leading-7 text-neutral-400">
                Build a repeatable weekly and daily workflow around
                market analysis, setup selection, execution,
                journaling, and review.
              </p>
            </div>

            <div className="bg-[#0B0B0B] border border-neutral-800 rounded-3xl p-7">
              <h3 className="text-xl font-medium text-white mb-4">
                Behavioral Tracking
              </h3>

              <p className="text-sm leading-7 text-neutral-400">
                Identify emotional execution problems such as
                hesitation, FOMO, revenge trading, overtrading,
                and impulsive decision-making.
              </p>
            </div>

            <div className="bg-[#0B0B0B] border border-neutral-800 rounded-3xl p-7">
              <h3 className="text-xl font-medium text-white mb-4">
                Guided Environment
              </h3>

              <p className="text-sm leading-7 text-neutral-400">
                Operate inside a structured environment focused on
                accountability, execution quality, and systematic
                trading behavior.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto border border-neutral-900 rounded-[2rem] overflow-hidden">

          <div className="grid md:grid-cols-2">

            {/* LEFT */}
            <div className="p-8 md:p-10 bg-[#080808] border-b md:border-b-0 md:border-r border-neutral-900">
              
              <h3 className="text-lg font-medium text-white mb-8">
                Ideal For
              </h3>

              <div className="space-y-5">

                <div className="flex gap-4">
                  <Check size={18} className="text-neutral-500 mt-1 shrink-0" />
                  <p className="text-sm leading-7 text-neutral-400">
                    Traders who already have a strategy but struggle with execution.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Check size={18} className="text-neutral-500 mt-1 shrink-0" />
                  <p className="text-sm leading-7 text-neutral-400">
                    Traders looking to build consistency and discipline.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Check size={18} className="text-neutral-500 mt-1 shrink-0" />
                  <p className="text-sm leading-7 text-neutral-400">
                    Traders who want a structured routine and review process.
                  </p>
                </div>

              </div>
            </div>

            {/* RIGHT */}
            <div className="p-8 md:p-10 bg-[#050505]">
              
              <h3 className="text-lg font-medium text-white mb-8">
                Not Intended For
              </h3>

              <div className="space-y-5">

                <div className="flex gap-4">
                  <div className="w-[18px] h-[18px] rounded-full border border-neutral-700 mt-1 shrink-0"></div>

                  <p className="text-sm leading-7 text-neutral-500">
                    Traders looking for signal dependency or shortcuts.
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="w-[18px] h-[18px] rounded-full border border-neutral-700 mt-1 shrink-0"></div>

                  <p className="text-sm leading-7 text-neutral-500">
                    Traders unwilling to journal or review their execution.
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="w-[18px] h-[18px] rounded-full border border-neutral-700 mt-1 shrink-0"></div>

                  <p className="text-sm leading-7 text-neutral-500">
                    Traders expecting instant profitability without process development.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* EXPECTATIONS */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">

          <div className="border-t border-neutral-900 pt-14">
            
            <div className="grid lg:grid-cols-[220px_1fr] gap-10">

              <div>
                <span className="text-[11px] uppercase tracking-[0.16em] text-neutral-500 font-semibold">
                  Program Expectations
                </span>
              </div>

              <div className="space-y-8">

                <div>
                  <h3 className="text-base font-medium text-white mb-3">
                    Consistent Participation
                  </h3>

                  <p className="text-sm leading-7 text-neutral-400">
                    Members are expected to actively participate in the
                    journaling, review, and execution process throughout the cohort.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-medium text-white mb-3">
                    Honest Self-Review
                  </h3>

                  <p className="text-sm leading-7 text-neutral-400">
                    The focus is not perfection. The focus is identifying
                    behavioral mistakes honestly and improving execution quality over time.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-medium text-white mb-3">
                    Process Over Outcomes
                  </h3>

                  <p className="text-sm leading-7 text-neutral-400">
                    The program emphasizes consistency, routine,
                    and decision-making quality rather than short-term PnL.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* APPLY */}
      <section
        id="apply"
        className="px-6 pb-28"
      >
        <div className="max-w-3xl mx-auto">

          <div className="bg-[#0B0B0B] border border-neutral-800 rounded-[2rem] p-8 md:p-12">

            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Apply For The Cohort
            </h2>

            <p className="mt-5 text-neutral-400 leading-8 max-w-xl">
              Submit your email to request access. If accepted,
              you&apos;ll receive onboarding details and next steps.
            </p>

            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 h-12 px-5 rounded-xl bg-[#050505] border border-neutral-800 text-white outline-none focus:border-neutral-600 transition-colors text-sm"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 rounded-xl bg-white text-black text-[11px] uppercase tracking-[0.16em] font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}

                  {!isSubmitting && <ArrowRight size={14} />}
                </button>
              </form>
            ) : (
              <div className="mt-10 bg-[#050505] border border-neutral-800 rounded-2xl p-6">
                
                <h3 className="text-base font-medium text-white">
                  Application Received
                </h3>

                <p className="mt-2 text-sm leading-7 text-neutral-400">
                  We&apos;ll contact you with onboarding details if space is available.
                </p>
              </div>
            )}

          </div>
        </div>
      </section>

    </div>
  )
}
