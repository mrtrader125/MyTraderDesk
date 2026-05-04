'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, Loader2, LineChart, Send } from 'lucide-react'

// ----------------------------------------------------------------------
// THE CORE LOGIC COMPONENT
// ----------------------------------------------------------------------
function InitializeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Token Validation State
  const [isValidating, setIsValidating] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Validate the cryptographic token on load
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsValidating(false)
        return
      }

      // Check if this token exists and belongs to an approved user
      const { data, error } = await supabase
        .from('applicants')
        .select('email, status')
        .eq('invite_token', token)
        .single()

      if (data && data.status === 'approved' && !error) {
        setEmail(data.email) // Lock the email to whatever is in the database
        setIsAuthorized(true)
      }
      setIsValidating(false)
    }

    validateToken()
  }, [token])

  async function signup(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!fullName) return setError("Full Name is required.")
    
    setLoading(true)
    setError('')

    // 1. THE BOUNCER: Double check clearance via Postgres RPC as defense-in-depth
    const { data: isCleared, error: checkError } = await supabase
      .rpc('check_applicant_clearance', { check_email: email })

    if (checkError || !isCleared) {
      setError("Access Denied: Clearance revoked.")
      setLoading(false)
      return
    }

    // 2. THE EXECUTION: Create the account
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/verified`
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // 3. BURN THE TOKEN: Make the invite link single-use
    await supabase
      .from('applicants')
      .update({ invite_token: null })
      .eq('invite_token', token)

    // Trigger the success screen
    setIsSuccess(true)
    setLoading(false)
  }

  // ----------------------------------------------------------------------
  // RENDER: VALIDATION & GHOST SCREENS
  // ----------------------------------------------------------------------
  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center font-sans">
        <Loader2 className="animate-spin text-zinc-600 mb-4" size={32} />
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Decrypting Clearance...</p>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-20 h-20 bg-red-500/5 border border-red-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
          <Lock className="text-red-900" size={32} />
        </div>
        <h1 className="text-xl font-bold text-zinc-400 uppercase tracking-widest mb-3">Access Denied</h1>
        <p className="text-xs text-zinc-600 leading-relaxed max-w-sm">
          This route requires a valid cryptographic signature. Return to the main portal to apply for access.
        </p>
      </div>
    )
  }

  // ----------------------------------------------------------------------
  // RENDER: THE INITIALIZATION FORM
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-l from-blue-600/20 to-transparent rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

        <div className="relative bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
          
          {isSuccess ? (
            <div className="flex flex-col items-center text-center py-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)] mb-8">
                <Send className="text-blue-500 ml-1" size={32} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-3">
                Check Your <span className="text-blue-500">Inbox</span>
              </h2>
              <p className="text-xs font-medium text-neutral-400 leading-relaxed mb-8">
                We've sent a secure verification link to <br/>
                <span className="text-white font-bold">{email}</span><br/><br/>
                Please click the link to activate your account and access the terminal.
              </p>
              <Link 
                href="/login" 
                className="w-full bg-white hover:bg-neutral-200 py-4 rounded-xl text-black font-bold uppercase tracking-widest text-xs shadow-xl flex items-center justify-center transition-all active:scale-[0.98]"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-6">
                  <LineChart className="text-black" size={24} />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
                  Initialize <span className="text-blue-500">Access</span>
                </h1>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mt-2">Operator Registration</p>
              </div>

              <form onSubmit={signup} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/40 outline-none transition-all placeholder:text-neutral-700"
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 mb-2 block">Approved Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      readOnly // 🚨 LOCKED TO PREVENT TAMPERING
                      className="w-full bg-black/80 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-zinc-500 text-sm outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 mb-2 block">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/40 outline-none transition-all placeholder:text-neutral-700"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 mt-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <p className="text-[10px] font-bold text-red-400 leading-relaxed">{error}</p>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white hover:bg-neutral-200 py-4 rounded-xl text-black font-bold uppercase tracking-widest text-xs shadow-xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 mt-6"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                  {loading ? 'Transmitting...' : 'Initialize Profile'}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Already initialized? <Link href="/login" className="ml-2 text-white hover:text-blue-500 transition-colors underline decoration-white/20 underline-offset-4">Log In</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// MAIN EXPORT (Wrapped in Suspense for Next.js build requirements)
// ----------------------------------------------------------------------
export default function Initialize() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030305] flex items-center justify-center font-sans">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest animate-pulse">Connecting to Secure Routines...</div>
      </div>
    }>
      <InitializeForm />
    </Suspense>
  )
}
