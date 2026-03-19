'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('free')

  useEffect(() => {
    async function loadTheme() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
        if (data?.plan) setTheme(data.plan.toLowerCase())
      }
    }
    loadTheme()
  }, [])

  return (
    <div 
      data-theme={theme !== 'free' ? theme : undefined} 
      className="flex h-screen bg-neutral-50 dark:bg-app-bg text-neutral-900 dark:text-neutral-800 dark:text-neutral-200 overflow-hidden font-sans selection:bg-brand-primary/30 transition-colors duration-1000"
    >
      {children}
    </div>
  )
}
