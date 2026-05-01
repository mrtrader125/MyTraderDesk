'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Mail, Smartphone, Lock, Key, CheckCircle2, ShieldCheck, RefreshCw, Save, Loader2, Shield, BadgeCheck } from 'lucide-react'

export default function ProfileClient({ userId, email, initialFullName, initialUsername, telegramHandle, isTelegramLinked }: any) {
  const [fullName, setFullName] = useState(initialFullName || '')
  const [savingGeneral, setSavingGeneral] = useState(false)
  const [username, setUsername] = useState(initialUsername || '')
  const [savingUsername, setSavingUsername] = useState(false)
  const isUsernameLocked = !!initialUsername

  const [code, setCode] = useState<string | null>(null)
  const [generatingCode, setGeneratingCode] = useState(false)
  
  const [newPassword, setNewPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  useEffect(() => {
    if (!userId || isTelegramLinked) return
    const channel = supabase.channel('profile-sync').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, (payload) => {
      if (payload.new.telegram_user_id) window.location.reload()
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, isTelegramLinked])

  const handleSaveGeneral = async () => {
    setSavingGeneral(true)
    await supabase.from('profiles').upsert({ id: userId, full_name: fullName })
    await supabase.auth.updateUser({ data: { full_name: fullName } })
    setSavingGeneral(false)
    showToast('Name updated.', 'success')
  }

  const handleLockUsername = async () => {
    if (!username.trim() || !window.confirm(`Lock in "@${username}"? This CANNOT be changed.`)) return
    setSavingUsername(true)
    const { error } = await supabase.from('profiles').update({ username: username.trim() }).eq('id', userId)
    if (!error) window.location.reload() 
    else { showToast("Username taken.", 'error'); setSavingUsername(false) }
  }

  const generateCode = async () => {
    setGeneratingCode(true)
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()
    const { error } = await supabase.from('profiles').upsert({ id: userId, telegram_verification_code: newCode })
    if (!error) setCode(newCode)
    setGeneratingCode(false)
  }

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) return showToast('Password must be 6+ characters.', 'error')
    setIsUpdatingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) { setNewPassword(''); showToast('Password updated securely.', 'success') }
    else showToast('Failed to update password.', 'error')
    setIsUpdatingPassword(false)
  }

  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      
      <div>
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Identity & Security</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">Manage your permanent identity and platform access.</p>
      </div>

      {/* CORE IDENTITY */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center"><User className="mr-2 text-neutral-500" size={16} /> Core Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Email (Read Only)</label>
            <div className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-neutral-600 shadow-inner truncate">{email}</div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Full Name (Private)</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 shadow-inner" />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-neutral-900">
          <button onClick={handleSaveGeneral} disabled={savingGeneral} className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50">
            {savingGeneral ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </div>

      {/* PERMANENT USERNAME */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center"><Lock className="mr-2 text-neutral-500" size={16} /> Public Reputation</h3>
        <p className="text-[10px] text-neutral-500 font-medium mb-6">Your permanent username on the trading floor. For security, it can only be set once.</p>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-black">@</span>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isUsernameLocked} placeholder="Set username..." className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 pl-8 pr-4 text-xs font-bold text-white shadow-inner disabled:opacity-70 disabled:cursor-not-allowed outline-none focus:border-blue-500" />
          </div>
          {!isUsernameLocked && (
            <button onClick={handleLockUsername} disabled={savingUsername || !username} className="px-6 py-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50">
              {savingUsername ? 'Locking...' : 'Lock Forever'}
            </button>
          )}
        </div>
      </div>

      {/* TELEGRAM SYNC */}
      <div className="bg-blue-500/[0.02] border border-blue-500/20 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center"><Smartphone className="mr-2" size={16} /> Terminal Integration</h3>
        <p className="text-[10px] text-neutral-500 font-medium mb-6">Link your mobile Telegram to chat on the live floor and receive Chief Risk Officer alerts.</p>
        {isTelegramLinked ? (
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center">
            <CheckCircle2 className="text-green-500 mr-3" size={20} />
            <div>
              <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Successfully Linked</p>
              <p className="text-[10px] text-green-500/70 mt-1">Authenticated as @{telegramHandle}</p>
            </div>
          </div>
        ) : !code ? (
          <button onClick={generateCode} disabled={generatingCode} className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center">
            {generatingCode ? <RefreshCw className="animate-spin mr-2" size={14} /> : 'Generate Auth Code'}
          </button>
        ) : (
          <div className="bg-black border border-neutral-800 p-6 rounded-xl text-center">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">DM this code to @sentinel_vortex_bot:</p>
            <div className="text-4xl font-mono tracking-[0.2em] text-white bg-[#050505] border border-neutral-800 py-4 rounded-xl mb-4">{code}</div>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest">(Waiting for confirmation... auto-refreshing)</p>
          </div>
        )}
      </div>

      {/* SECURITY (CHANGE PASSWORD) */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center"><Key className="mr-2 text-neutral-500" size={16} /> Access Security</h3>
        <p className="text-[10px] text-neutral-500 font-medium mb-6">Updating your password will immediately terminate all other active sessions globally.</p>
        <div className="flex flex-col md:flex-row gap-4">
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="flex-1 bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500/50 shadow-inner" />
          <button onClick={handlePasswordUpdate} disabled={isUpdatingPassword || !newPassword} className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-all disabled:opacity-50">
            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* TOAST */}
      {message && (
        <div className={`fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[200] px-5 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[2rem] border shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 flex items-center gap-3 w-auto max-w-sm ${message.type === 'success' ? 'bg-[#0a0a0c] border-emerald-500/50 text-emerald-500' : 'bg-[#0a0a0c] border-red-500/50 text-red-500'}`}>
          <div className={`p-1.5 md:p-2 rounded-lg shrink-0 ${message.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {message.type === 'success' ? <BadgeCheck size={16}/> : <Shield size={16}/>}
          </div>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-widest leading-snug">{message.text}</p>
        </div>
      )}
    </div>
  )
}