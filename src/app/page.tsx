'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Target, Shield, Zap, TrendingUp, Globe2, BarChart3, Activity } from 'lucide-react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  // Glass blur for navbar on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* SUBTLE AMBIENT BLOOMS (Professional & Soft) */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* STICKY GLASS NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="font-black tracking-tight text-xl uppercase flex items-center whitespace-nowrap text-slate-900 group cursor-pointer">
            {/* Refined Institutional Logo Gradient */}
            <span className="bg-gradient-to-br from-blue-700 to-indigo-700 bg-clip-text text-transparent transition-all duration-500">
              MY
            </span>
            <span className="ml-1.5">TRADER DESK</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-700 transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/signup" className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:scale-105 transition-all shadow-md shadow-blue-600/20">
              Join the Desk
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Animated Pill */}
        <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 shadow-sm rounded-full px-5 py-2 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-[0.2em]">Institutional Analysis Floor</span>
        </div>
        
        {/* Massive Headline */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
          NEVER TRADE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            ISOLATED AGAIN.
          </span>
        </h1>
        
        <p className="mt-8 text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          Trade with absolute confluence. Access high-probability setups, expert viewpoints, and institutional-grade charting from a professional digital desk.
        </p>
        
        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <Link href="/signup" className="group flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-full font-bold uppercase tracking-widest hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-600/25">
            Access the Floor 
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* HERO MOCKUP (Clean, Light UI) */}
        <div className="w-full mt-24 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700 fill-mode-both">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10 top-1/2" />
          <div className="w-full aspect-[21/9] bg-white border border-slate-200 rounded-t-3xl shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden relative">
            {/* Mock Header */}
            <div className="h-12 border-b border-slate-100 flex items-center px-6 gap-2 bg-slate-50">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
            </div>
            {/* Mock Body */}
            <div className="flex-1 p-8 flex gap-6 opacity-70">
              <div className="w-64 h-full border border-slate-100 rounded-2xl bg-slate-50" />
              <div className="flex-1 h-full border border-slate-100 rounded-2xl bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
                <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-blue-100" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM BENTO BOX FEATURES (Light Theme) */}
      <section className="relative z-10 max-w-7xl mx-auto py-32 px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">The Edge of a Prop Desk.</h2>
          <p className="text-slate-600 mt-4 text-xl">Stop guessing. Start executing with confluence.</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Large Feature Card */}
          <div className="md:col-span-2 bg-white border border-slate-200 shadow-sm hover:shadow-md p-10 rounded-3xl hover:border-blue-300 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 blur-[100px] rounded-full transition-colors" />
            <Target className="w-12 h-12 text-blue-600 mb-8 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Trade Confluence</h3>
            <p className="text-slate-600 text-lg leading-relaxed max-w-md">
              Validate your own setups against professional floor analysis. Enter trades with the absolute confidence of a second expert opinion.
            </p>
          </div>

          {/* Tall Feature Card */}
          <div className="md:col-span-1 bg-white border border-slate-200 shadow-sm hover:shadow-md p-10 rounded-3xl hover:border-indigo-300 transition-all duration-500 group relative overflow-hidden flex flex-col justify-end">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 blur-[100px] rounded-full transition-colors" />
            <Shield className="w-12 h-12 text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Risk Protection</h3>
            <p className="text-slate-600 leading-relaxed">
              Every analysis includes precise invalidation levels to protect your capital.
            </p>
          </div>

          {/* Standard Cards */}
          <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md p-10 rounded-3xl hover:border-emerald-300 transition-all duration-500 group">
            <Zap className="w-10 h-10 text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3">Institutional Setups</h3>
            <p className="text-slate-600">Liquidity zones and key levels mapped out daily.</p>
          </div>

          <div className="md:col-span-2 bg-white border border-slate-200 shadow-sm hover:shadow-md p-10 rounded-3xl flex items-center justify-between group overflow-hidden relative">
            <div className="z-10">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Multiple Markets</h3>
              <p className="text-slate-600 max-w-sm">Forex Majors, Gold, and Crypto structure analysis updated in real-time.</p>
            </div>
            <div className="flex gap-4 z-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500 shadow-sm"><Globe2 className="text-blue-600" /></div>
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:-translate-y-4 transition-transform duration-500 delay-75 shadow-sm"><TrendingUp className="text-emerald-600" /></div>
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500 delay-150 shadow-sm"><BarChart3 className="text-indigo-600" /></div>
            </div>
          </div>
          
        </div>
      </section>

      {/* MASSIVE CTA / FOOTER (Deep Navy to ground the page) */}
      <section className="relative z-10 border-t border-slate-200 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 blur-[150px] z-0" />
        <div className="max-w-4xl mx-auto text-center py-40 px-6 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8">
            READY TO STEP <br /> ONTO THE FLOOR?
          </h2>
          <Link href="/signup" className="inline-flex items-center justify-center px-12 py-6 bg-blue-600 text-white rounded-full font-black text-lg uppercase tracking-widest hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-600/20">
            Create Free Account
          </Link>
        </div>
        
        <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest relative z-10">
          <p>© 2026 MyTraderDesk. A Sentinel Vortex Product.</p>
        </footer>
      </section>
      
    </div>
  )
}
