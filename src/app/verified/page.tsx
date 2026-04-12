'use client'

import Link from 'next/link'
import { ShieldCheck, ArrowRight } from 'lucide-react'

export default function VerifiedPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#030305] p-6 font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative bg-[#0a0a0f]/90 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700">
        
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <ShieldCheck className="text-emerald-500" size={36} />
        </div>
        
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-3">
          Access <span className="text-emerald-500">Granted</span>
        </h1>
        
        <p className="text-xs font-medium text-neutral-400 leading-relaxed mb-10 px-4">
          Your communication channel is secured and your email has been successfully verified. You may now enter the terminal.
        </p>

        <Link 
          href="/login"
          className="w-full bg-white hover:bg-neutral-200 py-4 rounded-xl text-black font-bold uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center transition-all active:scale-[0.98] group"
        >
          Proceed to Login <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}