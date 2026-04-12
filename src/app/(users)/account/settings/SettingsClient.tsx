'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Lock, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function SettingsClient({ userId, initialFullName, initialUsername, isTelegramLinked, telegramHandle }: any) {
  // General State
  const [fullName, setFullName] = useState(initialFullName || '')
  const [savingGeneral, setSavingGeneral] = useState(false)

  // Username State (Lockable)
  const [username, setUsername] = useState(initialUsername || '')
  const [savingUsername, setSavingUsername] = useState(false)
  const isUsernameLocked = !!initialUsername

  // Telegram OTP State
  const [code, setCode] = useState<string | null>(null)
  const [generatingCode, setGeneratingCode] = useState(false)

  // Realtime Auto-Refresh when Bot confirms linking
  useEffect(() => {
    if (!userId || isTelegramLinked) return

    const channel = supabase
      .channel('profile-sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          if (payload.new.telegram_user_id) {
            window.location.reload() // Auto-refresh the UI!
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, isTelegramLinked])

  // 1. Save General Info (Using Upsert to guarantee the row is created)
  const handleSaveGeneral = async () => {
    setSavingGeneral(true)
    
    // Upsert ensures if the row is missing, it creates it. If it exists, it updates it.
    await supabase.from('profiles').upsert({ 
      id: userId, 
      full_name: fullName 
    })
    
    // Keep auth metadata in sync
    await supabase.auth.updateUser({ data: { full_name: fullName } })
    
    setSavingGeneral(false)
    window.location.reload()
  }

  // 2. Lock in Username
  const handleLockUsername = async () => {
    if (!username.trim()) return
    const confirmLock = window.confirm(`Are you sure you want to lock in "@${username}"? This CANNOT be changed later.`)
    if (!confirmLock) return

    setSavingUsername(true)
    const { error } = await supabase.from('profiles').update({ username: username.trim() }).eq('id', userId)
    if (!error) {
      window.location.reload() 
    } else {
      alert("Username might be taken, try another.")
      setSavingUsername(false)
    }
  }

  // 3. Generate Telegram Sync Code
  const generateCode = async () => {
    setGeneratingCode(true)
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Upsert guarantees the code is saved even if the user profile row was missing
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        telegram_verification_code: newCode 
      })

    if (!error) {
      setCode(newCode)
    } else {
      console.error("Failed to save code:", error)
      alert("Error saving code to database. Check the console.")
    }
    setGeneratingCode(false)
  }

  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Account Settings</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
          Manage your permanent identity and integrations.
        </p>
      </div>

      {/* SECTION 1: PERMANENT USERNAME */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center">
          <Lock className="mr-2 text-neutral-500" size={16} /> Permanent Platform Username
        </h3>
        <p className="text-[10px] text-neutral-500 font-medium mb-6">
          Your platform username is your permanent reputation on the trading floor. For security, it can only be set once.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-black">@</span>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isUsernameLocked}
              placeholder="Set your username..."
              className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 pl-8 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-colors shadow-inner disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>
          {!isUsernameLocked && (
            <button 
              onClick={handleLockUsername}
              disabled={savingUsername || !username}
              className="px-6 py-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
            >
              {savingUsername ? 'Locking...' : 'Lock Forever'}
            </button>
          )}
        </div>
      </div>

      {/* SECTION 2: TELEGRAM SYNC */}
      <div className="bg-blue-500/[0.02] border border-blue-500/20 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center">
          <Smartphone className="mr-2" size={16} /> Telegram Integration
        </h3>
        <p className="text-[10px] text-neutral-500 font-medium mb-6">
          Link your mobile Telegram app to seamlessly chat on the live floor while you are away from your desk.
        </p>

        {isTelegramLinked ? (
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center">
            <CheckCircle2 className="text-green-500 mr-3" size={20} />
            <div>
              <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Successfully Linked</p>
              <p className="text-[10px] text-green-500/70 mt-1">Your messages from @{telegramHandle} will appear on the floor securely.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!code ? (
              <button 
                onClick={generateCode}
                disabled={generatingCode}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center"
              >
                {generatingCode ? <RefreshCw className="animate-spin mr-2" size={14} /> : null}
                Generate Link Code
              </button>
            ) : (
              <div className="bg-black border border-neutral-800 p-6 rounded-xl text-center">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Direct Message this code to the bot:</p>
                <p className="text-lg font-black text-blue-500 mb-4">@sentinel_vortex_bot</p>
                <div className="text-5xl font-mono tracking-[0.2em] text-white bg-[#050505] border border-neutral-800 py-4 rounded-xl">
                  {code}
                </div>
                <p className="text-[9px] text-neutral-500 mt-4 uppercase tracking-widest">
                  (Waiting for confirmation... this page will auto-refresh)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: GENERAL SETTINGS */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-6">General Settings</h3>
        <div className="space-y-2 mb-6">
          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Full Name (Private)</label>
          <input 
            type="text" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-colors shadow-inner"
          />
        </div>
        <div className="flex justify-end">
          <button 
            onClick={handleSaveGeneral}
            disabled={savingGeneral}
            className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center"
          >
            {savingGeneral ? 'Saving...' : <><Save size={14} className="mr-2" /> Save General</>}
          </button>
        </div>
      </div>

    </div>
  )
}
