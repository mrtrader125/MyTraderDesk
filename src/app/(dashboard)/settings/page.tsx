'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, CreditCard, Settings, Shield, Crown, Activity, LogOut, AlertTriangle, Zap, Mail, Key } from 'lucide-react'

const TABS = [
  { id: 'PROFILE', label: 'Profile', icon: User },
  { id: 'BILLING', label: 'Billing & Plan', icon: CreditCard },
  { id: 'PREFERENCES', label: 'Preferences', icon: Settings },
]

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('PROFILE')
  const [loading, setLoading] = useState(true)
  
  // User Data
  const [userEmail, setUserEmail] = useState('')
  const [userPlan, setUserPlan] = useState('free')
  const [userName, setUserName] = useState('Operator')

  useEffect(() => {
    async function loadAccount() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserEmail(user.email || '')
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan, full_name')
            .eq('id', user.id)
            .single()
            
          if (profile) {
            if (profile.plan) setUserPlan(profile.plan.toLowerCase())
            if (profile.full_name) setUserName(profile.full_name)
          }
        }
      } catch (err) {
        console.error("Account Load Error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadAccount()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-brand-primary" size={32} />
        <span className="text-[10px] font-black tracking-widest uppercase text-neutral-500">Accessing Command Center...</span>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] p-6 md:p-8 font-sans overflow-x-hidden">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-800">
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">Command <span className="text-neutral-500">Center</span></h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Manage Clearance, Billing, and Security</p>
        </div>
        
        <button 
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-4 py-2 bg-neutral-900 hover:bg-red-500/10 hover:text-red-500 text-neutral-400 border border-neutral-800 hover:border-red-500/20 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={14} />
          <span className="hidden sm:block">Disconnect</span>
        </button>
      </div>

      {/* COMPACT TABS */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center space-x-1 bg-[#0a0a0a] p-1.5 rounded-2xl border border-neutral-800 w-full max-w-md justify-between">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex justify-center items-center px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${active ? 'bg-white text-black shadow-sm scale-100' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={12} className="mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-4xl mx-auto">
        
        {/* ================= PROFILE TAB ================= */}
        {activeTab === 'PROFILE' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8">
              <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
                <User className="mr-2 text-neutral-500" size={16} /> Identity Parameters
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Operator Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                      <input 
                        type="text" 
                        defaultValue={userName}
                        className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-neutral-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Encrypted Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                      <input 
                        type="email" 
                        value={userEmail}
                        disabled
                        className="w-full bg-[#050505] border border-neutral-800/50 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-neutral-500 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors">
                    Update Identity
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8">
              <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
                <Key className="mr-2 text-neutral-500" size={16} /> Security
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white tracking-widest">Authentication Password</h3>
                  <p className="text-[10px] font-medium text-neutral-500 mt-1">Request a secure link to modify your login credentials.</p>
                </div>
                <button className="px-5 py-2.5 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-neutral-800 border border-neutral-800 transition-colors">
                  Reset Password
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= BILLING TAB ================= */}
        {activeTab === 'BILLING' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* Active Plan Card */}
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-neutral-800 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6">
                <div>
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2 block">Current Clearance Level</span>
                  <div className="flex items-center space-x-3">
                    {userPlan === 'pro' ? <Crown className="text-brand-primary" size={28} /> : userPlan === 'essential' ? <Shield className="text-blue-500" size={28} /> : <Zap className="text-neutral-500" size={28} />}
                    <h2 className={`text-3xl font-black uppercase tracking-tighter ${userPlan === 'pro' ? 'text-brand-primary' : userPlan === 'essential' ? 'text-blue-500' : 'text-white'}`}>
                      {userPlan} Tier
                    </h2>
                  </div>
                  <p className="text-xs font-medium text-neutral-400 mt-2 max-w-md">
                    {userPlan === 'pro' ? 'Maximum clearance granted. Full access to Crypto, Indices, Stocks, and priority setups.' : 'Limited clearance. Upgrade to unlock restricted global markets and bypass time-delays.'}
                  </p>
                </div>

                {userPlan !== 'pro' && (
                  <button className="px-8 py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary/90 transition-colors shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.2)] whitespace-nowrap">
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 mt-12">
              <h2 className="text-sm font-black text-red-500 uppercase tracking-widest mb-2 flex items-center">
                <AlertTriangle className="mr-2" size={16} /> Danger Zone
              </h2>
              <p className="text-[11px] font-medium text-neutral-500 mb-6">
                Canceling your subscription will immediately revoke your access to premium intelligence. This action cannot be undone.
              </p>
              <button className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                Cancel Subscription
              </button>
            </div>

          </div>
        )}

        {/* ================= PREFERENCES TAB ================= */}
        {activeTab === 'PREFERENCES' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8">
              <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
                <Zap className="mr-2 text-neutral-500" size={16} /> Interface Settings
              </h2>
              
              <div className="space-y-6 divide-y divide-neutral-800/50">
                <div className="flex items-center justify-between pb-6">
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-widest">Terminal Theme</h3>
                    <p className="text-[10px] font-medium text-neutral-500 mt-1">The interface is currently locked to Dark Mode for optimal market monitoring.</p>
                  </div>
                  <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-neutral-400 cursor-not-allowed">
                    Dark Only
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-widest">Email Broadcasts</h3>
                    <p className="text-[10px] font-medium text-neutral-500 mt-1">Receive immediate email alerts when new intelligence is deployed.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
