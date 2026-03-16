'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Shield, Loader2, RefreshCw, BadgeCheck, Mail, 
  CreditCard, BellRing, Monitor, User, ArrowUpRight, Lock 
} from 'lucide-react'

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    async function loadAccountData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setEmail(user.email || '')
      setLoading(false)
    }
    loadAccountData()
  }, [])

  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const resetPassword = async () => {
    setResetting(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    })
    
    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Security link dispatched to your inbox', 'success')
    }
    setResetting(false)
  }

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">Initializing System...</p>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      
      {/* HEADER: WIDE & BREATHABLE */}
      <header className="border-b border-card-border pb-8">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">
          System <span className="text-brand-primary">Settings</span>
        </h1>
        <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
          <Monitor size={14} className="text-brand-primary" /> 
          Terminal Configuration Hub
        </p>
      </header>

      {/* TWO-COLUMN WIDE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: NAVIGATION HUBS (Span 4) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Link to Profile Page */}
          <Link href="/profile" className="block bg-card-bg border border-card-border rounded-3xl p-8 shadow-card hover:border-brand-primary/50 transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors text-white">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">User Identity</h3>
                  <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Avatars, Bio, Display Name</p>
                </div>
              </div>
              <ArrowUpRight size={20} className="text-neutral-600 group-hover:text-brand-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </Link>

          {/* Link to Billing Page */}
          <Link href="/settings/billing" className="block bg-card-bg border border-card-border rounded-3xl p-8 shadow-card hover:border-brand-primary/50 transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors text-white">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Billing & Tier</h3>
                  <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Subscriptions & Invoices</p>
                </div>
              </div>
              <ArrowUpRight size={20} className="text-neutral-600 group-hover:text-brand-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </Link>

        </div>

        {/* RIGHT COLUMN: ACTIVE CONFIGURATIONS (Span 7) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* SECURITY CARD */}
          <section className="bg-card-bg border border-card-border rounded-[2rem] p-8 md:p-10 shadow-card">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <Lock size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Authentication</h3>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Access Control</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-app-bg border border-card-border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Registered Address</p>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Mail size={14} className="text-brand-primary" />
                    {email}
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">Verified</span>
              </div>

              <div className="space-y-4">
                <p className="text-neutral-400 text-xs font-medium">
                  To ensure maximum terminal security, request a cryptographic link to rotate your master password.
                </p>
                <button
                  onClick={resetPassword}
                  disabled={resetting}
                  className="w-full py-5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {resetting ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                  Issue Password Reset
                </button>
              </div>
            </div>
          </section>

          {/* SYSTEM PREFERENCES */}
          <section className="bg-card-bg border border-card-border rounded-[2rem] p-8 md:p-10 shadow-card">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <BellRing size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">System Preferences</h3>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Alerts & Behavior</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-app-bg rounded-2xl border border-card-border">
                <div>
                  <span className="text-xs font-black text-white uppercase tracking-wider block">Terminal Broadcasts</span>
                  <span className="text-[10px] text-neutral-500 font-medium">Receive important updates and trade setups.</span>
                </div>
                {/* Visual Toggle */}
                <div className="h-6 w-12 bg-brand-primary/20 border border-brand-primary/50 rounded-full relative cursor-pointer shadow-brand-glow">
                  <div className="absolute right-1 top-1 h-4 w-4 bg-brand-primary rounded-full" />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {message && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-5 rounded-[2rem] border shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex items-center gap-4 ${
          message.type === 'success' ? 'bg-[#0a0a0c] border-emerald-500/50 text-emerald-500' : 'bg-[#0a0a0c] border-red-500/50 text-red-500'
        }`}>
          <div className={`p-2 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {message.type === 'success' ? <BadgeCheck size={18}/> : <Shield size={18}/>}
          </div>
          <p className="text-xs font-black uppercase tracking-widest">{message.text}</p>
        </div>
      )}
    </div>
  )
}
