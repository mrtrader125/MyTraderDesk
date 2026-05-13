'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Globe2, ShieldCheck, ArrowRight } from 'lucide-react'

export default function BootSequence() {
  const [needsBoot, setNeedsBoot] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data } = await supabase.from('profiles').select('desk_timezone').eq('id', user.id).single()
        if (!data?.desk_timezone) setNeedsBoot(true)
      }
    }
    checkProfile()
  }, [])

  const finalizeBoot = async () => {
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    await supabase.from('profiles').update({ desk_timezone: localTz }).eq('id', userId)
    setNeedsBoot(false)
    window.location.reload()
  }

  if (!needsBoot) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#000000] border border-zinc-800 rounded-2xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={32} className="text-blue-500" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Initialize Terminal</h2>
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          To enforce the Daily Sniper limits and weekend vault locks, the terminal must sync with your local geographic time.
        </p>
        
        <div className="w-full bg-black border border-zinc-800 rounded-xl p-4 flex items-center gap-3 mb-8">
          <Globe2 size={18} className="text-zinc-500" />
          <span className="text-xs font-mono text-zinc-300">
            Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
        </div>

        <button onClick={finalizeBoot} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
          Sync & Enter <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}