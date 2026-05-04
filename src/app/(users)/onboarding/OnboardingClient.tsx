'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Crosshair, Clock, Activity, ArrowRight, Zap, ChevronLeft, ChevronRight, Layers, Calendar, AlertTriangle, CheckSquare } from 'lucide-react'

export default function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPreviewMode = searchParams?.get('preview') === 'true'

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [phase, setPhase] = useState<'form' | 'activation'>('form')
  
  // 🚨 NEW LOGIC SCHEMA
  const [formData, setFormData] = useState({
    timezone: '',
    
    // 1. Trading Scope
    scope_type: 'single', // 'single' | 'multi'
    target_assets: [] as string[], 
    
    // 2. Weekly Prep
    weekly_prep_mode: 'structured', // 'structured' | 'none'
    weekly_prep_day: '',
    weekly_prep_start: '',
    weekly_prep_end: '',
    
    // 3. Daily Prep
    daily_prep_mode: 'before', // 'before' | 'fixed' | 'none'
    daily_prep_offset: '30', // '15', '30', '60', 'custom'
    daily_prep_start: '',
    daily_prep_end: '',
    
    // 4. Execution Behavior
    execution_type: 'session', // 'session' | 'signal'
    execution_start: '',
    execution_end: '',
    
    // 5. Review Process
    review_mode: 'weekly', // 'weekly' | 'none'
    review_day: '',
    review_start: '',
    review_end: '',
    
    // 6. Confirmation
    accepted_risk_contract: false
  })

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    }))
  }, [])

  const toggleAsset = (asset: string) => {
    setFormData(prev => {
      const exists = prev.target_assets.includes(asset)
      if (exists) return { ...prev, target_assets: prev.target_assets.filter(a => a !== asset) }
      return { ...prev, target_assets: [...prev.target_assets, asset] }
    })
  }

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  const handleInitialize = async () => {
    if (!formData.accepted_risk_contract) return;
    setIsSubmitting(true)

    try {
      if (isPreviewMode) {
        setTimeout(() => {
          setIsSubmitting(false)
          setPhase('activation')
        }, 800) 
        return;
      }

      await supabase.from('profiles').update({ 
        timezone: formData.timezone,
        protocol_established: true 
      }).eq('id', userId)

      await supabase.from('operator_profiles').upsert({ 
        user_id: userId, 
        timezone: formData.timezone,
        
        scope_type: formData.scope_type,
        target_assets: formData.target_assets,
        
        weekly_prep_mode: formData.weekly_prep_mode,
        weekly_analysis_window: formData.weekly_prep_mode === 'structured' ? `${formData.weekly_prep_day} ${formData.weekly_prep_start}-${formData.weekly_prep_end}` : 'NONE',
        
        daily_prep_mode: formData.daily_prep_mode,
        daily_prep_offset: formData.daily_prep_mode === 'before' ? formData.daily_prep_offset : null,
        daily_prep_window: formData.daily_prep_mode === 'fixed' ? `${formData.daily_prep_start}-${formData.daily_prep_end}` : 'NONE',
        
        execution_type: formData.execution_type,
        execution_window: formData.execution_type === 'session' ? `${formData.execution_start}-${formData.execution_end}` : 'SIGNAL_BASED',
        
        review_mode: formData.review_mode,
        weekly_review_window: formData.review_mode === 'weekly' ? `${formData.review_day} ${formData.review_start}-${formData.review_end}` : 'NONE',
      })

      await supabase.from('user_trading_modules').upsert({
        user_id: userId,
        shift_start: formData.execution_type === 'session' && formData.execution_start ? `${formData.execution_start}:00` : '00:00:00',
        shift_end: formData.execution_type === 'session' && formData.execution_end ? `${formData.execution_end}:00` : '23:59:59',
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
        
        {isPreviewMode && (
          <div className="absolute top-0 w-full bg-amber-500/10 border-b border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest text-center py-2 z-50 flex items-center justify-center gap-2">
            <AlertTriangle size={14} /> Preview Mode Active — No Data Saved
          </div>
        )}

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
                  <Layers className="text-blue-500" size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Trading Scope</h4>
                  <p className="text-sm font-bold text-white uppercase tracking-wide">
                    {formData.scope_type === 'single' ? 'Focused Asset' : 'Multi-Market'}
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-0.5 truncate max-w-[150px]">
                    {formData.target_assets.length > 0 ? formData.target_assets.join(', ') : 'Pending Assets'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl shrink-0 border border-amber-500/20">
                  <Clock className="text-amber-500" size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Execution Behavior</h4>
                  <p className="text-sm font-bold text-white uppercase tracking-wide">
                    {formData.execution_type === 'session' ? 'Strict Session Window' : 'Signal Driven'}
                  </p>
                  {formData.execution_type === 'session' && (
                    <p className="text-[10px] text-neutral-500 mt-0.5">{formData.execution_start || '--:--'} to {formData.execution_end || '--:--'}</p>
                  )}
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
  const progressPercentage = (currentStep / 6) * 100;
  
  const phaseTitles = [
    "Phase 1: Trading Scope",
    "Phase 2: Weekly Preparation",
    "Phase 3: Daily Preparation",
    "Phase 4: Execution Behavior",
    "Phase 5: Review Process",
    "Phase 6: Protocol Confirmation"
  ]

  const ASSETS = ['Forex', 'Crypto', 'Commodities', 'Stocks', 'Indices']

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-50 flex flex-col font-sans selection:bg-blue-500/30 relative">
      
      {/* PREVIEW BANNER */}
      {isPreviewMode && (
        <div className="absolute top-0 w-full bg-amber-500/10 border-b border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest text-center py-2 z-[100] flex items-center justify-center gap-2">
          <AlertTriangle size={14} /> Preview Mode Active — No Data Will Be Saved
        </div>
      )}

      {/* GLOBAL PROGRESS HEADER */}
      <div className={`w-full border-b border-neutral-900 bg-[#0a0a0a] pt-8 pb-6 px-6 sticky z-50 ${isPreviewMode ? 'top-8' : 'top-0'}`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-blue-500 uppercase tracking-widest">
              {phaseTitles[currentStep - 1]}
            </h2>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Step {currentStep} of 6
            </span>
          </div>
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
        
        {/* STEP 1: TRADING SCOPE */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Select your trading scope</h1>
              <p className="text-neutral-400 text-sm">This establishes the asset classes you monitor and execute within.</p>
            </div>
            
            <div className="grid gap-4">
              <button onClick={() => setFormData({...formData, scope_type: 'single'})} className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.scope_type === 'single' ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}>
                <span className={`text-sm font-black uppercase tracking-wide ${formData.scope_type === 'single' ? 'text-blue-400' : 'text-white'}`}>Single / Limited Asset Trader</span>
              </button>
              <button onClick={() => setFormData({...formData, scope_type: 'multi'})} className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.scope_type === 'multi' ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}>
                <span className={`text-sm font-black uppercase tracking-wide ${formData.scope_type === 'multi' ? 'text-blue-400' : 'text-white'}`}>Multi-Market Trader</span>
              </button>
            </div>

            <div className="pt-4 border-t border-neutral-900">
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-4">Select your markets</label>
              <div className="grid gap-4 md:grid-cols-2">
                {ASSETS.map(asset => {
                  const isSelected = formData.target_assets.includes(asset);
                  return (
                    <button key={asset} onClick={() => toggleAsset(asset)} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'bg-white/10 border-white/30 text-white shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}>
                      <span className="text-sm font-bold tracking-wide">{asset}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'border-white bg-white text-black' : 'border-neutral-700 bg-transparent'}`}>
                        {isSelected && <CheckSquare size={10} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: WEEKLY PREP */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Select your weekly preparation approach</h1>
              <p className="text-neutral-400 text-sm">This defines when you map out macro zones and weekly thesis.</p>
            </div>
            
            <div className="grid gap-4">
              <button onClick={() => setFormData({...formData, weekly_prep_mode: 'structured'})} className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.weekly_prep_mode === 'structured' ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}>
                <span className={`text-sm font-black uppercase tracking-wide ${formData.weekly_prep_mode === 'structured' ? 'text-blue-400' : 'text-white'}`}>I prepare a structured plan before the trading week</span>
              </button>
              <button onClick={() => setFormData({...formData, weekly_prep_mode: 'none'})} className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.weekly_prep_mode === 'none' ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}>
                <span className={`text-sm font-black uppercase tracking-wide ${formData.weekly_prep_mode === 'none' ? 'text-blue-400' : 'text-white'}`}>I do not follow a weekly preparation routine</span>
              </button>
            </div>

            {formData.weekly_prep_mode === 'structured' && (
              <div className="pt-4 border-t border-neutral-900 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select value={formData.weekly_prep_day} onChange={(e) => setFormData({...formData, weekly_prep_day: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none appearance-none">
                    <option value="">Select Day</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                  </select>
                  <input type="time" value={formData.weekly_prep_start} onChange={(e) => setFormData({...formData, weekly_prep_start: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                  <input type="time" value={formData.weekly_prep_end} onChange={(e) => setFormData({...formData, weekly_prep_end: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DAILY PREP */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Select your daily preparation approach</h1>
              <p className="text-neutral-400 text-sm">This sets your pre-market routine for filtering actionable daily setups.</p>
            </div>
            
            <div className="grid gap-4">
              <button onClick={() => setFormData({...formData, daily_prep_mode: 'before'})} className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.daily_prep_mode === 'before' ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}>
                <span className={`text-sm font-black uppercase tracking-wide ${formData.daily_prep_mode === 'before' ? 'text-blue-400' : 'text-white'}`}>Before my trading session</span>
              </button>
              
              {formData.daily_prep_mode === 'before' && (
                <div className="pl-6 animate-in fade-in duration-300">
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Select preparation offset</label>
                  <div className="flex flex-wrap gap-3">
                    {['15', '30', '60'].map(mins => (
                      <button key={mins} onClick={() => setFormData({...formData, daily_prep_offset: mins})} className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${formData.daily_prep_offset === mins ? 'bg-white text-black border-white' : 'bg-[#111] border-neutral-800 text-neutral-400 hover:text-white'}`}>
                        {mins === '60' ? '1 hour' : `${mins} mins`} before
                      </button>
                    ))}
                    <button onClick={() => setFormData({...formData, daily_prep_offset: 'custom'})} className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${formData.daily_prep_offset === 'custom' ? 'bg-white text-black border-white' : 'bg-[#111] border-neutral-800 text-neutral-400 hover:text-white'}`}>
                      Custom
                    </button>
                  </div>
                </div>
              )}

              <button onClick={() => setFormData({...formData, daily_prep_mode: 'fixed'})} className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.daily_prep_mode === 'fixed' ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}>
                <span className={`text-sm font-black uppercase tracking-wide ${formData.daily_prep_mode === 'fixed' ? 'text-blue-400' : 'text-white'}`}>During a fixed time window</span>
              </button>

              {formData.daily_prep_mode === 'fixed' && (
                <div className="pl-6 animate-in fade-in duration-300">
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Select time range</label>
                  <div className="grid grid-cols-2 gap-4 max-w-sm">
                    <input type="time" value={formData.daily_prep_start} onChange={(e) => setFormData({...formData, daily_prep_start: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                    <input type="time" value={formData.daily_prep_end} onChange={(e) => setFormData({...formData, daily_prep_end: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                  </div>
                </div>
              )}

              <button onClick={() => setFormData({...formData, daily_prep_mode: 'none'})} className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.daily_prep_mode === 'none' ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}>
                <span className={`text-sm font-black uppercase tracking-wide ${formData.daily_prep_mode === 'none' ? 'text-blue-400' : 'text-white'}`}>I do not follow a fixed preparation routine</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: EXECUTION BEHAVIOR */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Select your execution approach</h1>
              <p className="text-neutral-400 text-sm">This defines when and how you are allowed to execute trades.</p>
            </div>
            
            <div className="grid gap-4">
              <button onClick={() => setFormData({...formData, execution_type: 'session'})} className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.execution_type === 'session' ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}>
                <span className={`text-sm font-black uppercase tracking-wide ${formData.execution_type === 'session' ? 'text-blue-400' : 'text-white'}`}>I trade during specific session hours</span>
              </button>
              
              {formData.execution_type === 'session' && (
                <div className="pl-6 animate-in fade-in duration-300">
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Select execution time range</label>
                  <div className="grid grid-cols-2 gap-4 max-w-sm">
                    <input type="time" value={formData.execution_start} onChange={(e) => setFormData({...formData, execution_start: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                    <input type="time" value={formData.execution_end} onChange={(e) => setFormData({...formData, execution_end: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                  </div>
                </div>
              )}

              <button onClick={() => setFormData({...formData, execution_type: 'signal'})} className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.execution_type === 'signal' ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}>
                <span className={`text-sm font-black uppercase tracking-wide ${formData.execution_type === 'signal' ? 'text-blue-400' : 'text-white'}`}>I execute trades based on signals and confirmations, regardless of time</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW PROCESS */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Select your review process</h1>
              <p className="text-neutral-400 text-sm">This establishes when you audit your data and behavioral performance.</p>
            </div>
            
            <div className="grid gap-4">
              <button onClick={() => setFormData({...formData, review_mode: 'weekly'})} className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.review_mode === 'weekly' ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}>
                <span className={`text-sm font-black uppercase tracking-wide ${formData.review_mode === 'weekly' ? 'text-blue-400' : 'text-white'}`}>I review my trades and behavior weekly</span>
              </button>
              
              {formData.review_mode === 'weekly' && (
                <div className="pl-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select value={formData.review_day} onChange={(e) => setFormData({...formData, review_day: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none appearance-none">
                      <option value="">Select Day</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                    <input type="time" value={formData.review_start} onChange={(e) => setFormData({...formData, review_start: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                    <input type="time" value={formData.review_end} onChange={(e) => setFormData({...formData, review_end: e.target.value})} className="bg-[#111] border border-neutral-800 text-white text-sm rounded-xl focus:border-blue-500 block w-full p-3 outline-none [color-scheme:dark]" />
                  </div>
                </div>
              )}

              <button onClick={() => setFormData({...formData, review_mode: 'none'})} className={`flex flex-col text-left p-5 rounded-2xl border transition-all ${formData.review_mode === 'none' ? 'bg-blue-500/10 border-blue-500/50 shadow-inner' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'}`}>
                <span className={`text-sm font-black uppercase tracking-wide ${formData.review_mode === 'none' ? 'text-blue-400' : 'text-white'}`}>I do not follow a structured review process</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: PROTOCOL CONFIRMATION */}
        {currentStep === 6 && (
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

          {currentStep < 6 ? (
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
