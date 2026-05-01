import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OnboardingClient from './OnboardingClient'

export const metadata = {
  title: 'Protocol Initialization | Sentinel Vortex',
  description: 'Set your operating parameters.',
}

export default async function OnboardingPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Optional: Check if they already have an active contract to prevent re-onboarding
  const { data: module } = await supabase
    .from('user_trading_modules')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (module && module.status === 'ACTIVE') {
     // If they already did this, send them straight to the desk
     redirect('/desk')
  }

  return <OnboardingClient userId={user.id} />
}