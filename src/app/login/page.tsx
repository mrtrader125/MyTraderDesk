'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Loader2, Shield, Fingerprint, ChevronRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative group">
        {/* EXTERNAL GLOW EFFECT */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary/20 to-transparent rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        
        <div className="relative bg-[#0a0a0f]/90 backdrop-blur-3xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-primary/10 animate-pulse" />
              <Shield className="text-white relative z-10" size={24} />
            </div>
            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">
              Terminal <span className="text-brand-primary">Access</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-px w-8 bg-neutral-800" />
              <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em]">Encrypted Session</p>
              <div className="h-px w-8 bg-neutral-800" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* EMAIL / IDENTITY */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Operator Identity</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700">
                  <Fingerprint size={16} />
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="ID // EMAIL"
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-white text-xs font-bold focus:border-brand-primary/40 focus:bg-black/60 outline-none transition-all placeholder:text-neutral-800 tracking-widest"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD / KEY */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Access Key</label>
                <Link href="/account/security" className="text-[8px] font-black text-neutral-600 hover:text-brand-primary uppercase tracking-widest transition-colors">Lost Key?</Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700">
                  <Shield size={16} />
                </div>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-white text-xs font-bold focus:border-brand-primary/40 focus:bg-black/60 outline-none transition-all placeholder:text-neutral-800 tracking-[0.3em]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-relaxed">
                  Authentication Failed: {error}
                </p>
              </div>
            )}

            {/* SUBMIT ACTION */}
            <button 
              disabled={loading}
              className="w-full mt-4 bg-white hover:bg-neutral-200 py-4 rounded-xl text-black font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 group/btn"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <span>Initialize Session</span>
                  <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* FOOTER NAVIGATION */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
              New Operator? 
              <Link href="/signup" className="ml-2 text-white hover:text-brand-primary transition-colors underline decoration-brand-primary/30 underline-offset-4">
                Register Clearance
              </Link>
            </p>
          </div>

        </div>

        {/* SYSTEM ID TAG */}
        <div className="mt-6 flex justify-center items-center gap-4 opacity-30">
          <span className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.5em]">MTD-V.01 // {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  )
}
