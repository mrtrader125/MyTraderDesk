'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, Target, ShieldCheck, Activity, TerminalSquare, 
  ArrowRight, CheckCircle2, AlertTriangle, Zap, Users
} from 'lucide-react'

export default function BootcampPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSubmitting(true)
    
    // Simulate API call to your backend/Supabase
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1500)
  }

  return (
    <div className="bg-[#000000] text-neutral-300 min-h-screen font-sans selection:bg-blue-500/30 selection:text-white overflow-x-hidden relative">
      
      {/* Subtle Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[40%] bg-blue-600/5 blur-[150px]"></div>
      </div>

      {/* Minimalist Top Nav */}
      <nav className="relative z-10 w-full py-5 px-6 md:px-12 flex items-center justify-between border-b border-white/[0.04] bg-[#0a0a0a]/50 backdrop-blur-md">
        <Link href="/" className="flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors gap-2">
          <ArrowLeft size={14} /> Back to Terminal
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
          <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest">Applications Open</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-[900px] mx-auto px-5 sm:px-8 py-16 md:py-24 flex flex-col gap-16 md:gap-24">
        
        {/* HERO SECTION */}
        <section className="text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <Target size={24} className="text-blue-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Founding Operator <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Bootcamp</span>
          </h1>
          <p className="text-base md:text-lg text-neutral-400 max-w-2xl leading-relaxed font-medium mb-8">
            We are stress-testing the Sentinel Vortex infrastructure before public launch. We need disciplined operators to break the terminal, report the leaks, and help us refine the ultimate execution environment.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0a0a0a] border border-white/[0.04] p-2 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex-1 flex flex-col items-center sm:items-start px-4 py-2 border-r-0 sm:border-r border-white/[0.04]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Cohort Limit</span>
              <span className="text-2xl font-mono font-bold text-white">50 Operators</span>
            </div>
            <div className="flex-1 flex flex-col items-center sm:items-start px-4 py-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Program Status</span>
              <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Accepting Now
              </span>
            </div>
          </div>
        </section>

        {/* THE DEAL SECTION */}
        <section className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
          
          <h2 className="text-xl font-bold text-white tracking-tight mb-8 flex items-center gap-3">
            <TerminalSquare size={18} className="text-neutral-500" /> The Deal (What You Get)
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start">
              <div className="mt-1 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Zap size={14} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-white uppercase tracking-widest mb-2">Lifetime Discount</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Operators who complete the bootcamp phase will lock in <span className="text-white font-semibold">Founding Member pricing forever.</span> When the platform goes public at standard rates, your price never increases.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="mt-1 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck size={14} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-white uppercase tracking-widest mb-2">Unrestricted Access</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Immediate access to the Pro-Tier terminal, including MT5 sync, the Live Floor, custom vault staging, and all macro analytics modules.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start sm:col-span-2">
              <div className="mt-1 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Users size={14} className="text-purple-500" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-white uppercase tracking-widest mb-2">Direct Influence</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans max-w-2xl">
                  You will have a direct line to the development team. If a feature is slowing down your workflow, or if you need a specific metric tracked in your journal, you tell us, and we build it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EXPECTATIONS SECTION */}
        <section className="bg-[#050505] border border-white/[0.04] rounded-2xl p-6 sm:p-10">
          <h2 className="text-xl font-bold text-white tracking-tight mb-8 flex items-center gap-3">
            <Activity size={18} className="text-neutral-500" /> The Expectations (What We Need)
          </h2>
          
          <ul className="space-y-6">
            <li className="flex gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-white/[0.02]">
              <span className="font-mono text-neutral-600 font-bold mt-0.5">01</span>
              <div>
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest mb-1">Active Usage</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">You must log your daily focus, journal your trades, and sync your execution data. Dead accounts will be purged to make room for active operators.</p>
              </div>
            </li>
            <li className="flex gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-white/[0.02]">
              <span className="font-mono text-neutral-600 font-bold mt-0.5">02</span>
              <div>
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest mb-1">Brutal Honesty</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">If a feature is clunky, if the UI is confusing, or if the MT5 parser breaks on your specific broker statement, you must report it immediately.</p>
              </div>
            </li>
            <li className="flex gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-white/[0.02]">
              <span className="font-mono text-neutral-600 font-bold mt-0.5">03</span>
              <div>
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest mb-1">Discipline Over PnL</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">We do not care if you end the month in drawdown. We care that your "Perfect Execution" tag matches your actual broker data.</p>
              </div>
            </li>
          </ul>

          <div className="mt-8 p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-400/80 font-medium">
              At the end of the bootcamp phase, you will be notified. You can choose to walk away, or continue your subscription at the locked-in Founding Member rate.
            </p>
          </div>
        </section>

        {/* APPLICATION FORM */}
        <section className="text-center pt-8 border-t border-white/[0.04]">
          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-4">Secure Your Spot</h2>
          <p className="text-xs text-neutral-500 font-medium mb-8 max-w-md mx-auto">
            Drop your primary email below. If spots are still available, you will receive an invitation link with instructions to access the terminal.
          </p>

          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl max-w-md mx-auto flex flex-col items-center">
              <CheckCircle2 size={32} className="text-emerald-500 mb-4" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Application Received</h3>
              <p className="text-xs text-emerald-400/80 text-center">
                Keep an eye on your inbox. If selected, your access protocol will arrive within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-4">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..." 
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-blue-500 transition-colors shadow-inner"
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Apply For Access'} <ArrowRight size={14} />
              </button>
            </form>
          )}
        </section>

      </main>
    </div>
  )
}