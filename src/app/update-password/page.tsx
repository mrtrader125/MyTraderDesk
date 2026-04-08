'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, CheckCircle, ArrowRight } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // Tell Supabase to update the password for the currently verified session
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-app-bg p-6">
      <div className="w-full max-w-md bg-card-bg border border-card-border p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Lock size={150} />
        </div>

        <div className="relative z-10">
          <div className="h-16 w-16 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center mb-8 shadow-brand-glow">
            {success ? <CheckCircle size={28} className="text-emerald-500" /> : <Lock size={28} className="text-brand-primary" />}
          </div>

          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-2">
            {success ? 'Secured' : 'New Password'}
          </h1>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-8">
            {success ? 'Redirecting to terminal...' : 'Enter your new master key below.'}
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl">
              {errorMsg}
            </div>
          )}

          {!success && (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-5 text-white focus:outline-none focus:border-brand-primary/50 transition-all font-medium tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={loading || password.length < 6}
                className="w-full h-14 bg-brand-primary hover:bg-brand-primary/90 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-brand-glow flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>Set Password <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
