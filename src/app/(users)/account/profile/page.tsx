'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Mail, Globe, Save, Activity, Camera } from 'lucide-react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form State
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setEmail(user.email || '')
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()
            
          if (profile?.full_name) {
            setFullName(profile.full_name)
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('id', user.id)

        // NEW FIX: Also update their Auth Metadata so the TopNav Avatar updates instantly
        await supabase.auth.updateUser({
          data: { full_name: fullName }
        })

        if (error) throw error
        // Optionally add a toast notification here later
      }
    } catch (err) {
      console.error('Error updating profile:', err)
    } finally {
      setSaving(false)
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
    <div className="max-w-3xl space-y-8 pb-12">
      
      {/* PAGE HEADER */}
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Profile</h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Manage your operator identity and personal details.</p>
      </div>

      {/* CARD 1: IDENTITY */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
            <User className="mr-2 text-neutral-500" size={16} /> Personal Information
          </h3>
          
          {/* Avatar Placeholder */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center relative group cursor-pointer overflow-hidden">
              <User size={20} className="text-neutral-500 group-hover:opacity-0 transition-opacity" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={14} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Operator Name"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full bg-[#050505] border border-neutral-800/50 rounded-xl py-3 pl-4 pr-10 text-xs font-bold text-neutral-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: REGIONAL SETTINGS */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 md:p-8">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
          <Globe className="mr-2 text-neutral-500" size={16} /> Regional Settings
        </h3>

        <div className="space-y-2 max-w-md">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Local Timezone</label>
          <div className="relative">
            <select 
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-brand-primary/50 transition-colors appearance-none cursor-pointer"
            >
              <option value={timezone}>{timezone} (Auto-Detected)</option>
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="America/New_York">Eastern Time (New York)</option>
              <option value="Europe/London">GMT (London)</option>
              <option value="Asia/Tokyo">JST (Tokyo)</option>
            </select>
          </div>
          <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-2">
            This affects how setup timestamps are displayed in your terminal.
          </p>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-8 py-3.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Activity className="animate-spin mr-2" size={14} />
          ) : (
            <Save className="mr-2" size={14} />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </div>
  )
}
