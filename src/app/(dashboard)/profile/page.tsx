'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Crown, Calendar, Activity, LogOut, ChevronRight, CheckCircle2, Lock, Clock, Zap } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      // 1. Fetch User
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        // 2. Fetch Profile Metadata safely
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) setProfile(data)
      } else {
        // THE SECURITY GUARD: Kick them out if the user object is null
        router.push('/login?error=SessionExpired')
      }
      
      setLoading(false)
    }
    loadProfile()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="animate-pulse text-brand-primary" size={40} />
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">Loading Operator Data...</p>
      </div>
    </div>
  )

  const plan = profile?.plan?.toUpperCase() || 'FREE'
  const isPro = plan === 'PRO'
  const isEssential = plan === 'ESSENTIAL'
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">

      {/* HEADER */}
      <header className="border-b border-card-border pb-8">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">
          Operator <span className="text-brand-primary">Profile</span>
        </h1>
        <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
          <User size={14} className="text-brand-primary" /> 
          Identity & Clearance Hub
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT COLUMN: IDENTITY (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card-bg border border-card-border rounded-[2rem] p-8 flex flex-col items-center shadow-card relative overflow-hidden">
            {isPro && <div className="absolute top-0 inset-x-0 h-32 bg-brand-primary/10 blur-[50px] rounded-full pointer-events-none"></div>}

            <div className="w-24 h-24 bg-app-bg border border-white/10 rounded-full flex items-center justify-center mb-6 relative shadow-2xl z-10">
              <User size={36} className="text-neutral-500" />
              {isPro && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-primary/20 border border-brand-primary/30 rounded-full flex items-center justify-center text-brand-primary backdrop-blur-md shadow-brand-glow">
                  <Crown size={14} />
                </div>
              )}
            </div>

            <h2 className="text-xl font-black text-white tracking-tight z-10 uppercase">
              {profile?.full_name || user?.user_metadata?.full_name || 'Terminal Operator'}
            </h2>
            <div className="flex items-center space-x-2 mt-2 text-neutral-400 text-xs font-medium z-10 mb-8">
              <Mail size={14} />
              <span>{user?.email}</span>
            </div>

            <div className="w-full space-y-3 z-10">
              <div className="flex items-center justify-between p-4 rounded-xl bg-app-bg border border-card-border">
                <div className="flex items-center space-x-2 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                   <Activity size={14} /> <span>Status</span>
                </div>
                <span className="flex items-center text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Live
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-app-bg border border-card-border">
                <div className="flex items-center space-x-2 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                   <Calendar size={14} /> <span>Joined</span>
                </div>
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">{memberSince}</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mt-8 py-4 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center space-x-2 border border-red-500/10 z-10 active:scale-95"
            >
              <LogOut size={14} />
              <span>Disconnect Terminal</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ACCESS & MODULES (Span 8) */}
        <div className="lg:col-span-8 space-y-8">

          {/* ACTIVE PLAN CARD */}
          <div className="bg-card-bg border border-card-border rounded-[2rem] p-8 md:p-10 shadow-card">
            <h3 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-6 flex items-center">
              Clearance Level <div className="ml-4 h-[1px] flex-1 bg-white/[0.05]"></div>
            </h3>

            <div className={`p-8 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
              isPro ? 'bg-brand-primary/[0.03] border-brand-primary/20' :
              isEssential ? 'bg-blue-500/[0.03] border-blue-500/20' :
              'bg-app-bg border-card-border'
            }`}>
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-xl shrink-0 ${isPro ? 'bg-brand-primary/10' : 'bg-white/5'}`}>
                  {isPro ? <Zap size={24} className="text-brand-primary" /> : <Shield size={24} className="text-neutral-400" />}
                </div>
                <div>
                  <h4 className={`text-2xl font-black tracking-tight uppercase ${isPro ? 'text-brand-primary' : isEssential ? 'text-blue-400' : 'text-white'}`}>
                    Trader {plan}
                  </h4>
                  <p className="text-xs font-medium text-neutral-400 mt-2 leading-relaxed">
                    {isPro ? 'Maximum clearance. All intelligence modules are unlocked and live.' :
                     isEssential ? 'Standard clearance. Core modules unlocked. Upgrades available.' :
                     'Basic clearance. Intelligence modules are time-locked. Upgrade to remove limits.'}
                  </p>
                </div>
              </div>

              {!isPro && (
                <button
                  onClick={() => router.push('/settings/billing')}
                  className="px-8 py-4 bg-brand-primary hover:bg-brand-primary/90 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center shrink-0 shadow-brand-glow active:scale-95"
                >
                  Upgrade <ChevronRight size={16} className="ml-2" />
                </button>
              )}
            </div>
          </div>

          {/* MODULE CLEARANCE CARD */}
          <div className="bg-card-bg border border-card-border rounded-[2rem] p-8 md:p-10 shadow-card">
             <h3 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-6 flex items-center">
              Intelligence Modules <div className="ml-4 h-[1px] flex-1 bg-white/[0.05]"></div>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {/* Core Markets Box */}
               <div className="bg-app-bg border border-card-border p-6 rounded-2xl flex flex-col justify-between min-h-[160px]">
                 <div className="flex items-start justify-between">
                   <div className={`p-3 rounded-xl ${isPro || isEssential ? 'bg-blue-500/10 text-blue-500' : 'bg-white/5 text-neutral-500'}`}>
                     <Shield size={20} />
                   </div>
                   {isPro || isEssential ? (
                     <span className="flex items-center text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20"><CheckCircle2 size={14} className="mr-2" /> Unlocked</span>
                   ) : (
                     <span className="flex items-center text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg"><Clock size={14} className="mr-2" /> 24h Delay</span>
                   )}
                 </div>
                 <div className="mt-6">
                   <h4 className={`text-base font-black uppercase tracking-wider ${isPro || isEssential ? 'text-white' : 'text-neutral-400'}`}>Core Markets</h4>
                   <p className="text-xs font-medium text-neutral-500 mt-1">Forex Majors & Gold configurations.</p>
                 </div>
               </div>

               {/* Premium Markets Box */}
               <div className="bg-app-bg border border-card-border p-6 rounded-2xl flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
                 <div className="flex items-start justify-between relative z-10">
                   <div className={`p-3 rounded-xl transition-colors ${isPro ? 'bg-brand-primary/10 text-brand-primary' : 'bg-white/5 text-neutral-500 group-hover:bg-white/10'}`}>
                     <Crown size={20} />
                   </div>
                   {isPro ? (
                     <span className="flex items-center text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20"><CheckCircle2 size={14} className="mr-2" /> Unlocked</span>
                   ) : (
                     <span className="flex items-center text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"><Lock size={14} className="mr-2" /> Locked</span>
                   )}
                 </div>
                 <div className="mt-6 relative z-10">
                   <h4 className={`text-base font-black uppercase tracking-wider ${isPro ? 'text-white' : 'text-neutral-400'}`}>Premium Exotics</h4>
                   <p className="text-xs font-medium text-neutral-500 mt-1">Crypto, Indices, Stocks & Scalping arrays.</p>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
