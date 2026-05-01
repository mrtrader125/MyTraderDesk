'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // New Protocol Data State
  const [formData, setFormData] = useState({
    timezone: '',
    strategy_status: 'defined', // 'defined' or 'developing'
    weekly_analysis_day: '',
    weekly_analysis_start: '',
    weekly_analysis_end: '',
    daily_prep_start: '',
    daily_prep_end: '',
    execution_type: 'fixed', // 'fixed' or 'alert'
    execution_start: '',
    execution_end: '',
    weekly_review_day: '',
    weekly_review_start: '',
    weekly_review_end: '',
    accepted_risk_contract: false
  })

  // Auto-detect timezone on mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    }))
  }, [])

  const handleInitialize = async () => {
    if (!formData.accepted_risk_contract) return;
    setIsSubmitting(true)

    try {
      // 1. Save Timezone to Profiles
      await supabase.from('profiles')
        .update({ timezone: formData.timezone })
        .eq('id', userId)

      // 2. Save the new operational parameters to Operator Profiles
      await supabase.from('operator_profiles')
        .upsert({ 
          user_id: userId, 
          timezone: formData.timezone,
          strategy_status: formData.strategy_status,
          weekly_analysis_window: `${formData.weekly_analysis_day} ${formData.weekly_analysis_start}-${formData.weekly_analysis_end}`,
          daily_prep_window: `${formData.daily_prep_start}-${formData.daily_prep_end}`,
          execution_type: formData.execution_type,
          execution_window: `${formData.execution_start}-${formData.execution_end}`,
          weekly_review_window: `${formData.weekly_review_day} ${formData.weekly_review_start}-${formData.weekly_review_end}`,
        })

      // 3. Initialize the Trading Module with the strict MyTraderDesk rules
      await supabase.from('user_trading_modules')
        .upsert({
          user_id: userId,
          shift_start: `${formData.execution_start}:00`,
          shift_end: `${formData.execution_end}:00`,
          max_daily_trades: 2,
          max_staged_assets: 5,
          status: 'ACTIVE',
          current_day_state: 'AWAITING_PREP'
        })

      // 4. Route to terminal
      router.push('/desk')
    } catch (error) {
      console.error("Initialization Error:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center py-12 px-6 font-sans">
      
      <div className="w-full max-w-2xl space-y-10">
        
        {/* Header */}
        <div className="space-y-2 border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">System Configuration</h1>
          <p className="text-zinc-400 text-sm">
            Define your operational parameters to initialize the protocol. Local timezone detected as <span className="text-zinc-200 font-mono">{formData.timezone}</span>.
          </p>
        </div>

        <div className="space-y-10">
          
          {/* 1. Strategy Status */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-200">
              1. What is the current status of your trading strategy?
            </label>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.strategy_status === 'defined'}
                  onChange={() => setFormData({...formData, strategy_status: 'defined'})}
                  className="form-radio text-zinc-100 bg-zinc-900 border-zinc-700 focus:ring-zinc-500 focus:ring-offset-zinc-950" 
                />
                <span className="text-sm text-zinc-300">Defined with strict rules</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.strategy_status === 'developing'}
                  onChange={() => setFormData({...formData, strategy_status: 'developing'})}
                  className="form-radio text-zinc-100 bg-zinc-900 border-zinc-700 focus:ring-zinc-500 focus:ring-offset-zinc-950" 
                />
                <span className="text-sm text-zinc-300">Currently in development / testing</span>
              </label>
            </div>
          </div>

          {/* 2. Weekly Analysis */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-200">
              2. When do you conduct your weekly market analysis to define your macro zones?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select 
                value={formData.weekly_analysis_day}
                onChange={(e) => setFormData({...formData, weekly_analysis_day: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-md focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5 outline-none"
              >
                <option value="">Select Day</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
              </select>
              <input 
                type="time" 
                value={formData.weekly_analysis_start}
                onChange={(e) => setFormData({...formData, weekly_analysis_start: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-md focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5 outline-none [color-scheme:dark]" 
              />
              <input 
                type="time" 
                value={formData.weekly_analysis_end}
                onChange={(e) => setFormData({...formData, weekly_analysis_end: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-md focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5 outline-none [color-scheme:dark]" 
              />
            </div>
          </div>

          {/* 3. Daily Prep */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-200">
              3. When is your daily prep time to filter setups into an actionable daily plan?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="time" 
                value={formData.daily_prep_start}
                onChange={(e) => setFormData({...formData, daily_prep_start: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-md focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5 outline-none [color-scheme:dark]" 
              />
              <input 
                type="time" 
                value={formData.daily_prep_end}
                onChange={(e) => setFormData({...formData, daily_prep_end: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-md focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5 outline-none [color-scheme:dark]" 
              />
            </div>
          </div>

          {/* 4. Execution Window */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-200">
              4. When is your Execution Window?
            </label>
            <p className="text-xs text-zinc-500 mt-1 mb-3">Outside these hours, you are off-duty. Charts should be closed.</p>
            <div className="space-y-5 p-5 border border-zinc-800 bg-zinc-900/30 rounded-md">
              <div className="flex flex-col space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={formData.execution_type === 'fixed'}
                    onChange={() => setFormData({...formData, execution_type: 'fixed'})}
                    className="form-radio mt-1 text-zinc-100 bg-zinc-900 border-zinc-700 focus:ring-zinc-500 focus:ring-offset-zinc-950" 
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-300">Fixed Session Times</span>
                    <span className="text-xs text-zinc-500">I sit at the desk during specific hours to execute.</span>
                  </div>
                </label>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={formData.execution_type === 'alert'}
                    onChange={() => setFormData({...formData, execution_type: 'alert'})}
                    className="form-radio mt-1 text-zinc-100 bg-zinc-900 border-zinc-700 focus:ring-zinc-500 focus:ring-offset-zinc-950" 
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-300">Alert-Based (Active Window)</span>
                    <span className="text-xs text-zinc-500">I execute on alerts, but only within my permitted active hours.</span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
                <input 
                  type="time" 
                  value={formData.execution_start}
                  onChange={(e) => setFormData({...formData, execution_start: e.target.value})}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-md focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5 outline-none [color-scheme:dark]" 
                  placeholder="Start Time"
                />
                <input 
                  type="time" 
                  value={formData.execution_end}
                  onChange={(e) => setFormData({...formData, execution_end: e.target.value})}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-md focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5 outline-none [color-scheme:dark]" 
                  placeholder="End Time"
                />
              </div>
            </div>
          </div>

          {/* 5. Weekly Review */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-200">
              5. When do you conduct your weekly autopsy to review trade data and behavior?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select 
                value={formData.weekly_review_day}
                onChange={(e) => setFormData({...formData, weekly_review_day: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-md focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5 outline-none"
              >
                <option value="">Select Day</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
              <input 
                type="time" 
                value={formData.weekly_review_start}
                onChange={(e) => setFormData({...formData, weekly_review_start: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-md focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5 outline-none [color-scheme:dark]" 
              />
              <input 
                type="time" 
                value={formData.weekly_review_end}
                onChange={(e) => setFormData({...formData, weekly_review_end: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-md focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5 outline-none [color-scheme:dark]" 
              />
            </div>
          </div>

          {/* Risk Contract & Submit */}
          <div className="pt-10 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-md p-5">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.accepted_risk_contract}
                  onChange={(e) => setFormData({...formData, accepted_risk_contract: e.target.checked})}
                  className="form-checkbox mt-1 text-zinc-100 bg-zinc-900 border-zinc-700 rounded focus:ring-zinc-500 focus:ring-offset-zinc-950" 
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-200">I accept the Operator Protocol</span>
                  <span className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    By initializing, I agree to the platform's constraints: Maximum 2 trades daily, a limit of 5 staged daily assets, and a commitment to zero-outcome grading for behavioral consistency.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleInitialize}
                disabled={!formData.accepted_risk_contract || isSubmitting}
                className="px-8 py-3 bg-zinc-100 text-zinc-950 text-sm font-semibold rounded-md hover:bg-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Initializing...' : 'Initialize Protocol'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
