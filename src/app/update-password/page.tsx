'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Loader2, CheckCircle, ArrowRight } from 'lucide-react'

// 🚨 THE MASTER LOCK: Placed OUTSIDE the component so React Strict Mode cannot reset it
let exchangeAttempted = false;

// 1. The Core Form Component
function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [exchangingCode, setExchangingCode] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')

    const verifySession = async () => {
      // 1. If there's no code, check if they are already authenticated
      if (!code) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setErrorMsg('No secure token found. Please use the link directly from your email.')
        }
        setExchangingCode(false)
        return
      }

      // 2. THE VAULT DOOR: If we already tried exchanging, abort immediately
      if (exchangeAttempted) return
      exchangeAttempted = true // Lock the door behind us

      try {
        // 🚨 FIX: Using the safer fallback logic you provided earlier
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        // 🚨 TEMPORARILY DISABLED URL WIPING 
        // We need to see the ?code= in the URL bar to prove Supabase isn't stripping it
        // window.history.replaceState(null, '', window.location.pathname)

        if (error && !data?.session) {
          // Double check if session established anyway (handles rare race conditions)
          const { data: retryCheck } = await supabase.auth.getSession()
          if (!retryCheck.session) {
             setErrorMsg('Invalid or expired reset link. Please request a new one.')
          }
        }
      } catch (err) {
        setErrorMsg('System error during verification. Please request a new link.')
      } finally {
        setExchangingCode(false)
      }
    }

    verifySession()
  }, [searchParams])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // Update the password for the newly verified session
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  // 2. Show a cool decrypting UI while the code is being exchanged
  if (exchangingCode) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center py-10">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">Verifying Security Token...</p>
      </div>
    )
  }

  // 3. The standard Password Form
  return (
    <div className="relative z-10">
      <div className="h-16 w-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
        {success ? <CheckCircle size={28} className="text-emerald-500" /> : <Lock size={28} className="text-blue-500" />}
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

      {!success && !errorMsg && (
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              minLength={6}
              className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-5 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 6}
            className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>Set Password <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      )}
    </div>
  )
}

// 4. The Main Page Wrapper
export default function UpdatePasswordPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#030303] p-6">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Lock size={150} />
        </div>

        <Suspense fallback={
          <div className="relative z-10 flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        }>
          <UpdatePasswordForm />
        </Suspense>
        
      </div>
    </div>
  )
}
