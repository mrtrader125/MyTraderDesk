"use client"

import { useState, useEffect } from 'react'
import GeneralDashboard from './GeneralDashboard'
import PersonalDashboard from './PersonalDashboard'

export default function DashboardClient(props: any) {
  const [activeView, setActiveView] = useState<'general' | 'personal'>('general')

  // Listen for the custom event fired by TopNav
  useEffect(() => {
    const handleViewChange = (e: any) => {
      if (e.detail === 'general' || e.detail === 'personal') {
        setActiveView(e.detail)
      }
    }
    window.addEventListener('switchDashboardView', handleViewChange)
    return () => window.removeEventListener('switchDashboardView', handleViewChange)
  }, [])

  return (
    // THE FIX: Lock height to viewport minus TopNav (56px mobile, 64px desktop) + kill outer scroll
    <div className="flex flex-col h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] bg-[#050505] overflow-hidden w-full">
      
      {/* ========================================= */}
      {/* TRANSITION CONTAINER                      */}
      {/* ========================================= */}
      <div className="relative flex-1 bg-[#050505] overflow-hidden w-full h-full">
        
        {/* GENERAL VIEW */}
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
            activeView === 'general' 
              ? 'opacity-100 translate-y-0 z-10 pointer-events-auto' 
              : 'opacity-0 translate-y-4 -z-10 pointer-events-none'
          }`}
        >
          <GeneralDashboard {...props} />
        </div>

        {/* PERSONAL VIEW */}
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
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
