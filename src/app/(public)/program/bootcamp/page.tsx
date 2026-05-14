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
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1000)
  }

  return (
    <div className="bg-[#000000] text-neutral-300 min-h-screen font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* Strict Minimalist Nav */}
      <nav className="w-full py-4 px-6 md:px-12 flex items-center justify-between border-b border-white/[0.08] bg-[#000000]">
        <Link href="/" className="flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors gap-2">
          <ArrowLeft size={14} /> Return
        </Link>
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
          Doc Ref: BT-001
        </span>
      </nav>

      <main className="max-w-[1000px] mx-auto px-5 sm:px-8 py-12 md:py-20 flex flex-col md:flex-row gap-12 lg:gap-20">
        
        {/* LEFT COLUMN: Metadata (Terminal Style) */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-mono font-bold text-white tracking-tight uppercase mb-6">
              Operation:<br/> Beta Cohort
            </h1>
            <div className="flex flex-col gap-4 border-t border-white/[0.08] pt-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Status</span>
                <span className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Accepting Applications
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Allocation</span>
                <span className="text-[11px] font-mono text-white mt-1">50 Operators Max</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Objective</span>
                <span className="text-[11px] font-mono text-white mt-1 leading-snug">Infrastructure stress-test & logic validation</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: The Document */}
        <div className="flex-1 flex flex-col gap-12">
          
          <section>
            <h2 className="text-[11px] font-bold text-white uppercase tracking-widest border-b border-white/[0.08] pb-3 mb-5">
              1.0 Overview
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed font-sans mb-4">
              We are finalizing the Sentinel Vortex infrastructure before opening the gates to the public. To ensure the terminal functions flawlessly under live market conditions, we require a disciplined cohort of 50 active operators to stress-test the environment.
            </p>
            <p className="text-sm text-neutral-400 leading-relaxed font-sans">
              This is not a marketing gimmick; this is a technical requirement. We need traders to break the MT5 parser, log edge-case errors in the journaling module, and provide harsh, unfiltered feedback on the UX.
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-bold text-white uppercase tracking-widest border-b border-white/[0.08] pb-3 mb-5">
              2.0 Terms of Access (What You Receive)
            </h2>
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <span className="font-mono text-[10px] text-neutral-600 font-bold mt-1">[A]</span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1.5">Lifetime Founding Rate</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">Operators who complete the beta phase secure a permanently discounted subscription rate. When public pricing goes live, your rate is locked in perpetuity.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-[10px] text-neutral-600 font-bold mt-1">[B]</span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1.5">Full Pro-Tier Access</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">Immediate, unrestricted access to the complete terminal: MT5 sync, the Live Floor, custom vault staging, and all macro discipline analytics.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-[10px] text-neutral-600 font-bold mt-1">[C]</span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1.5">Direct Development Influence</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">You bypass standard support. If a feature slows your workflow or you require a specific metric tracked in your journal, you dictate the priority to the engineering team.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold text-white uppercase tracking-widest border-b border-white/[0.08] pb-3 mb-5">
              3.0 Operational Requirements (What We Require)
            </h2>
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <span className="font-mono text-[10px] text-neutral-600 font-bold mt-1">[1]</span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1.5">Mandatory Usage</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">You must actively log your daily focus and sync your execution data. Inactive accounts will be purged to allocate space for active operators.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-[10px] text-neutral-600 font-bold mt-1">[2]</span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1.5">Unfiltered Feedback</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">If the UI is counter-intuitive, or the parser fails on your broker statement, report it immediately. We require data, not flattery.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-[10px] text-neutral-600 font-bold mt-1">[3]</span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1.5">Discipline Over PnL</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">We do not judge your drawdown. We require your "Perfect Execution" tags to accurately reflect your broker data. Integrity is the only metric that matters here.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-[#0a0a0a] border-l-2 border-neutral-500 text-xs text-neutral-400 font-sans leading-relaxed">
              <strong>Notice:</strong> At the conclusion of the beta phase, you will be notified. You retain the right to terminate access or seamlessly transition to the locked-in Founding Member rate.
            </div>
          </section>

          {/* APPLICATION FORM */}
          <section className="mt-8 pt-8 border-t border-white/[0.08]">
            <h2 className="text-lg font-mono font-bold text-white tracking-tight mb-3">
              Request Authorization
            </h2>
            <p className="text-xs text-neutral-500 font-sans mb-6">
              Submit your primary email. If capacity remains, you will receive an invitation protocol within 24 hours.
            </p>

            {submitted ? (
              <div className="bg-[#050505] border border-emerald-500/30 p-5 flex items-center gap-4">
                <Check size={20} className="text-emerald-500" />
                <div>
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Protocol Received</h3>
                  <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                    Monitor your inbox. Instructions will follow if selected.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@domain.com" 
                  className="flex-1 bg-[#050505] border border-white/[0.15] px-4 py-3 text-sm text-white font-mono outline-none focus:border-white transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Verifying...' : 'Submit'} <ArrowRight size={14} />
                </button>
              </form>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}
