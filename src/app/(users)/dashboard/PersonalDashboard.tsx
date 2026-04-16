// src/app/(users)/dashboard/PersonalDashboard.tsx
'use client'

import { useState, useEffect } from 'react'

export default function PersonalDashboard() {
  // Dummy Data
  const weeklyPrepInstruments = ['GBPJPY', 'GBPCAD', 'CADJPY', 'XAUUSD', 'EURUSD']
  const todayInstruments = ['GBPCAD', 'XAUUSD'] // Simulating selections from weekly prep

  // Basic local time simulation
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 font-sans flex">
      
      {/* MAIN LEFT & CENTER AREA */}
      <div className="flex-1 flex flex-col p-6 gap-6">
        
        {/* TOP HALF: Info Cards & Routine */}
        <div className="flex gap-6 h-64">
          
          {/* Time & Session Cards (Left & Center-Left) */}
          <div className="flex flex-col gap-4 w-1/3 min-w-[250px]">
            {/* Local Time Card */}
            <div className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-lg flex flex-col items-center justify-center p-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Local Time</span>
              <span className="text-xl font-medium text-neutral-200">
                {time.toLocaleTimeString([], { hour12: false })}
              </span>
            </div>
            
            {/* Active Session Card */}
            <div className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-lg flex flex-col items-center justify-center p-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Active Session</span>
              <span className="text-lg font-medium text-neutral-200">New York</span>
              <span className="text-sm text-neutral-400 mt-1">08:30:00</span>
            </div>
          </div>

          {/* Routine Card (Center-Right) */}
          <div className="flex-[2] bg-[#0a0a0a] border border-neutral-800 rounded-lg p-6 flex flex-col">
            <h3 className="text-sm text-neutral-500 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
              Operator Routine
            </h3>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-blue-600" />
                <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">Sunday Prep</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-blue-600" defaultChecked />
                <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">Daily Prep</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-blue-600" />
                <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">Weekend Wind-up</span>
              </label>
            </div>
          </div>
          
        </div>

        {/* BOTTOM HALF: Today's Selected Instruments */}
        <div className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-lg p-6 flex flex-col min-h-[300px]">
          <h2 className="text-sm text-neutral-500 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
            Today
          </h2>
          
          <div className="flex flex-col gap-3">
            {todayInstruments.map((instrument) => (
              <div 
                key={`today-${instrument}`}
                className="p-4 border border-neutral-800 rounded bg-[#0d0d0d] flex items-center justify-between"
              >
                <span className="font-semibold text-neutral-200 tracking-wide">{instrument}</span>
                <span className="text-xs text-neutral-500">Active Setup</span>
              </div>
            ))}
            
            {todayInstruments.length === 0 && (
              <div className="text-neutral-500 text-sm italic py-4">
                No instruments selected for today.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR: Weekly Prep */}
      <div className="w-72 border-l border-neutral-800 bg-[#080808] p-6 flex flex-col">
        <h2 className="text-sm text-neutral-500 uppercase tracking-wider mb-6 text-center border-b border-neutral-800 pb-2">
          Weekly Prep
        </h2>
        
        <div className="flex flex-col gap-3">
          {weeklyPrepInstruments.map((instrument) => (
            <button 
              key={`weekly-${instrument}`}
              className="w-full py-3 px-4 border border-neutral-800 bg-[#0a0a0a] rounded text-sm font-medium text-neutral-300 hover:bg-[#111] hover:border-neutral-600 hover:text-white transition-all text-left flex justify-between items-center"
            >
              <span className="tracking-wide">{instrument}</span>
              <span className="text-xs text-neutral-600">→</span>
            </button>
          ))}
        </div>
      </div>
      
    </div>
  )
}
