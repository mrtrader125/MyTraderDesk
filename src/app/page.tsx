'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Target, Shield, Zap, TrendingUp, Globe2, BarChart3, Activity } from 'lucide-react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  // Adds a beautiful glass blur to the navbar when you start scrolling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-[#030303] text-neutral-200 min-h-screen font-sans overflow-x-hidden selection:bg-blue-500/30">
      
      {/* MASSIVE AMBIENT BLOOMS */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* STICKY GLASS NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#030303]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="font-black tracking-tight text-xl uppercase flex items-center whitespace-nowrap text-white group cursor-pointer">
            <span className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:drop-shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all duration-500">
              MY
            </span>
            <span className="ml-1.5">TRADER DESK</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-neutral-400 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/signup" className="px-6 py-2.5 text-sm font-bold bg-white text-black rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Join the Desk
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (With Staggered Animations) */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Animated Pill */}
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-[0.2em]">Institutional Analysis Floor</span>
        </div>
        
        {/* Massive Headline */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
          NEVER TRADE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-500">
            ISOLATED AGAIN.
          </span>
        </h1>
        
        <p className="mt-8 text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          Trade with absolute confluence. Access high-probability setups, expert viewpoints, and institutional-grade charting from a professional digital desk.
        </p>
        
        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <Link href="/signup" className="group flex items-center justify-center px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            Access the Floor 
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* HERO MOCKUP (This makes the page feel HUGE) */}
        <div className="w-full mt-24 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700 fill-mode-both">
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent z-10 top-1/2" />
          <div className="w-full aspect-[21/9] bg-[#0a0a0a] border border-neutral-800 rounded-t-3xl shadow-[0_-20px_80px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden relative">
            {/* Mock Header */}
            <div className="h-12 border-b border-neutral-800 flex items-center px-6 gap-2 bg-[#050505]">
              <div className="w-3 h-3 rounded-full bg-neutral-800" />
              <div className="w-3 h-3 rounded-full bg-neutral-800" />
              <div className="w-3 h-3 rounded-full bg-neutral-800" />
            </div>
            {/* Mock Body */}
            <div className="flex-1 p-8 flex gap-6 opacity-50">
              <div className="w-64 h-full border border-neutral-800 rounded-2xl bg-[#111]" />
              <div className="flex-1 h-full border border-neutral-800 rounded-2xl bg-gradient-to-br from-[#111] to-[#0a0a0a] relative overflow-hidden">
                <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-blue-500/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM BENTO BOX FEATURES */}
      <section className="relative z-10 max-w-7xl mx-auto py-32 px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">The Edge of a Prop Desk.</h2>
          <p className="text-neutral-500 mt-4 text-xl">Stop guessing. Start executing with confluence.</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Large Feature Card (Spans 2 columns on desktop) */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#111] to-[#050505] border border-neutral-800 p-10 rounded-3xl hover:border-blue-500/50 transition-colors duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-colors" />
            <Target className="w-12 h-12 text-blue-400 mb-8 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Trade Confluence</h3>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-md">
              Validate your own setups against professional floor analysis. Enter trades with the absolute confidence of a second expert opinion.
            </p>
          </div>

          {/* Tall Feature Card */}
          <div className="md:col-span-1 bg-gradient-to-br from-[#111] to-[#050505] border border-neutral-800 p-10 rounded-3xl hover:border-purple-500/50 transition-colors duration-500 group relative overflow-hidden flex flex-col justify-end">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full group-hover:bg-purple-500/10 transition-colors" />
            <Shield className="w-12 h-12 text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Risk Protection</h3>
            <p className="text-neutral-400 leading-relaxed">
              Every analysis includes precise invalidation levels to protect your capital.
            </p>
          </div>

          {/* Standard Cards */}
          <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-neutral-800 p-10 rounded-3xl hover:border-cyan-500/50 transition-colors duration-500 group">
            <Zap className="w-10 h-10 text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Institutional Setups</h3>
            <p className="text-neutral-400">Liquidity zones and key levels mapped out daily.</p>
          </div>

          <div className="md:col-span-2 bg-gradient-to-br from-[#111] to-[#050505] border border-neutral-800 p-10 rounded-3xl flex items-center justify-between group overflow-hidden relative">
            <div className="z-10">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Multiple Markets</h3>
              <p className="text-neutral-400 max-w-sm">Forex Majors, Gold, and Crypto structure analysis updated in real-time.</p>
            </div>
            <div className="flex gap-4 z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500"><Globe2 className="text-neutral-300" /></div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:-translate-y-4 transition-transform duration-500 delay-75"><TrendingUp className="text-yellow-500" /></div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500 delay-150"><BarChart3 className="text-blue-400" /></div>
            </div>
          </div>
          
        </div>
      </section>

      {/* MASSIVE CTA / FOOTER */}
      <section className="relative z-10 border-t border-neutral-900 bg-[#000] overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 blur-[150px] z-0" />
        <div className="max-w-4xl mx-auto text-center py-40 px-6 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8">
            READY TO STEP <br /> ONTO THE FLOOR?
          </h2>
          <Link href="/signup" className="inline-flex items-center justify-center px-12 py-6 bg-white text-black rounded-full font-black text-lg uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.2)]">
            Create Free Account
          </Link>
        </div>
        
        <footer className="border-t border-neutral-900 py-8 text-center text-neutral-600 text-xs font-bold uppercase tracking-widest relative z-10">
          <p>© 2026 MyTraderDesk. A Sentinel Vortex Product.</p>
        </footer>
      </section>
      
    </div>
  )
}
