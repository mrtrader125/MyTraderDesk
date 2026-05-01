'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Globe, Clock, ShieldAlert, ArrowRight, CheckCircle2, Lock } from 'lucide-react'

export default function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // The Operator Contract Data
  const [formData, setFormData] = useState({
    timezone: '',
    shift_start: '08:00',
    shift_end: '12:00',
    weekly_prep_time: '20:00',
    daily_prep_time: '07:00',
  })

  // Auto-detect timezone on mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    }))
  }, [])

  const handleSignContract = async () => {
    setIsSubmitting(true)

    try {
      // 1. Save Timezone to Profiles (so the Cron job can fetch it)
      await supabase.from('profiles')
        .update({ timezone: formData.timezone })
        .eq('id', userId)

      // 2. Save Timezone to Operator Profiles (for redundancy/dashboard use)
      await supabase.from('operator_profiles')
        .upsert({ user_id: userId, timezone: formData.timezone })

      // 3. Initialize the Trading Module with the strict rules
      await supabase.from('user_trading_modules')
        .upsert({
          user_id: userId,
          shift_start: `${formData.shift_start}:00`,
          shift_end: `${formData.shift_end}:00`,
          weekly_prep_time: `${formData.weekly_prep_time}:00`,
          daily_prep_time: `${formData.daily_prep_time}:00`,
          max_daily_trades: 2,
          max_staged_assets: 5,
          status: 'ACTIVE',
          current_day_state: 'AWAITING_PREP'
        })

      // 4. Send them to the Desk to begin operation
      router.push('/desk')
    } catch (error) {
      console.error("Initialization Error:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans selection:bg-blue-500/30">
      <div className="max-w-xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 flex h-1 bg-zinc-900">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <div className="p-8 sm:p-10">
          {/* STEP 1: CHRONOLOGY */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Globe className="text-blue-500" size={24} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Chronology & Shifts</h2>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                Define your local timezone and deep-work execution window. The Chief Risk Officer will enforce the <strong className="text-zinc-200">Golden Rule of Silence</strong> during your active shift to protect your focus.
              </p>
              
              <div className="flex flex-col gap-6 mb-10">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Detected Local Timezone</label>
                  <div className="flex items-center gap-3 w-full bg-black border border-zinc-800 rounded-lg p-3 opacity-70">
                    <Lock size={14} className="text-zinc-500" />
                    <span className="text-sm font-bold text-zinc-300 font-mono tracking-wide">{formData.timezone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Shift Start</label>
                    <input 
                      type="time" 
                      value={formData.shift_start} 
                      onChange={e => setFormData({...formData, shift_start: e.target.value})} 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm font-bold tracking-wider outline-none focus:border-blue-500 transition-colors" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Shift End</label>
                    <input 
                      type="time" 
                      value={formData.shift_end} 
                      onChange={e => setFormData({...formData, shift_end: e.target.value})} 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm font-bold tracking-wider outline-none focus:border-blue-500 transition-colors" 
                    />
                  </div>
                </div>
              </div>

              <button onClick={() => setStep(2)} className="w-full py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                Continue to Routine <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: ROUTINE */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Clock className="text-purple-500" size={24} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Routine Protocol</h2>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                Establish your strict preparation deadlines. If your daily or weekly focus is not logged by these exact times, your terminal will be flagged.
              </p>
              
              <div className="flex flex-col gap-6 mb-10">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-purple-500 font-bold uppercase tracking-widest">Sunday Macro Prep Deadline</label>
                  <p className="text-[10px] text-zinc-500 leading-snug mb-1">When must your macro vault be locked for the week?</p>
                  <input 
                    type="time" 
                    value={formData.weekly_prep_time} 
                    onChange={e => setFormData({...formData, weekly_prep_time: e.target.value})} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm font-bold tracking-wider outline-none focus:border-purple-500 transition-colors" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-purple-500 font-bold uppercase tracking-widest">Daily Sniper Prep Deadline</label>
                  <p className="text-[10px] text-zinc-500 leading-snug mb-1">When must your daily pairs be staged in the Desk?</p>
                  <input 
                    type="time" 
                    value={formData.daily_prep_time} 
                    onChange={e => setFormData({...formData, daily_prep_time: e.target.value})} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm font-bold tracking-wider outline-none focus:border-purple-500 transition-colors" 
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-4 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-zinc-800 transition-colors">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                  Review Contract <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: THE RISK CONTRACT */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mb-6">
                <ShieldAlert className="text-red-500" size={24} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">The Risk Contract</h2>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                By initializing this terminal, you are entering a binding behavioral contract with the Sentinel Vortex system.
              </p>
              
              <div className="bg-black border border-zinc-800 rounded-xl p-5 mb-10 flex flex-col gap-4 shadow-inner">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Maximum 2 Trades Daily</span>
                    <span className="text-[10px] text-zinc-500 mt-1 leading-relaxed">The terminal will automatically lock execution capabilities once this threshold is reached.</span>
                  </div>
                </div>
                <div className="w-full h-px bg-zinc-800/50" />
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Maximum 5 Focus Pairs</span>
                    <span className="text-[10px] text-zinc-500 mt-1 leading-relaxed">You may not pull more than 5 assets from your weekly vault into your daily sniper routine.</span>
                  </div>
                </div>
                <div className="w-full h-px bg-zinc-800/50" />
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Zero-Outcome Grading</span>
                    <span className="text-[10px] text-zinc-500 mt-1 leading-relaxed">You agree to grade all executions as Perfect or Imperfect based purely on protocol adherence, before the financial outcome is known.</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} disabled={isSubmitting} className="px-6 py-4 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50">
                  Back
                </button>
                <button onClick={handleSignContract} disabled={isSubmitting} className="flex-1 py-4 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50">
                  {isSubmitting ? 'Initializing...' : 'Sign & Initialize'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
