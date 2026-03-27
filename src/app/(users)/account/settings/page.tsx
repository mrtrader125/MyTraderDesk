'use client'

import { Bell, Monitor, SlidersHorizontal } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-6 md:space-y-8">
      <div>
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Platform Settings</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">Manage your dashboard preferences and notifications.</p>
      </div>

      {/* NOTIFICATIONS MODULE */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-5 md:mb-6 flex items-center">
          <Bell className="mr-2 text-neutral-500" size={16} /> Notification Preferences
        </h3>
        
        <div className="space-y-3 md:space-y-4">
          {/* Toggle Item 1 */}
          <div className="flex items-center justify-between gap-4 p-4 md:p-5 bg-[#050505] border border-neutral-800 rounded-xl md:rounded-2xl shadow-inner">
            <div className="flex-1 pr-2">
              <p className="text-[11px] md:text-xs font-bold text-white tracking-widest uppercase">System Broadcasts</p>
              <p className="text-[9px] md:text-[10px] font-medium text-neutral-500 mt-1 md:mt-1.5 leading-relaxed max-w-sm">Receive pop-up alerts for live platform updates and critical announcements.</p>
            </div>
            {/* Toggle Switch (Visual Only for now) */}
            <div className="w-9 h-5 md:w-10 md:h-6 bg-brand-primary rounded-full relative cursor-not-allowed opacity-50 shrink-0" title="Always enabled for critical updates">
              <div className="absolute right-1 top-1 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Toggle Item 2 */}
          <div className="flex items-center justify-between gap-4 p-4 md:p-5 bg-[#050505] border border-neutral-800 rounded-xl md:rounded-2xl shadow-inner">
            <div className="flex-1 pr-2">
              <p className="text-[11px] md:text-xs font-bold text-white tracking-widest uppercase">Email Setup Alerts</p>
              <p className="text-[9px] md:text-[10px] font-medium text-neutral-500 mt-1 md:mt-1.5 leading-relaxed max-w-sm">Get an email notification when a new market setup is published to the dashboard.</p>
            </div>
            {/* Toggle Switch */}
            <div className="w-9 h-5 md:w-10 md:h-6 bg-neutral-800 rounded-full relative cursor-pointer border border-neutral-700 hover:border-neutral-500 transition-colors shrink-0">
              <div className="absolute left-1 top-1 w-3 h-3 md:w-4 md:h-4 bg-neutral-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* DISPLAY PREFERENCES */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-5 md:mb-6 flex items-center">
          <Monitor className="mr-2 text-neutral-500" size={16} /> Display & UI
        </h3>
        
        <div className="flex items-center justify-between gap-4 p-4 md:p-5 bg-[#050505] border border-neutral-800 rounded-xl md:rounded-2xl shadow-inner">
          <div className="flex-1 pr-2">
            <p className="text-[11px] md:text-xs font-bold text-white tracking-widest uppercase">Platform Theme</p>
            <p className="text-[9px] md:text-[10px] font-medium text-neutral-500 mt-1 md:mt-1.5 leading-relaxed max-w-sm">Your visual theme is automatically determined by your active subscription plan.</p>
          </div>
          <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 border border-white/10 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center shrink-0">
            <SlidersHorizontal size={12} className="mr-1.5 md:mr-2" /> Auto-Synced
          </div>
        </div>
      </div>
      
    </div>
  )
}
