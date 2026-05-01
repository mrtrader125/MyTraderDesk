import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export const runtime = 'edge'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch their profile and their strict trading module rules
  const [
    { data: profile },
    { data: module }
  ] = await Promise.all([
    supabase.from('profiles').select('timezone').eq('id', user.id).single(),
    supabase.from('user_trading_modules')
      .select('shift_start, shift_end, weekly_prep_time, daily_prep_time, max_daily_trades')
      .eq('user_id', user.id)
      .maybeSingle()
  ])

  return (
    <SettingsClient 
      userId={user.id}
      initialTimezone={profile?.timezone}
      initialModule={module}
    />
  )
}