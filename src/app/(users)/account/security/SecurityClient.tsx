'use client'

import { useState, useEffect } from 'react'
import { Key, ShieldCheck, Mail, BadgeCheck, Shield, Loader2, ArrowLeftRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SecurityClient({ userEmail }: { userEmail: string }) {
  // Toast Notification State
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  // Reset Link States
  const [isSendingReset, setIsSendingReset] = useState(false)

  // Manual Password States
  const [newPassword, setNewPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // 🚨 NEW: Trading Preferences State
  const [terminology, setTerminology] = useState<'LONG_SHORT' | 'BUY_SELL'>('LONG_SHORT')
  const [isTerminologyLoading, setIsTerminologyLoading] = useState(true)

  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  // Fetch initial preferences on mount
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

  // Handle Terminology Update
  const handleTerminologyChange = async (val: 'LONG_SHORT' | 'BUY_SELL') => {
    setTerminology(val)
    const { error } = await supabase.auth.updateUser({
      data: { trade_terminology: val }
    })

    if (error) {
      showToast('Failed to update terminology.', 'error')
    } else {
      showToast('Display preferences updated.', 'success')
    }
  }

  // 1. Send Magic Reset Link via Email
  const handleSendResetLink = async () => {
    if (!userEmail) return
    setIsSendingReset(true)

    try {
      const targetUrl = `${window.location.origin}/update-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: targetUrl,
      })

      if (error) {
        showToast(error.message, 'error')
      } else {
        showToast('Password reset link sent to your email', 'success')
      }
    } catch (err) {
      console.error(err)
      showToast('System error. Please try again.', 'error')
    } finally {
      setIsSendingReset(false)
    }
  }

  // 2. Direct Password Update
  const handleDirectPasswordUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error')
      return
    }
    setIsUpdating(true)

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      
      setNewPassword('')
      showToast('Password updated successfully.', 'success')
    } catch (err: any) {
      console.error(err)
      showToast(err.message || 'Failed to update password.', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 relative animate-in fade-in duration-500">
      
      {/* 🚨 TRADING PREFERENCES MODULE */}
      <div>
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Preferences</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">Customize your platform display language.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-5 md:mb-6 flex items-center">
          <ArrowLeftRight className="mr-2 text-neutral-500" size={16} /> Trade Terminology
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-6 p-4 md:p-5 border border-neutral-800 rounded-xl md:rounded-2xl bg-[#050505] shadow-inner">
          <div className="flex-1">
            <p className="text-[11px] md:text-xs font-bold text-white tracking-widest truncate">Directional Labels</p>
            <p className="text-[9px] md:text-[10px] font-medium text-neutral-500 mt-1.5 md:mt-1 max-w-sm leading-relaxed">
              Switch between institutional (Long/Short) or retail (Buy/Sell) phrasing. This only changes the UI, your underlying data remains identical.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-black border border-neutral-800 rounded-lg p-1 shrink-0 w-full md:w-auto">
            {isTerminologyLoading ? (
               <div className="px-6 py-2 text-[10px] text-neutral-500 font-bold uppercase tracking-widest animate-pulse w-full text-center">Loading...</div>
            ) : (
              <>
                <button 
                  onClick={() => handleTerminologyChange('LONG_SHORT')}
                  className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-colors ${terminology === 'LONG_SHORT' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}
                >
                  Long / Short
                </button>
                <button 
                  onClick={() => handleTerminologyChange('BUY_SELL')}
                  className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-colors ${terminology === 'BUY_SELL' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-white'}`}
                >
                  Buy / Sell
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SECURITY HEADER */}
      <div className="pt-4">
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Security</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">Manage your account security and password settings.</p>
      </div>

      {/* SECURE RESET LINK MODULE */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-5 md:mb-6 flex items-center">
          <Mail className="mr-2 text-neutral-500" size={16} /> Password Reset Link
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-6 p-4 md:p-5 border border-neutral-800 rounded-xl md:rounded-2xl bg-[#050505] shadow-inner">
          <div className="flex-1">
            <p className="text-[11px] md:text-xs font-bold text-white tracking-widest truncate">{userEmail}</p>
            <p className="text-[9px] md:text-[10px] font-medium text-neutral-500 mt-1.5 md:mt-1 max-w-sm leading-relaxed">
              We will send a secure, time-sensitive link to this email address to safely reset your password.
            </p>
          </div>
          
          <button 
            onClick={handleSendResetLink}
            disabled={isSendingReset}
            className="w-full md:w-auto px-6 py-3 bg-[#111] md:bg-neutral-900 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-800 border border-neutral-800 md:border-neutral-700 transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center min-w-[160px]"
          >
            {isSendingReset ? (
               <><Loader2 size={14} className="animate-spin mr-2" /> Sending...</>
            ) : (
               'Send Reset Link'
            )}
          </button>
        </div>
      </div>

      {/* MANUAL PASSWORD UPDATE MODULE */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-5 md:mb-6 flex items-center">
          <Key className="mr-2 text-neutral-500" size={16} /> Change Password
        </h3>
        
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-blue-500/50 transition-colors shadow-inner" 
            />
          </div>
          <div className="pt-2">
            <button 
              onClick={handleDirectPasswordUpdate}
              disabled={isUpdating || !newPassword}
              className="w-full md:w-auto px-6 py-3.5 md:py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[160px] shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              {isUpdating ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE SESSIONS INFO */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl md:rounded-3xl p-5 md:p-8 flex items-center justify-between">
        <div>
          <h3 className="text-xs md:text-sm font-black text-emerald-500 uppercase tracking-widest flex items-center">
            <ShieldCheck className="mr-2 w-4 h-4 md:w-5 md:h-5" /> Secure Sessions
          </h3>
          <p className="text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-2 md:mt-3 max-w-sm leading-relaxed px-1">
            Your connection is secure. Updating your password will immediately log you out of all other active devices.
          </p>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {message && (
        <div className={`fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[200] px-5 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[2rem] border shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 flex items-center gap-3 md:gap-4 w-[90%] md:w-auto max-w-sm ${
          message.type === 'success' ? 'bg-[#0a0a0c] border-emerald-500/50 text-emerald-500' : 'bg-[#0a0a0c] border-red-500/50 text-red-500'
        }`}>
          <div className={`p-1.5 md:p-2 rounded-lg shrink-0 ${message.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {message.type === 'success' ? <BadgeCheck size={16}/> : <Shield size={16}/>}
          </div>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-widest leading-snug">{message.text}</p>
        </div>
      )}
    </div>
  )
}
