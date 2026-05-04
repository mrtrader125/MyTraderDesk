'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function SystemGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const enforceProtocol = async () => {
      // 1. Ignore public/auth routes
      if (pathname === '/login' || pathname === '/signup' || pathname === '/' || pathname === '/admin') {
        setIsVerifying(false)
        return
      }

      // 2. Get the active session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // 3. Interrogate the Ledger for Clearance
      const { data: profile } = await supabase
        .from('profiles')
        .select('protocol_established')
        .eq('id', session.user.id)
        .single()

      const hasClearance = profile?.protocol_established === true;

      // 4. THE GLOBAL ROUTE LOCK
      if (!hasClearance && pathname !== '/onboarding') {
        // Escaped onboarding? Drag them back.
        router.push('/onboarding')
      } else if (hasClearance && pathname === '/onboarding') {
        // Already finished onboarding but tried to go back? Push to dashboard.
        router.push('/dashboard')
      } else {
        // Clearance matches location. Let them pass.
        setIsVerifying(false)
      }
    }

    enforceProtocol()
  }, [pathname, router, supabase]) 

  // Show a blank dark screen while verifying to prevent flashing unauthorized UI
  if (isVerifying) {
    return <div className="min-h-screen bg-[#050505]" />
  }
  return <>{children}</>
}
