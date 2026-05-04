'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Lock, Mail, ChevronRight, AlertTriangle, Send, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Verification States
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // 8-Digit OTP Reset States
  const [isResetting, setIsResetting] = useState(false)
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request')
  const [otpCode, setOtpCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNeedsVerification(false)

    // 1. Authenticate the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      if (authError.message.toLowerCase().includes('email not confirmed')) {
        setNeedsVerification(true)
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return; 
    }

    // 2. 🚨 TRAFFIC CONTROLLER: Check if they are a first-time operator
    if (authData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('protocol_established')
        .eq('id', authData.user.id)
        .single()

      // 3. Route them based on their clearance
      if (!profile || profile.protocol_established !== true) {
        // First time login -> Send to standalone onboarding page
        router.push('/onboarding')
      } else {
        // Returning operator -> Send directly to the Command Center
        router.push('/dashboard') 
      }
      
      // Removed router.refresh() to prevent cancelling the push navigation
    }
  }

  const handleResendEmail = async () => {
    setResending(true)
    setError(null)
    const { error } = await supabase.auth.resend({ type: 'signup', email: email })
    if (error) setError(error.message)
    else setResendSuccess(true)
    setResending(false)
  }

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isResetting) return; 

    setError(null)
    if (!email) {
      setError("Please enter your email address first to receive a security code.")
      return
    }

    setIsResetting(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      setError(error.message)
    } else {
      setResetStep('verify') 
    }
    
    setIsResetting(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsVerifying(true)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'recovery'
    })

    if (error) {
      setError(error.message)
      setIsVerifying(false)
    } else {
      router.push('/update-password')
    }
  }

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-transparent rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        
        <div className="relative bg-[#0a0a0f]/90 backdrop-blur-3xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
          
          {needsVerification ? (
            <div className="flex flex-col items-center text-center py-2 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <AlertTriangle className="text-amber-500" size={28} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">
                Verification <span className="text-amber-500">Required</span>
              </h2>
              <p className="text-xs font-medium text-neutral-400 leading-relaxed mb-8">
                You must verify your email address before accessing the terminal. Please check the inbox for <span className="text-white font-bold">{email}</span>.
              </p>

              {error && (
                <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg w-full mb-6 text-[10px] font-bold text-red-400">
                  {error}
                </div>
              )}

              {resendSuccess ? (
                <div className="w-full bg-emerald-500/10 border border-emerald-500/20 py-4 rounded-xl flex items-center justify-center text-emerald-500 text-xs font-black uppercase tracking-widest mb-6">
                  <CheckCircle2 size={16} className="mr-2" /> Link Sent Successfully
                </div>
              ) : (
                <button 
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full bg-white hover:bg-neutral-200 py-4 rounded-xl text-black font-bold uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 mb-4"
                >
                  {resending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
                  {resending ? 'Sending...' : 'Resend Verification Link'}
                </button>
              )}

              <button 
                onClick={() => { setNeedsVerification(false); setResendSuccess(false); }}
                className="text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors mt-2"
              >
                Back to Login
              </button>
            </div>

          ) : resetStep === 'verify' ? (

            <div className="flex flex-col items-center text-center py-2 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Lock className="text-blue-500" size={28} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">
                Enter <span className="text-blue-500">Secure Code</span>
              </h2>
              <p className="text-xs font-medium text-neutral-400 leading-relaxed mb-8">
                We sent an 8-digit security code to <span className="text-white font-bold">{email}</span>.
              </p>

              <form onSubmit={handleVerifyOtp} className="w-full space-y-5">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">8-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="00000000"
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-4 text-white text-center text-2xl tracking-[0.4em] focus:border-blue-500/40 focus:bg-black/60 outline-none transition-all"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                  />
                </div>

                {error && (
                  <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg w-full mb-6 text-[10px] font-bold text-red-400 text-left">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || otpCode.length !== 8}
                  className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isVerifying ? <Loader2 className="animate-spin mr-2" size={16} /> : <ShieldCheck className="mr-2" size={16} />}
                  {isVerifying ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>

              <button
                onClick={() => { setResetStep('request'); setError(null); setOtpCode(''); }}
                className="text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors mt-6"
              >
                Cancel
              </button>
            </div>

          ) : (
            <>
              <div className="flex flex-col items-center mb-10">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                  <Lock className="text-white relative z-10" size={24} />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
                  Client <span className="text-blue-500">Login</span>
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-px w-8 bg-neutral-800" />
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.3em]">Secure Connection</p>
                  <div className="h-px w-8 bg-neutral-800" />
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600">
                      <Mail size={16} />
                    </div>
                    <input 
                      type="email" 
                      required
                      placeholder="trader@example.com"
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/40 focus:bg-black/60 outline-none transition-all placeholder:text-neutral-700"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Password</label>
                    <button 
                      onClick={handleForgotPassword}
                      type="button"
                      disabled={isResetting}
                      className="text-[9px] font-bold text-neutral-500 hover:text-blue-500 transition-colors disabled:opacity-50"
                    >
                      {isResetting ? 'Sending...' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600">
                      <Lock size={16} />
                    </div>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/40 focus:bg-black/60 outline-none transition-all placeholder:text-neutral-700"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <p className="text-[10px] font-bold text-red-400 leading-relaxed">
                      {error}
                    </p>
                  </div>
                )}

                <button 
                  disabled={loading}
                  className="w-full mt-4 bg-white hover:bg-neutral-200 py-4 rounded-xl text-black font-bold uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 group/btn"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Don't have an account? 
                  <Link href="/signup" className="ml-2 text-white hover:text-blue-500 transition-colors underline decoration-white/20 underline-offset-4">
                    Sign Up
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
