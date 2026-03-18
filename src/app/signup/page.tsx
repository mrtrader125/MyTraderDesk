'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('') // New state for name
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signup() {
    if (!fullName) return setError("Full Name is required.")
    
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This sends the name to our Supabase database trigger
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background depth blooms */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative">
        <div className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/5 p-10 rounded-[40px] shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-xl mb-6">
              <ShieldCheck className="text-black" size={32} />
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Create <span className="text-blue-500">Account</span></h1>
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] mt-2">Initialize Operator Profile</p>
          </div>

          <div className="space-y-4">
            {/* FULL NAME INPUT */}
            <div>
              <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={16} />
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-neutral-800"
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* EMAIL INPUT */}
            <div>
              <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={16} />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-neutral-800"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-2 block">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={16} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-neutral-800"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <button 
              onClick={signup}
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-200 py-5 rounded-2xl text-black font-black uppercase tracking-[0.3em] text-xs shadow-xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              {loading ? 'Creating account...' : 'Finalize Registration'}
            </button>

            <p className="text-center mt-6 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Already have an account? 
              <Link href="/login" className="ml-2 text-white underline decoration-blue-500 underline-offset-4">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
