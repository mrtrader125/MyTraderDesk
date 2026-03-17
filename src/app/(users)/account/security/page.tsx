'use client'

import { useState, useEffect } from 'react'
import { Key, ShieldCheck, Mail, Activity, BadgeCheck, Shield, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SecurityPage() {
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Toast Notification State
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  // Reset Link States
  const [isSendingReset, setIsSendingReset] = useState(false)

  // Manual Password States
  const [newPassword, setNewPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function loadSecurityData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setUserEmail(user.email)
        }
      } catch (err) {
        console.error("Failed to load user email", err)
      } finally {
        setLoading(false)
      }
    }
    loadSecurityData()
  }, [])

  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  // 1. Send Magic Reset Link via Email
  const handleSendResetLink = async () => {
    if (!userEmail) return
    setIsSendingReset(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      })

      if (error) {
        showToast(error.message, 'error')
      } else {
        showToast('Security link dispatched to your inbox', 'success')
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

  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-brand-primary" size={24} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-8 pb-12 relative">
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Security</h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Protect your account and authentication parameters.</p>
      </div>

      {/* SECURE RESET LINK MODULE */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
          <Mail className="mr-2 text-neutral-500" size={16} /> Password Reset Link
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 border border-neutral-800 rounded-2xl bg-[#050505]">
          <div>
            <p className="text-xs font-bold text-white tracking-widest">{userEmail}</p>
            <p className="text-[10px] font-medium text-neutral-500 mt-1 max-w-sm">
              We will send a secure, time-sensitive link to this email address to reset your authentication credentials safely.
            </p>
          </div>
          
          <button 
            onClick={handleSendResetLink}
            disabled={isSendingReset}
            className="px-6 py-3 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-800 border border-neutral-700 transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center min-w-[160px]"
          >
            {isSendingReset ? (
               <><Loader2 size={14} className="animate-spin mr-2" /> Sending...</>
            ) : (
               'Issue Reset Link'
            )}
          </button>
        </div>
      </div>

      {/* MANUAL PASSWORD UPDATE MODULE */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
          <Key className="mr-2 text-neutral-500" size={16} /> Manual Update
        </h3>
        
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-brand-primary/50 transition-colors" 
            />
          </div>
          <div className="pt-2">
            <button 
              onClick={handleDirectPasswordUpdate}
              disabled={isUpdating || !newPassword}
              className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[160px]"
            >
              {isUpdating ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE SESSIONS INFO */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest flex items-center">
            <ShieldCheck className="mr-2" size={16} /> Secure Sessions
          </h3>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-2 max-w-sm leading-relaxed">
            Your connection is encrypted. Updating your password will immediately terminate all active sessions on other devices.
          </p>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {message && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-[2rem] border shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 flex items-center gap-4 ${
          message.type === 'success' ? 'bg-[#0a0a0c] border-emerald-500/50 text-emerald-500' : 'bg-[#0a0a0c] border-red-500/50 text-red-500'
        }`}>
          <div className={`p-2 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {message.type === 'success' ? <BadgeCheck size={18}/> : <Shield size={18}/>}
          </div>
          <p className="text-xs font-black uppercase tracking-widest">{message.text}</p>
        </div>
      )}
    </div>
  )
}
