import { createClient } from '@/lib/supabaseServer'
import SubscriptionClient from './SubscriptionClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 🚨 OPTIMIZED: Fetch the user's plan and their vault count in parallel
  const [
    { data: profile },
    { count: savedCount }
  ] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', user.id).single(),
    supabase.from('user_vault').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  ])

  return (
    <SubscriptionClient 
      initialPlan={profile?.plan?.toLowerCase() || 'free'} 
      initialSavedCount={savedCount || 0} 
    />
  )
}
