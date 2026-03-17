'use client'

import { Monitor, Bell } from 'lucide-react'

export default function AppSettingsPage() {
  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Preferences</h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Customize your terminal interface and alerts.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
          <Monitor className="mr-2 text-neutral-500" size={16} /> Interface
        </h3>
        <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-2xl bg-[#050505]">
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest">Terminal Theme</p>
            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-1">Locked for optimal chart contrast</p>
          </div>
          <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-neutral-400 cursor-not-allowed">
            Dark Mode Only
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
          <Bell className="mr-2 text-neutral-500" size={16} /> Broadcast Alerts
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-2xl bg-[#050505]">
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-widest">New Intelligence Deployments</p>
              <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-1">Email alerts when your active plan updates.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-2xl bg-[#050505]">
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-widest">Weekly Performance Report</p>
              <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-1">Automated breakdown of market moves.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}