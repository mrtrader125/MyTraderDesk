'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Crosshair, Clock, Activity, ArrowRight, Zap, ChevronLeft, ChevronRight, BarChart2, TrendingUp, Target, Layers } from 'lucide-react'

export default function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 🚨 UI STATE: Progressive Flow
  const [currentStep, setCurrentStep] = useState(1)
  const [phase, setPhase] = useState<'form' | 'activation'>('form')
  
  // Protocol Data State
  const [formData, setFormData] = useState({
    timezone: '',
    trader_type: '', // beginner, intermediate, advanced
    primary_goal: '', // profit, discipline, consistency
    target_markets: [] as string[], // forex, crypto, commodities, indices
    strategy_status: 'defined', 
    weekly_analysis_day: '',
    weekly_analysis_start: '',
    weekly_analysis_end: '',
    daily_prep_start: '',
    daily_prep_end: '',
    execution_type: 'fixed', 
    execution_start: '',
    execution_end: '',
    weekly_review_day: '',
    weekly_review_start: '',
    weekly_review_end: '',
    accepted_risk_contract: false
  })

  // Auto-detect timezone
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    }))
  }, [])

  const toggleMarket = (market: string) => {
    setFormData(prev => {
      const exists = prev.target_markets.includes(market)
      if (exists) return { ...prev, target_markets: prev.target_markets.filter(m => m !== market) }
      return { ...prev, target_markets: [...prev.target_markets, market] }
    })
  }

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  const handleInitialize = async () => {
    if (!formData.accepted_risk_contract) return;
    setIsSubmitting(true)

    try {
      await supabase.from('profiles').update({ 
        timezone: formData.timezone,
        protocol_established: true 
      }).eq('id', userId)

      await supabase.from('operator_profiles').upsert({ 
        user_id: userId, 
        timezone: formData.timezone,
        trader_type: formData.trader_type,
        primary_goal: formData.primary_goal,
        target_markets: formData.target_markets,
        strategy_status: formData.strategy_status,
        weekly_analysis_window: `${formData.weekly_analysis_day} ${formData.weekly_analysis_start}-${formData.weekly_analysis_end}`,
        daily_prep_window: `${formData.daily_prep_start}-${formData.daily_prep_end}`,
        execution_type: formData.execution_type,
        execution_window: `${formData.execution_start}-${formData.execution_end}`,
        weekly_review_window: `${formData.weekly_review_day} ${formData.weekly_review_start}-${formData.weekly_review_end}`,
      })

      await supabase.from('user_trading_modules').upsert({
        user_id: userId,
        shift_start: `${formData.execution_start || '00:00'}:00`,
        shift_end: `${formData.execution_end || '00:00'}:00`,
        max_daily_trades: 2,
        max_staged_assets: 5,
        status: 'ACTIVE',
        current_day_state: 'AWAITING_PREP'
      })

      setIsSubmitting(false)
      setPhase('activation')
      
    } catch (error) {
      console.error("Initialization Error:", error)
      setIsSubmitting(false)
    }
  }

  // ==========================================
  // PHASE 2: GUIDED ACTIVATION SCREEN
  // ==========================================
  if (phase === 'activation') {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none opacity-50 animate-pulse" />
        
        <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="text-emerald-500" size={36} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase mb-3">
              System <span className="text-emerald-500">Initialized</span>
            </h1>
            <p className="text-neutral-400 text-sm md:text-base font-medium max-w-lg">
              Your parameters are locked into the ledger. The terminal is now calibrated to your operational profile.
            </p>
          </div>

          <div className="bg-[#0a0a0f] border border-neutral-800 rounded-3xl p-8 shadow-2xl mb-8">
            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-3 mb-6">
              Your Operational Framework
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl shrink-0 border border-blue-500/20">
                  <Crosshair className="text-blue-500" size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Execution Status</h4>
                  <p className="text-sm font-bold text-white uppercase tracking-wide">
                    {formData.strategy_status === 'defined' ? 'Strict Execution Mode' : 'Development Mode'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl shrink-0 border border-amber-500/20">
                  <Clock className="text-amber-500" size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Active Window</h4>
                  <p className="text-sm font-bold text-white uppercase tracking-wide">
                    {formData.execution_start || '00:00'} - {formData.execution_end || '00:00'}
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">{formData.execution_type === 'fixed' ? 'Fixed Session' : 'Alert Driven'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 md:col-span-2 mt-2 pt-6 border-t border-neutral-800/50">
                <div className="p-3 bg-red-500/10 rounded-xl shrink-0 border border-red-500/20">
                  <Activity className="text-red-500" size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Discipline Engine</h4>
                  <p className="text-sm font-bold text-white uppercase tracking-wide">
                    Active & Monitoring
                  </p>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    The system will forcefully halt your session if you exceed <span className="text-white font-bold">2 live executions</span> today. Grade your setups mercilessly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-white hover:bg-neutral-200 py-5 rounded-2xl text-black font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center transition-all active:scale-[0.98] group"
          >
            <Zap className="mr-2" size={18} />
            Engage Command Center
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    )
  }

  // ==========================================
  // PHASE 1: PROGRESSIVE CONFIGURATION
  // ==========================================
  const progressPercentage = (currentStep / 5) * 100;
  
  const phaseTitles = [
    "Phase 1: Operator Identity",
    "Phase 2: Objective Calibration",
    "Phase 3: Market Scope",
    "Phase 4: Execution Parameters",
    "Phase 5: Protocol Initialization"
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-50 flex flex-col font-sans selection:bg-blue-500/30">
      
      {/* GLOBAL PROGRESS HEADER */}
      <div className="w-full border-b border-neutral-900 bg-[#0a0a0a] pt-8 pb-6 px-6 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-blue-500 uppercase tracking-widest">
              {phaseTitles[currentStep - 1]}
            </h2>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Step {currentStep} of 5
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* STEP CONTENT */}
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* STEP 1: IDENTITY */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">What is your current operating level?</h1>
              <p className="text-neutral-400 text-sm">The terminal adjusts its analytics based on your experience.</p>
            </div>
            
            <div className="grid gap-4">
              {[
                { id: 'beginner', title: 'Aspirational / Beginner', desc: 'Still finding my edge and learning market structure.' },
                { id: 'intermediate', title: 'Intermediate Operator', desc: 'I have a system, but struggle with consistency and psychology.' },
                { id: 'advanced', title: 'Advanced Professional', desc: 'Consistently profitable. Here strictly for execution scaling.' }
              ].map(type => (
                <button 
                  key={type.id}
                  onClick={() => setFormData({...formData, trader_type: type.id})}
                  className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.trader_type === type.id ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}
                >
                  <span className={`text-sm font-black uppercase tracking-wide ${formData.trader_type === type.id ? 'text-blue-400' : 'text-white'}`}>{type.title}</span>
                  <span className="text-xs text-neutral-500 mt-1">{type.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: GOALS */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">What are you optimizing for?</h1>
              <p className="text-neutral-400 text-sm">Select the primary reason you are deploying this terminal.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { id: 'profit', icon: TrendingUp, title: 'Raw Profit', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50' },
                { id: 'discipline', icon: Target, title: 'Iron Discipline', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50' },
                { id: 'consistency', icon: BarChart2, title: 'Consistency', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/50' }
              ].map(goal => (
                <button 
                  key={goal.id}
                  onClick={() => setFormData({...formData, primary_goal: goal.id})}
                  className={`flex flex-col items-center justify-center text-center p-8 rounded-2xl border transition-all ${formData.primary_goal === goal.id ? `${goal.bg} ${goal.border} shadow-inner` : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}
                >
                  <goal.icon size={32} className={`mb-4 ${formData.primary_goal === goal.id ? goal.color : 'text-neutral-600'}`} />
                  <span className={`text-sm font-black uppercase tracking-wide ${formData.primary_goal === goal.id ? goal.color : 'text-white'}`}>{goal.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: MARKETS */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Define your target markets.</h1>
              <p className="text-neutral-400 text-sm">Select all asset classes you actively execute on.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {['Forex', 'Crypto', 'Commodities', 'Indices', 'Equities'].map(market => {
                const isSelected = formData.target_markets.includes(market);
                return (
                  <button 
                    key={market}
                    onClick={() => toggleMarket(market)}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${isSelected ? 'bg-amber-500/10 border-amber-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Layers size={18} className={isSelected ? 'text-amber-500' : 'text-neutral-600'} />
                      <span className={`text-sm font-black uppercase tracking-wide ${isSelected ? 'text-amber-400' : 'text-white'}`}>{market}</span>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-neutral-700 bg-transparent'}`}>
                      {isSelected && <ShieldCheck size={12} className="text-black" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 4: EXECUTION SYSTEM */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Execution Parameters</h1>
              <p className="text-neutral-400 text-sm">Define your strict operating hours and routines. Charts close outside these windows.</p>
            </div>
            
            <div className="space-y-6">
              {/* Daily Prep */}
              <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-2xl">
                <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-4">Daily Prep Window</label>
                <div className="grid grid-cols-2 gap-4">
                  <input type="time" value={formData.daily_prep_start} onChange={(e) => setFormData({...formData, daily_prep_start: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                  <input type="time" value={formData.daily_prep_end} onChange={(e) => setFormData({...formData, daily_prep_end: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                </div>
              </div>

              {/* Execution Window */}
              <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-2xl">
                <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-4">Live Execution Window</label>
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" checked={formData.execution_type === 'fixed'} onChange={() => setFormData({...formData, execution_type: 'fixed'})} className="text-blue-500 bg-neutral-900 border-neutral-700" />
                    <span className="text-sm font-bold text-white">Fixed Session</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" checked={formData.execution_type === 'alert'} onChange={() => setFormData({...formData, execution_type: 'alert'})} className="text-blue-500 bg-neutral-900 border-neutral-700" />
                    <span className="text-sm font-bold text-white">Alert Driven</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="time" value={formData.execution_start} onChange={(e) => setFormData({...formData, execution_start: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                  <input type="time" value={formData.execution_end} onChange={(e) => setFormData({...formData, execution_end: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PROTOCOL CONFIRMATION */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Protocol Initialization</h1>
              <p className="text-neutral-400 text-sm">Review and accept the platform constraints to unlock the terminal.</p>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <label className="flex items-start space-x-4 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.accepted_risk_contract}
                  onChange={(e) => setFormData({...formData, accepted_risk_contract: e.target.checked})}
                  className="mt-1 w-5 h-5 text-red-500 bg-neutral-900 border-red-500/50 rounded focus:ring-red-500" 
                />
                <div className="flex flex-col">
                  <span className="text-base font-black text-white tracking-wide uppercase">I accept the Operator Protocol</span>
                  <span className="text-sm text-red-200/70 mt-2 leading-relaxed font-medium">
                    By initializing, I agree to the platform's constraints: Maximum 2 trades daily, a limit of 5 staged daily assets, and a commitment to zero-outcome grading for behavioral consistency.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* NAVIGATION FOOTER */}
        <div className="mt-auto pt-10 pb-6 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className={`flex items-center px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-neutral-500 hover:text-white'}`}
          >
            <ChevronLeft size={16} className="mr-2" /> Back
          </button>

          {currentStep < 5 ? (
            <button 
              onClick={handleNext}
              className="flex items-center px-8 py-3 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Next Step <ChevronRight size={16} className="ml-2" />
            </button>
          ) : (
            <button 
              onClick={handleInitialize}
              disabled={!formData.accepted_risk_contract || isSubmitting}
              className="flex items-center px-8 py-3 bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              {isSubmitting ? 'Writing to Ledger...' : 'Initialize'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
