'use client'

import { useEffect, useState } from 'react'
// 🚨 ADDED useSearchParams
import { usePathname, useRouter, useSearchParams } from 'next/navigation' 
import { createBrowserClient } from '@supabase/ssr'

export default function SystemGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams() // 🚨 ADDED
  const [isVerifying, setIsVerifying] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const enforceProtocol = async () => {
      if (pathname === '/login' || pathname === '/signup' || pathname === '/' || pathname === '/admin') {
        setIsVerifying(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('protocol_established')
        .eq('id', session.user.id)
        .single()

      const hasClearance = profile?.protocol_established === true;
      const isPreviewMode = searchParams.get('preview') === 'true'; // 🚨 NEW CHECK

      // THE GLOBAL ROUTE LOCK
      if (!hasClearance && pathname !== '/onboarding') {
        // Escaped onboarding? Drag them back.
        router.push('/onboarding')
      } else if (hasClearance && pathname === '/onboarding' && !isPreviewMode) {
        // 🚨 UPDATED: Only kick them to dashboard if they are NOT in preview mode
        router.push('/dashboard')
      } else {
        // Clearance matches location, or they are in admin preview mode. Let them pass.
        setIsVerifying(false)
      }
    }

    enforceProtocol()
  }, [pathname, router, searchParams, supabase]) 

  if (isVerifying) {
    return <div className="min-h-screen bg-[#050505]" />
  }

  return <>{children}</>
}
