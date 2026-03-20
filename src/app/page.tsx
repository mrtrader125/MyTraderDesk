'use client'

import Link from 'next/link'
import { ArrowRight, Target, Shield, Zap, TrendingUp, Globe2, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-[#050505] text-neutral-200 min-h-screen font-sans overflow-hidden relative">
      
      {/* Background Depth Blooms (Matches the Dashboard) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="font-black tracking-tight text-xl uppercase flex items-center whitespace-nowrap text-white">
          <span className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
            MY
          </span>
          <span className="ml-1.5">TRADER DESK</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-neutral-400 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/signup" className="px-5 py-2.5 text-sm font-bold bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Join the Desk
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 text-center py-32 px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-[#0a0a0a] border border-neutral-800 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Powered by Sentinel Vortex</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight">
          NEVER TRADE <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-600">ISOLATED AGAIN.</span>
        </h1>
        
        <p className="mt-8 text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed">
          Trade with absolute confluence. Join a professional digital trading floor to access high-probability market analysis, expert viewpoints, and institutional-grade setups.
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/signup" className="flex items-center justify-center px-8 py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            Access the Floor <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link href="/markets" className="flex items-center justify-center px-8 py-4 bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl font-bold hover:bg-neutral-900 transition-colors">
            View Public Analysis
          </Link>
        </div>
      </section>

      {/* THE EDGE SECTION (Features) */}
      <section className="relative z-10 max-w-7xl mx-auto py-24 px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">The Edge of a Prop Desk.</h2>
          <p className="text-neutral-500 mt-4">Why serious traders rely on our analysis.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#0a0a0a] border border-neutral-800/50 p-8 rounded-2xl hover:border-blue-500/30 transition-colors group">
            <Target className="w-10 h-10 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Trade Confluence</h3>
            <p className="text-neutral-400 mt-3 leading-relaxed">
              Validate your own setups against professional floor analysis. Enter trades with the confidence of a second expert opinion.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-neutral-800/50 p-8 rounded-2xl hover:border-purple-500/30 transition-colors group">
            <Zap className="w-10 h-10 text-purple-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Institutional Setups</h3>
            <p className="text-neutral-400 mt-3 leading-relaxed">
              Clear charting with highly precise key levels, liquidity zones, and invalidation points mapped out daily.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-neutral-800/50 p-8 rounded-2xl hover:border-cyan-500/30 transition-colors group">
            <Shield className="w-10 h-10 text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Risk Management</h3>
            <p className="text-neutral-400 mt-3 leading-relaxed">
              Every piece of analysis includes structured risk parameters to protect your capital in volatile conditions.
            </p>
          </div>
        </div>
      </section>

      {/* MARKETS COVERED */}
      <section className="relative z-10 bg-[#0a0a0a] border-y border-neutral-800/50 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-16">Markets We Dominate</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#111] border border-neutral-800 flex items-center justify-center mb-6">
                <Globe2 className="text-neutral-300 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Forex Majors</h3>
              <p className="text-neutral-500">EURUSD, GBPUSD, & JPY crosses.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#111] border border-neutral-800 flex items-center justify-center mb-6">
                <TrendingUp className="text-yellow-500 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Commodities</h3>
              <p className="text-neutral-500">XAUUSD (Gold) & WTI Crude.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#111] border border-neutral-800 flex items-center justify-center mb-6">
                <BarChart3 className="text-blue-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Crypto Assets</h3>
              <p className="text-neutral-500">BTC, ETH & High-Cap Altcoins.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / FOOTER */}
      <section className="relative z-10 text-center py-32 px-6 max-w-3xl mx-auto">
        <h2 className="text-4xl font-black text-white tracking-tight mb-6">
          Ready to step onto the floor?
        </h2>
        <p className="text-neutral-400 text-lg mb-10">
          Stop guessing. Start executing with institutional precision today.
        </p>
        <Link href="/signup" className="inline-flex items-center justify-center px-10 py-5 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]">
          Create Free Account
        </Link>
      </section>

      <footer className="relative z-10 border-t border-neutral-900 bg-[#030303] py-8 text-center text-neutral-600 text-sm font-bold uppercase tracking-widest">
        <p>© 2026 MyTraderDesk. A Sentinel Vortex Product.</p>
      </footer>
    </div>
  )
}
