// src/app/(users)/dashboard/PersonalDashboard.tsx
'use client'

import { User } from 'lucide-react'

export default function PersonalDashboard() {
  return (
    <div className="w-full bg-[#050505] p-3 md:p-6 font-sans flex flex-col min-h-[calc(100vh-160px)]">
      <div className="flex-1 bg-[#050505] border border-blue-900/30 rounded-2xl flex flex-col items-center justify-center text-center shadow-[inset_0_0_50px_rgba(37,99,235,0.02)] p-8">
        <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-blue-500/50" />
        </div>
        <h2 className="text-2xl font-light text-blue-400 mb-3 tracking-wide">Operator Sandbox</h2>
        <p className="text-neutral-500 max-w-lg mx-auto text-sm leading-relaxed">
          This environment is completely isolated. When deployed, your custom AI assistant will live here and exclusively read your personal setups from the My Desk database to provide tailored market feedback.
        </p>
      </div>
    </div>
  )
}
