'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, ArrowLeftRight, Clock, Globe, ShieldCheck, BadgeCheck, Shield, Loader2 } from 'lucide-react'

export default function SettingsClient({ userId, initialTimezone, initialModule }: any) {
  // Terminology State
  const [terminology, setTerminology] = useState<'LONG_SHORT' | 'BUY_SELL'>('LONG_SHORT')
  const [isTerminologyLoading, setIsTerminologyLoading] = useState(true)

  // Contract State
  const [formData, setFormData] = useState({
    timezone: initialTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    shift_start: initialModule?.shift_start?.slice(0, 5) || '08:00',
    shift_end: initialModule?.shift_end?.slice(0, 5) || '12:00',
    weekly_prep_time: initialModule?.weekly_prep_time?.slice(0, 5) || '20:00',
    daily_prep_time: initialModule?.daily_prep_time?.slice(0, 5) || '07:00',
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  // Load User Display Preferences
  useEffect(() => {
    const loadPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.trade_terminology) {
        setTerminology(user.user_metadata.trade_terminology)
      }
      setIsTerminologyLoading(false)
    }
    loadPreferences()
  }, [])

  const handleTerminologyChange = async (val: 'LONG_SHORT' | 'BUY_SELL') => {
    setTerminology(val)
    const { error } = await supabase.auth.updateUser({ data: { trade_terminology: val } })
    if (error) showToast('Failed to update terminology.', 'error')
    else showToast('Display preferences updated.', 'success')
  }

  const handleSaveProtocol = async () => {
    setIsSaving(true)
    try {
      // 1. Update Timezone in profile
      await supabase.from('profiles').update({ timezone: formData.timezone }).eq('id', userId)
      await supabase.from('operator_profiles').upsert({ user_id: userId, timezone: formData.timezone })

      // 2. Update the Chief Risk Officer parameters
      const { error } = await supabase.from('user_trading_modules')
        .update({
          shift_start: `${formData.shift_start}:00`,
          shift_end: `${formData.shift_end}:00`,
          weekly_prep_time: `${formData.weekly_prep_time}:00`,
          daily_prep_time: `${formData.daily_prep_time}:00`,
        })
        .eq('user_id', userId)

      if (error) throw error
      showToast('Protocol updated successfully.', 'success')
    } catch (error) {
      console.error(error)
      showToast('Failed to update protocol.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in duration-500 relative pb-10">
      
      <div>
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Operator Protocol</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
          Modify your behavioral contract. The Chief Risk Officer will adapt to these new parameters instantly.
        </p>
      </div>

      {/* DISPLAY TERMINOLOGY */}
      <div className="bg-[#000000] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center">
          <ArrowLeftRight className="mr-2 text-neutral-500" size={16} /> Display Terminology
        </h3>
        <p className="text-[10px] text-neutral-500 font-medium mb-6">
          Switch between institutional (Long/Short) or retail (Buy/Sell) phrasing.
        </p>
        
        <div className="flex items-center gap-2 bg-[#000000] border border-neutral-800 rounded-xl p-1.5 w-full md:w-fit shadow-inner">
          {isTerminologyLoading ? (
             <div className="px-8 py-3 text-[10px] text-neutral-500 font-bold uppercase tracking-widest animate-pulse text-center w-[200px]">Loading...</div>
          ) : (
            <>
              <button onClick={() => handleTerminologyChange('LONG_SHORT')} className={`flex-1 md:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${terminology === 'LONG_SHORT' ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/50' : 'text-neutral-500 hover:text-white border border-transparent'}`}>Long / Short</button>
              <button onClick={() => handleTerminologyChange('BUY_SELL')} className={`flex-1 md:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${terminology === 'BUY_SELL' ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/50' : 'text-neutral-500 hover:text-white border border-transparent'}`}>Buy / Sell</button>
            </>
          )}
        </div>
      </div>

      {/* CHRONOLOGY & SHIFT */}
      <div className="bg-[#000000] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center">
          <Globe className="mr-2 text-blue-500" size={16} /> Chronology & Shifts
        </h3>
        <p className="text-[10px] text-neutral-500 font-medium mb-6">Update your active timezone and deep-work execution window.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Local Timezone</label>
            <input type="text" disabled value={formData.timezone} className="w-full bg-[#000000] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-zinc-400 opacity-70 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-blue-500 uppercase tracking-widest ml-1">Shift Start</label>
            <input type="time" value={formData.shift_start} onChange={e => setFormData({...formData, shift_start: e.target.value})} className="w-full bg-[#000000] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-blue-500 uppercase tracking-widest ml-1">Shift End</label>
            <input type="time" value={formData.shift_end} onChange={e => setFormData({...formData, shift_end: e.target.value})} className="w-full bg-[#000000] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-colors" />
          </div>
        </div>
      </div>

      {/* ROUTINE PROTOCOL */}
      <div className="bg-[#000000] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center">
          <Clock className="mr-2 text-purple-500" size={16} /> Routine Protocol
        </h3>
        <p className="text-[10px] text-neutral-500 font-medium mb-6">Adjust your strict preparation deadlines.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-purple-500 uppercase tracking-widest ml-1">Sunday Macro Deadline</label>
            <input type="time" value={formData.weekly_prep_time} onChange={e => setFormData({...formData, weekly_prep_time: e.target.value})} className="w-full bg-[#000000] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-purple-500/50 transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-purple-500 uppercase tracking-widest ml-1">Daily Sniper Deadline</label>
            <input type="time" value={formData.daily_prep_time} onChange={e => setFormData({...formData, daily_prep_time: e.target.value})} className="w-full bg-[#000000] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-purple-500/50 transition-colors" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-900">
          <button onClick={handleSaveProtocol} disabled={isSaving} className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]">
            {isSaving ? <><Loader2 size={14} className="mr-2 animate-spin" /> Syncing...</> : <><Save size={14} className="mr-2" /> Sync Protocol</>}
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {message && (
        <div className={`fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[200] px-5 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[2rem] border shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 flex items-center gap-3 md:gap-4 w-[90%] md:w-auto max-w-sm ${message.type === 'success' ? 'bg-[#0a0a0c] border-emerald-500/50 text-emerald-500' : 'bg-[#0a0a0c] border-red-500/50 text-red-500'}`}>
          <div className={`p-1.5 md:p-2 rounded-lg shrink-0 ${message.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {message.type === 'success' ? <BadgeCheck size={16}/> : <Shield size={16}/>}
          </div>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-widest leading-snug">{message.text}</p>
        </div>
      )}
    </div>
  )
}