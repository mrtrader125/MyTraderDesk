// src/app/(users)/dashboard/DashboardClient.tsx
"use client"

import { useState } from 'react'
import { Globe, User } from 'lucide-react'
import GeneralDashboard from './GeneralDashboard'
import PersonalDashboard from './PersonalDashboard'

export default function DashboardClient(props: any) {
  // Track which view is active
  const [activeView, setActiveView] = useState<'general' | 'personal'>('general')

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      
      {/* ========================================= */}
      {/* DASHBOARD HEADER & TOGGLE                 */}
      {/* ========================================= */}
      <div className="px-4 md:px-8 pt-6 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-900 bg-[#0a0a0a]/50 backdrop-blur-md z-20">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white transition-all duration-300">
            {activeView === 'general' ? 'Market Overview' : 'Operator Hub'}
          </h1>
          <p className="text-neutral-500 mt-1 md:mt-2 text-xs md:text-sm transition-all duration-300">
            {activeView === 'general' 
              ? 'General platform analytics and live market setups.' 
              : 'Your isolated metrics and AI assistant workspace.'}
          </p>
        </div>

        {/* THE TOGGLE SWITCH */}
        <div className="flex items-center bg-[#050505] border border-neutral-800 p-1 rounded-xl w-max shadow-inner shrink-0">
          <button
            onClick={() => setActiveView('general')}
            className={`relative flex items-center gap-2 px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-300 z-10 ${
              activeView === 'general' ? 'text-white' : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            General
            {activeView === 'general' && (
              <div className="absolute inset-0 bg-neutral-800 rounded-lg -z-10 shadow-sm transition-all duration-300"></div>
            )}
          </button>

          <button
            onClick={() => setActiveView('personal')}
            className={`relative flex items-center gap-2 px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-300 z-10 ${
              activeView === 'personal' ? 'text-blue-400' : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Personal
            {activeView === 'personal' && (
              <div className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-lg -z-10 shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-all duration-300"></div>
            )}
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* TRANSITION CONTAINER                      */}
      {/* ========================================= */}
      <div className="relative flex-1 bg-[#050505]">
        
        {/* GENERAL VIEW */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            activeView === 'general' 
              ? 'opacity-100 translate-y-0 z-10 pointer-events-auto' 
              : 'opacity-0 translate-y-4 -z-10 pointer-events-none'
          }`}
        >
          <GeneralDashboard {...props} />
        </div>

        {/* PERSONAL VIEW */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            activeView === 'personal' 
              ? 'opacity-100 translate-y-0 z-10 pointer-events-auto' 
              : 'opacity-0 translate-y-4 -z-10 pointer-events-none'
          }`}
        >
          <PersonalDashboard />
        </div>

      </div>
    </div>
  )
}
