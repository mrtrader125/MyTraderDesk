'use client'

import { Bell, Monitor, SlidersHorizontal } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Platform Settings</h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Manage your dashboard preferences and notifications.</p>
      </div>

      {/* NOTIFICATIONS MODULE */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 md:p-8">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
          <Bell className="mr-2 text-neutral-500" size={16} /> Notification Preferences
        </h3>
        
        <div className="space-y-4">
          {/* Toggle Item 1 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#050505] border border-neutral-800 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-white tracking-widest uppercase">System Broadcasts</p>
              <p className="text-[10px] font-medium text-neutral-500 mt-1 max-w-sm">Receive pop-up alerts for live platform updates and critical announcements.</p>
            </div>
            {/* Toggle Switch (Visual Only for now) */}
            <div className="w-10 h-6 bg-brand-primary rounded-full relative cursor-not-allowed opacity-50 shrink-0" title="Always enabled for critical updates">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Toggle Item 2 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#050505] border border-neutral-800 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-white tracking-widest uppercase">Email Setup Alerts</p>
              <p className="text-[10px] font-medium text-neutral-500 mt-1 max-w-sm">Get an email notification when a new market setup is published to the dashboard.</p>
            </div>
            {/* Toggle Switch */}
            <div className="w-10 h-6 bg-neutral-800 rounded-full relative cursor-pointer border border-neutral-700 hover:border-neutral-500 transition-colors shrink-0">
              <div className="absolute left-1 top-1 w-4 h-4 bg-neutral-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* DISPLAY PREFERENCES */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 md:p-8">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
          <Monitor className="mr-2 text-neutral-500" size={16} /> Display & UI
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#050505] border border-neutral-800 rounded-2xl">
          <div>
            <p className="text-xs font-bold text-white tracking-widest uppercase">Platform Theme</p>
            <p className="text-[10px] font-medium text-neutral-500 mt-1 max-w-sm">Your visual theme is automatically determined by your active subscription plan.</p>
          </div>
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center shrink-0">
            <SlidersHorizontal size={12} className="mr-2" /> Auto-Synced
          </div>
        </div>
      </div>
      
    </div>
  )
}
