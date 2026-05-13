'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation' 
import { createBrowserClient } from '@supabase/ssr'

export default function SystemGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams() 
  const [isVerifying, setIsVerifying] = useState(true)
  
  // FIX: Track verification so we don't query the DB on every sidebar click
  const hasVerified = useRef(false) 

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const enforceProtocol = async () => {
      // If already verified this session, skip the DB check
      if (hasVerified.current) {
        setIsVerifying(false)
        return
      }

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
      const isPreviewMode = searchParams.get('preview') === 'true';

      if (!hasClearance && pathname !== '/onboarding') {
        router.push('/onboarding')
      } else if (hasClearance && pathname === '/onboarding' && !isPreviewMode) {
        router.push('/dashboard')
      } else {
        hasVerified.current = true; // Mark as safe for future clicks
        setIsVerifying(false)
      }
    }

    enforceProtocol()
  }, [pathname, router, searchParams, supabase]) 

  if (isVerifying) {
    return <div className="min-h-screen bg-[#0a0a0a]" />
  }

  return <>{children}</>
}
