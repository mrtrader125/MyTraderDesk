'use client'

import { Bell, Monitor, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), [])

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-1">Platform Settings</h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Manage your dashboard preferences and notifications.</p>
      </div>

      {/* NOTIFICATIONS MODULE */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8">
        <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-6 flex items-center">
          <Bell className="mr-2 text-neutral-500" size={16} /> Notification Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-neutral-50 dark:bg-[#050505] border border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white tracking-widest uppercase">System Broadcasts</p>
              <p className="text-[10px] font-medium text-neutral-500 mt-1 max-w-sm">Receive pop-up alerts for live platform updates and critical announcements.</p>
            </div>
            <div className="w-10 h-6 bg-brand-primary rounded-full relative cursor-not-allowed opacity-50 shrink-0" title="Always enabled for critical updates">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* DISPLAY PREFERENCES (THE THEME TOGGLE) */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8">
        <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-6 flex items-center">
          <Monitor className="mr-2 text-neutral-500" size={16} /> Display & UI
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-neutral-50 dark:bg-[#050505] border border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-white tracking-widest uppercase">Platform Theme</p>
            <p className="text-[10px] font-medium text-neutral-500 mt-1 max-w-sm">Manually toggle between light mode and dark mode.</p>
          </div>
          
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl text-[10px] font-black text-neutral-600 dark:text-neutral-400 uppercase tracking-widest hover:text-neutral-900 dark:hover:text-white transition-all shrink-0"
            >
              {theme === 'dark' ? (
                <><Sun size={14} className="text-amber-500" /> <span>Light Mode</span></>
              ) : (
                <><Moon size={14} className="text-blue-500" /> <span>Dark Mode</span></>
              )}
            </button>
          )}
        </div>
      </div>
      
    </div>
  )
}
