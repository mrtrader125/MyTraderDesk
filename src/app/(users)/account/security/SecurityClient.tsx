'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import { Save, ArrowLeftRight, Clock, Globe, ShieldCheck, BadgeCheck, Shield, Loader2 } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const fetchSettingsData = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  const [ { data: profile }, { data: module } ] = await Promise.all([
    supabase.from('profiles').select('timezone').eq('id', session.user.id).single(),
    supabase.from('user_trading_modules')
      .select('shift_start, shift_end, weekly_prep_time, daily_prep_time, max_daily_trades')
      .eq('user_id', session.user.id).maybeSingle()
  ])
  return { 
    userId: session.user.id, 
    profile, 
    module, 
    terminology: session.user.user_metadata?.trade_terminology || 'LONG_SHORT' 
  }
}

export default function SettingsClient() {
  const { data, isLoading, mutate } = useSWR('account_settings', fetchSettingsData, { dedupingInterval: 60000 })

  const [terminology, setTerminology] = useState<'LONG_SHORT' | 'BUY_SELL'>('LONG_SHORT')
  const [formData, setFormData] = useState({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    shift_start: '08:00',
    shift_end: '12:00',
    weekly_prep_time: '20:00',
    daily_prep_time: '07:00',
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    if (data) {
      setTerminology(data.terminology as any)
      setFormData({
        timezone: data.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        shift_start: data.module?.shift_start?.slice(0, 5) || '08:00',
        shift_end: data.module?.shift_end?.slice(0, 5) || '12:00',
        weekly_prep_time: data.module?.weekly_prep_time?.slice(0, 5) || '20:00',
        daily_prep_time: data.module?.daily_prep_time?.slice(0, 5) || '07:00',
      })
    }
  }, [data])

  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleTerminologyChange = async (val: 'LONG_SHORT' | 'BUY_SELL') => {
    setTerminology(val)
    const { error } = await supabase.auth.updateUser({ data: { trade_terminology: val } })
    if (error) showToast('Failed to update terminology.', 'error')
    else showToast('Display preferences updated.', 'success')
  }

  const handleSaveProtocol = async () => {
    if (!data?.userId) return;
    setIsSaving(true)
    try {
      await supabase.from('profiles').update({ timezone: formData.timezone }).eq('id', data.userId)
      await supabase.from('operator_profiles').upsert({ user_id: data.userId, timezone: formData.timezone })

      const { error } = await supabase.from('user_trading_modules')
        .update({
          shift_start: `${formData.shift_start}:00`,
          shift_end: `${formData.shift_end}:00`,
          weekly_prep_time: `${formData.weekly_prep_time}:00`,
          daily_prep_time: `${formData.daily_prep_time}:00`,
        })
        .eq('user_id', data.userId)

      if (error) throw error
      showToast('Protocol updated successfully.', 'success')
      mutate()
    } catch (error) {
      showToast('Failed to update protocol.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !data) {
    return (
      <div className="max-w-3xl space-y-6 md:space-y-8 relative">
        <div><div className="h-6 md:h-7 w-40 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse mb-2"></div><div className="h-3 w-64 bg-[#0a0a0a] border border-neutral-800 rounded-md animate-pulse"></div></div>
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm"><div className="h-4 w-48 bg-neutral-900 rounded animate-pulse mb-5 md:mb-6"></div><div className="space-y-3 md:space-y-4"><div className="flex items-center justify-between gap-4 p-4 md:p-5 bg-[#050505] border border-neutral-800 rounded-xl md:rounded-2xl"><div className="flex-1 space-y-2"><div className="h-3 w-32 bg-neutral-900 rounded animate-pulse"></div><div className="h-2 w-full max-w-sm bg-neutral-900 rounded animate-pulse"></div><div className="h-2 w-3/4 max-w-xs bg-neutral-900 rounded animate-pulse"></div></div><div className="w-9 h-5 md:w-10 md:h-6 bg-neutral-900 rounded-full animate-pulse shrink-0"></div></div><div className="flex items-center justify-between gap-4 p-4 md:p-5 bg-[#050505] border border-neutral-800 rounded-xl md:rounded-2xl"><div className="flex-1 space-y-2"><div className="h-3 w-32 bg-neutral-900 rounded animate-pulse"></div><div className="h-2 w-full max-w-sm bg-neutral-900 rounded animate-pulse"></div><div className="h-2 w-3/4 max-w-xs bg-neutral-900 rounded animate-pulse"></div></div><div className="w-9 h-5 md:w-10 md:h-6 bg-neutral-900 rounded-full animate-pulse shrink-0"></div></div></div></div>
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm"><div className="h-4 w-32 bg-neutral-900 rounded animate-pulse mb-5 md:mb-6"></div><div className="flex items-center justify-between gap-4 p-4 md:p-5 bg-[#050505] border border-neutral-800 rounded-xl md:rounded-2xl"><div className="flex-1 space-y-2"><div className="h-3 w-24 bg-neutral-900 rounded animate-pulse"></div><div className="h-2 w-full max-w-sm bg-neutral-900 rounded animate-pulse"></div><div className="h-2 w-3/4 max-w-xs bg-neutral-900 rounded animate-pulse"></div></div><div className="w-24 h-8 bg-neutral-900 rounded-lg animate-pulse shrink-0"></div></div></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in duration-500 relative pb-10">
      <div>
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Operator Protocol</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">Modify your behavioral contract. The Chief Risk Officer will adapt to these new parameters instantly.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center"><ArrowLeftRight className="mr-2 text-neutral-500" size={16} /> Display Terminology</h3>
        <p className="text-[10px] text-neutral-500 font-medium mb-6">Switch between institutional (Long/Short) or retail (Buy/Sell) phrasing.</p>
        <div className="flex items-center gap-2 bg-[#050505] border border-neutral-800 rounded-xl p-1.5 w-full md:w-fit shadow-inner">
          <button onClick={() => handleTerminologyChange('LONG_SHORT')} className={`flex-1 md:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${terminology === 'LONG_SHORT' ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/50' : 'text-neutral-500 hover:text-white border border-transparent'}`}>Long / Short</button>
          <button onClick={() => handleTerminologyChange('BUY_SELL')} className={`flex-1 md:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${terminology === 'BUY_SELL' ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/50' : 'text-neutral-500 hover:text-white border border-transparent'}`}>Buy / Sell</button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center"><Globe className="mr-2 text-blue-500" size={16} /> Chronology & Shifts</h3>
        <p className="text-[10px] text-neutral-500 font-medium mb-6">Update your active timezone and deep-work execution window.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Local Timezone</label>
            <input type="text" disabled value={formData.timezone} className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-zinc-400 opacity-70 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-blue-500 uppercase tracking-widest ml-1">Shift Start</label>
            <input type="time" value={formData.shift_start} onChange={e => setFormData({...formData, shift_start: e.target.value})} className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-blue-500 uppercase tracking-widest ml-1">Shift End</label>
            <input type="time" value={formData.shift_end} onChange={e => setFormData({...formData, shift_end: e.target.value})} className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-colors" />
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center"><Clock className="mr-2 text-purple-500" size={16} /> Routine Protocol</h3>
        <p className="text-[10px] text-neutral-500 font-medium mb-6">Adjust your strict preparation deadlines.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-purple-500 uppercase tracking-widest ml-1">Sunday Macro Deadline</label>
            <input type="time" value={formData.weekly_prep_time} onChange={e => setFormData({...formData, weekly_prep_time: e.target.value})} className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-purple-500/50 transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-purple-500 uppercase tracking-widest ml-1">Daily Sniper Deadline</label>
            <input type="time" value={formData.daily_prep_time} onChange={e => setFormData({...formData, daily_prep_time: e.target.value})} className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-purple-500/50 transition-colors" />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-neutral-900">
          <button onClick={handleSaveProtocol} disabled={isSaving} className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]">
            {isSaving ? <><Loader2 size={14} className="mr-2 animate-spin" /> Syncing...</> : <><Save size={14} className="mr-2" /> Sync Protocol</>}
          </button>
        </div>
      </div>

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
