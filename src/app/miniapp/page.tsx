'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { Lock, Smartphone, Loader2, Target } from 'lucide-react'

// You can import a simplified version of your LiveFloorClient here later, 
// but for now, we will render a placeholder to ensure auth works!
// import MobileFloor from '@/components/MobileFloor' 

export default function MiniAppPage() {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'not_linked' | 'not_pro' | 'error'>('loading')
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const initMiniApp = async () => {
      // 1. Wait for Telegram script to inject
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()
        tg.setHeaderColor('#050505')
        tg.setBackgroundColor('#050505')

        // 2. Extract their secure Telegram ID
        const tgUser = tg.initDataUnsafe?.user
        
        if (!tgUser || !tgUser.id) {
          // If we can't find an ID, they aren't using the app through Telegram
          setStatus('error')
          return
        }

        // 3. Ping our new secure API to verify them
        try {
          const res = await fetch('/api/telegram/miniapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: tgUser.id })
          })
          
          const data = await res.json()

          if (data.authorized) {
            setUserData(data.user)
            setStatus('authorized')
          } else {
            setStatus(data.reason) // 'not_linked' or 'not_pro'
          }
        } catch (err) {
          setStatus('error')
        }
      } else {
        // Fallback if opened outside of Telegram
        setStatus('error')
      }
    }

    // Small delay to ensure Telegram JS is fully loaded
    const timer = setTimeout(initMiniApp, 100)
    return () => clearTimeout(timer)
  }, [])

  // --- RENDER STATES ---

  if (status === 'loading') {
    return (
      <div className="w-full h-screen bg-[#050505] flex flex-col items-center justify-center">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <Loader2 className="w-8 h-8 text-[#2AABEE] animate-spin mb-4" />
        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest animate-pulse">Decrypting Identity...</p>
      </div>
    )
  }

  if (status === 'not_linked') {
    return (
      <div className="w-full h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <Smartphone className="w-12 h-12 text-neutral-600 mb-4 stroke-1" />
        <h2 className="text-xl font-bold text-white mb-2">Account Not Linked</h2>
        <p className="text-sm text-neutral-400">Please log in to mytraderdesk.com on your browser and connect your Telegram account in Settings.</p>
      </div>
    )
  }

  if (status === 'not_pro') {
    return (
      <div className="w-full h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <Lock className="w-12 h-12 text-amber-500/80 mb-4 stroke-1" />
        <h2 className="text-xl font-bold text-white mb-2">Pro Access Required</h2>
        <p className="text-sm text-neutral-400">The mobile terminal is strictly reserved for Professional members. Upgrade your account on the web to unlock.</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="w-full h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-red-500 font-bold uppercase">Connection Error</p>
        <p className="text-xs text-neutral-500 mt-2">Please close this window and try again.</p>
      </div>
    )
  }

  // --- AUTHORIZED RENDER ---
  return (
    <div className="w-full min-h-screen bg-[#030303] text-white p-4">
      {/* This is where we will drop your actual mobile feed later! */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Target className="text-blue-500 w-5 h-5" />
          <span className="font-bold text-sm tracking-wider uppercase">Terminal</span>
        </div>
        <div className="text-[10px] font-bold px-2 py-1 bg-blue-500/10 text-blue-400 rounded">
          {userData?.username}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-[60vh] opacity-50">
         <h1 className="text-2xl font-black text-white">ACCESS GRANTED</h1>
         <p className="text-xs font-medium text-neutral-400 mt-2 uppercase tracking-widest">Mobile Floor Pending Integration</p>
      </div>
    </div>
  )
}