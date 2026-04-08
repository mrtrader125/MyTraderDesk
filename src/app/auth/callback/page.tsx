'use client'
import { useEffect } from 'react'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const next = searchParams.get('next') || '/dashboard'

    // Listen for Supabase's automatic background code exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        router.push(next)
      }
    })

    // Fallback: If the background exchange already finished before this component mounted
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(next)
      }
    })

    // Clean up listener on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [router, searchParams])

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-app-bg">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">Decrypting Session Key...</p>
      </div>
    </div>
  )
}
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Authenticating...</div>}>
      <AuthCallbackContent />
    </Suspense>
  )
}
