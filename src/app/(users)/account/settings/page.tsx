import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export const runtime = 'edge'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, telegram_user_id, telegram_handle')
    .eq('id', user.id)
    .single()

  return (
    <SettingsClient 
      userId={user.id}
      initialFullName={profile?.full_name}
      initialUsername={profile?.username}
      isTelegramLinked={!!profile?.telegram_user_id}
      telegramHandle={profile?.telegram_handle}
    />
  )
}
