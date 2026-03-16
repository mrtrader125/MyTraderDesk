'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogIn, Loader2, Shield } from 'lucide-react'

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
      // Semicolon/New line fixed here:
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-bg transition-colors duration-700 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background depth blooms */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative">
        <div className="bg-[#0a0a0f]/80 backdrop-blur-2xl border border-card-border transition-colors duration-700 p-10 rounded-[40px] shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] mb-6">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Access <span className="text-blue-500">Terminal</span></h1>
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] mt-2">Authentication Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-2 block">Identity (Email)</label>
              <input 
                type="email" 
                required
                className="w-full bg-black/50 border border-card-border transition-colors duration-700 rounded-2xl py-4 px-6 text-white text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-neutral-800"
                placeholder="operator@mytraderdesk.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-2 block">Secure Key (Password)</label>
              <input 
                type="password" 
                required
                className="w-full bg-black/50 border border-card-border transition-colors duration-700 rounded-2xl py-4 px-6 text-white text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-neutral-800"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl text-white font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-blue-600/20 flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="mr-2" size={16} />}
              Initialize Session
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

