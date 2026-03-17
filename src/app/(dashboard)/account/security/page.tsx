'use client'

import { Key, ShieldCheck } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Security</h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Protect your account and authentication parameters.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
          <Key className="mr-2 text-neutral-500" size={16} /> Authentication
        </h3>
        
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-brand-primary/50" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">New Password</label>
            <input type="password" placeholder="New Password" className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-brand-primary/50" />
          </div>
          <div className="pt-2">
            <button className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest flex items-center">
            <ShieldCheck className="mr-2" size={16} /> Secure Sessions
          </h3>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-2 max-w-sm">
            Your connection is encrypted. Active sessions are automatically terminated upon global disconnect.
          </p>
        </div>
      </div>
    </div>
  )
}