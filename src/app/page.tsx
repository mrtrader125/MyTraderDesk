'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Target, Shield, TrendingUp, Brain, CheckCircle2 } from 'lucide-react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans overflow-x-hidden">

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="font-black text-xl uppercase">
            MY TRADER DESK
          </div>

          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-700 hidden sm:block">
              Sign In
            </Link>
            <Link href="/signup" className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md">
              Get Access
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-40 pb-24 px-6 max-w-6xl mx-auto text-center">

        <h1 className="text-5xl md:text-7xl font-black leading-tight">
          Stop Second Guessing.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Start Executing With Clarity.
          </span>
        </h1>

        <p className="mt-8 text-xl text-slate-600 max-w-2xl mx-auto">
          You already know how to trade. The real problem is hesitation.
          MyTraderDesk helps you validate your analysis, remove doubt, and execute with confidence.
        </p>

        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg">
            Join the Desk
          </Link>
          <Link href="#how" className="px-8 py-4 border border-slate-300 rounded-full font-bold hover:bg-slate-100 transition">
            See How It Works
          </Link>
        </div>

      </section>

      {/* PROBLEM SECTION */}
      <section className="max-w-5xl mx-auto py-20 px-6 text-center">
        <h2 className="text-4xl font-black mb-6">The Real Problem Traders Face</h2>

        <p className="text-slate-600 text-lg max-w-3xl mx-auto">
          It's not strategy. It's not entries. It's not indicators.
          <br /><br />
          It's the constant doubt:
        </p>

        <div className="mt-8 space-y-4 text-xl font-semibold">
          <p>“Is my analysis correct?”</p>
          <p>“What if I’m wrong?”</p>
        </div>

        <p className="mt-8 text-slate-600 max-w-2xl mx-auto">
          This hesitation leads to missed trades, early exits, and inconsistent results.
        </p>
      </section>

      {/* SOLUTION */}
      <section id="how" className="max-w-6xl mx-auto py-24 px-6">
        <h2 className="text-4xl font-black text-center mb-16">How MyTraderDesk Fixes This</h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <Brain className="text-blue-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Perspective</h3>
            <p className="text-slate-600">
              Compare your analysis with structured market perspectives.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <CheckCircle2 className="text-green-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Validation</h3>
            <p className="text-slate-600">
              When your idea aligns, you execute with confidence.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <Shield className="text-indigo-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Risk Control</h3>
            <p className="text-slate-600">
              When it doesn’t align, reduce risk or stay out.
            </p>
          </div>

        </div>
      </section>

      {/* OUTCOME */}
      <section className="max-w-5xl mx-auto py-20 px-6 text-center">
        <h2 className="text-4xl font-black mb-6">What Changes For You</h2>

        <div className="grid md:grid-cols-3 gap-6 mt-10 text-left">

          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold mb-2">Clarity</h3>
            <p className="text-slate-600">No more overthinking every trade.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold mb-2">Confidence</h3>
            <p className="text-slate-600">Execute trades without hesitation.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold mb-2">Consistency</h3>
            <p className="text-slate-600">Improve results with structured decisions.</p>
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-slate-900 text-white text-center py-28 px-6">
        <h2 className="text-5xl font-black mb-6">
          Trade Without Doubt
        </h2>

        <p className="text-slate-400 mb-10 max-w-xl mx-auto">
          Stop guessing. Start executing with a clear, structured approach.
        </p>

        <Link href="/signup" className="px-10 py-5 bg-blue-600 rounded-full font-bold hover:bg-blue-500 transition-all">
          Join MyTraderDesk
        </Link>

        <p className="mt-8 text-xs text-slate-500 max-w-xl mx-auto">
          Not financial advice. Always manage your own risk.
        </p>
      </section>

    </div>
  )
}
