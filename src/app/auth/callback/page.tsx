'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 🚨 NEW: State to break the infinite loading loop
  const [failed, setFailed] = useState<string | null>(null)

  useEffect(() => {
    const next = searchParams.get('next') || '/dashboard'
    const code = searchParams.get('code')
    
    // 1. Catch Supabase URL errors immediately
    const urlError = searchParams.get('error_description') || searchParams.get('error')
    if (urlError) {
      setFailed(urlError.replace(/\+/g, ' '))
      return
    }

    // 2. If a PKCE code exists, pass it directly to the update page!
    if (code) {
      router.push(`${next}?code=${code}`)
      return
    }

    // 3. Listen for implicit session establishment
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        router.push(next)
      }
    })

    // 4. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(next)
      } else {
        // 🚨 THE FIX: Timeout after 3 seconds instead of spinning forever
        setTimeout(() => {
          setFailed("The reset link is invalid, expired, or was already used. Please request a new one.")
        }, 3000)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, searchParams])

  // 🚨 NEW: Clean error UI if the link is dead
  if (failed) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#030305] p-6 font-sans">
        <div className="bg-[#0a0a0f] border border-red-500/20 p-8 rounded-[2rem] max-w-md w-full flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="text-red-500" size={28} />
          </div>
          <h2 className="text-xl font-black text-white tracking-tighter uppercase mb-2">
            Verification <span className="text-red-500">Failed</span>
          </h2>
          <p className="text-xs font-medium text-neutral-400 leading-relaxed mb-8">
            {failed}
          </p>
          <Link 
            href="/login"
            className="w-full bg-white hover:bg-neutral-200 py-4 rounded-xl text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center transition-all active:scale-[0.98]"
          >
            Back to Login <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#030305]">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">Decrypting Session Key...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#030305]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
