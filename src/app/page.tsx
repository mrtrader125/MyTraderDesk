'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Target, Shield, Zap, TrendingUp, Globe2, BarChart3, Activity } from 'lucide-react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans overflow-x-hidden">

      {/* Ambient Background */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="font-black text-xl uppercase flex items-center">
            <span className="bg-gradient-to-br from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              MY
            </span>
            <span className="ml-1.5">TRADER DESK</span>
          </div>

          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-700 hidden sm:block">
              Sign In
            </Link>
            <Link href="/signup" className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md">
              Request Access
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-6xl mx-auto text-center">

        <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 rounded-full px-5 py-2 mb-10 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-[0.2em]">
            Institutional Analysis Desk
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1]">
          TRADE WITH <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            STRUCTURE & CLARITY
          </span>
        </h1>

        <p className="mt-8 text-xl text-slate-600 max-w-3xl mx-auto">
          Built for traders who require discipline, structure, and clarity — not noise.
          MyTraderDesk operates as a private digital analysis floor delivering professional market perspectives.
        </p>

        {/* CTA */}
        <div className="mt-10">
          <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">
            Enter the Trading Desk
          </Link>
        </div>

        {/* TRUST BAR */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-500 font-semibold uppercase">
          <span>Structured Analysis</span>
          <span>•</span>
          <span>Multi-Market Coverage</span>
          <span>•</span>
          <span>Risk-Defined Setups</span>
        </div>

        {/* MOCKUP */}
        <div className="w-full mt-20">
          <div className="w-full aspect-[21/9] bg-white border rounded-3xl shadow-xl flex flex-col overflow-hidden">
            <div className="h-12 border-b flex items-center px-6 gap-2 bg-slate-50">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Activity className="w-24 h-24 text-blue-100" />
            </div>
          </div>
        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto py-24 px-6 text-center">
        <h2 className="text-4xl font-black mb-12">How the Desk Operates</h2>

        <div className="grid md:grid-cols-3 gap-10 text-left">
          <div>
            <h3 className="font-bold text-lg mb-2">Market Mapping</h3>
            <p className="text-slate-600">
              Liquidity zones, structure, and directional bias defined daily.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Scenario Planning</h3>
            <p className="text-slate-600">
              Multiple trade paths with confirmations and invalidations.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Execution Alignment</h3>
            <p className="text-slate-600">
              Align entries with structured logic instead of emotions.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto py-24 px-6">
        <h2 className="text-4xl font-black text-center mb-16">Professional Edge</h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <Target className="text-blue-600 mb-4" />
            <h3 className="font-bold mb-2">Trade Confluence</h3>
            <p className="text-slate-600">Validate setups with professional confirmation.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <Shield className="text-indigo-600 mb-4" />
            <h3 className="font-bold mb-2">Risk Framework</h3>
            <p className="text-slate-600">Defined invalidation levels for capital protection.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <TrendingUp className="text-emerald-600 mb-4" />
            <h3 className="font-bold mb-2">Multi-Market</h3>
            <p className="text-slate-600">Forex, Gold, Crypto coverage.</p>
          </div>

        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="max-w-5xl mx-auto py-24 px-6 text-center">
        <h2 className="text-3xl font-black mb-6">Transparency Over Hype</h2>

        <p className="text-slate-600 mb-10">
          Every analysis includes reasoning, context, and risk definition.
          No signals. No guessing.
        </p>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-3xl font-black text-blue-600">Daily</p>
            <p className="text-slate-500 text-sm">Market Coverage</p>
          </div>
          <div>
            <p className="text-3xl font-black text-blue-600">3+</p>
            <p className="text-slate-500 text-sm">Markets</p>
          </div>
          <div>
            <p className="text-3xl font-black text-blue-600">100%</p>
            <p className="text-slate-500 text-sm">Structured</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white text-center py-32 px-6">
        <h2 className="text-5xl font-black mb-6">
          STEP ONTO THE DESK
        </h2>

        <Link href="/signup" className="px-10 py-5 bg-blue-600 rounded-full font-bold uppercase hover:bg-blue-500 transition-all">
          Create Account
        </Link>

        {/* DISCLAIMER */}
        <p className="mt-8 text-xs text-slate-400 max-w-xl mx-auto">
          Trading involves risk. MyTraderDesk provides analysis and educational insights,
          not financial advice. Always manage your own risk.
        </p>
      </section>

    </div>
  )
}
