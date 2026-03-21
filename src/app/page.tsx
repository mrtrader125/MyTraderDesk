'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Brain, CheckCircle2, Shield, BarChart3 } from 'lucide-react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="font-black text-xl uppercase tracking-wide">MY TRADER DESK</div>
          <Link href="/signup" className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow">
            Get Instant Access
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-40 pb-24 px-6 max-w-6xl mx-auto text-center">

        <p className="text-sm uppercase tracking-widest text-blue-600 font-bold mb-4">
          For traders stuck in hesitation
        </p>

        <h1 className="text-5xl md:text-7xl font-black leading-tight">
          Stop Second Guessing.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Execute With Clarity.
          </span>
        </h1>

        <p className="mt-8 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          You already know how to analyze the market.
          <br />
          The problem is trusting your decisions.
          <br /><br />
          MyTraderDesk helps you validate your thinking so you can trade without hesitation.
        </p>

        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 shadow-lg">
            Start Trading With Clarity
          </Link>
          <Link href="#proof" className="px-8 py-4 border border-slate-300 rounded-full font-bold hover:bg-slate-100">
            See How It Works
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          No signals • No hype • Just structured analysis
        </p>

      </section>

      {/* PROBLEM */}
      <section className="max-w-5xl mx-auto py-20 px-6 text-center">
        <h2 className="text-4xl font-black mb-6">You’re Not a Beginner Anymore</h2>

        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          You know entries. You know structure. You know risk.
          <br /><br />
          But when it’s time to execute...
        </p>

        <div className="mt-8 text-xl font-semibold space-y-3">
          <p>“Is this actually right?”</p>
          <p>“What if I’m wrong?”</p>
        </div>

        <p className="mt-8 text-slate-600 max-w-xl mx-auto">
          That hesitation is what keeps you stuck — not your strategy.
        </p>
      </section>

      {/* SOLUTION */}
      <section className="max-w-6xl mx-auto py-24 px-6">
        <h2 className="text-4xl font-black text-center mb-16">A Structured Way To Validate Your Trades</h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white p-8 rounded-2xl border hover:shadow-md transition">
            <Brain className="mb-4 text-blue-600" />
            <h3 className="font-bold mb-2">Clear Perspective</h3>
            <p className="text-slate-600">
              Understand the market bias before you enter.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border hover:shadow-md transition">
            <CheckCircle2 className="mb-4 text-green-600" />
            <h3 className="font-bold mb-2">Trade Validation</h3>
            <p className="text-slate-600">
              Align your idea with structured analysis.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border hover:shadow-md transition">
            <Shield className="mb-4 text-indigo-600" />
            <h3 className="font-bold mb-2">Controlled Risk</h3>
            <p className="text-slate-600">
              Reduce risk when setups don’t align.
            </p>
          </div>

        </div>
      </section>

      {/* PROOF */}
      <section id="proof" className="max-w-6xl mx-auto py-24 px-6">
        <h2 className="text-4xl font-black text-center mb-12">This Is How We Think</h2>

        <div className="grid md:grid-cols-2 gap-8">

          <div className="bg-white p-6 rounded-xl border">
            <div className="h-52 bg-slate-100 rounded mb-4 flex items-center justify-center">
              <BarChart3 className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-600">
              Market structure, liquidity zones, bias, and invalidation — everything defined before execution.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold mb-4">What Changes</h3>
            <div className="space-y-2 text-slate-600">
              <p>❌ Second guessing every entry</p>
              <p>❌ Emotional decision making</p>
              <p className="pt-3">✅ Clear directional bias</p>
              <p>✅ Confident execution</p>
              <p>✅ Defined risk on every trade</p>
            </div>
          </div>

        </div>
      </section>

      {/* VISUAL */}
      <section className="max-w-6xl mx-auto py-24 px-6 text-center">
        <h2 className="text-4xl font-black mb-6">Inside The Desk</h2>
        <p className="text-slate-600 mb-10">A clean, structured environment built for decision clarity.</p>

        <div className="w-full h-72 bg-white border rounded-2xl flex items-center justify-center shadow-sm">
          <p className="text-slate-400">Dashboard Preview</p>
        </div>
      </section>

      {/* PRICING */}
      <section className="max-w-6xl mx-auto py-24 px-6">
        <h2 className="text-4xl font-black text-center mb-16">Choose Your Access Level</h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-8 rounded-xl border">
            <h3 className="font-bold">Starter</h3>
            <p className="text-2xl font-black my-4">$5/mo</p>
            <p className="text-slate-600">Basic structured analysis</p>
          </div>

          <div className="bg-white p-8 rounded-xl border-2 border-blue-600 relative shadow-lg">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
              MOST POPULAR
            </span>
            <h3 className="font-bold">Pro</h3>
            <p className="text-2xl font-black my-4">$10/mo</p>
            <p className="text-slate-600">Full analysis + trade scenarios + priority updates</p>
          </div>

          <div className="bg-white p-8 rounded-xl border">
            <h3 className="font-bold">Elite</h3>
            <p className="text-2xl font-black my-4">$100/yr</p>
            <p className="text-slate-600">All features + deeper insights</p>
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-slate-900 text-white text-center py-28 px-6">
        <h2 className="text-5xl font-black mb-6">Stop Guessing Your Trades</h2>
        <p className="text-slate-400 mb-10">Start executing with structure and confidence.</p>

        <Link href="/signup" className="px-10 py-5 bg-blue-600 rounded-full font-bold hover:bg-blue-500 shadow-lg">
          Get Instant Access
        </Link>

        <p className="mt-6 text-xs text-slate-500">Trading involves risk. Not financial advice.</p>
      </section>

    </div>
  )
}
