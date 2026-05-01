import { createClient } from '@/lib/supabaseServer'
import ProfileClient from './ProfileClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, telegram_handle, telegram_user_id')
    .eq('id', user.id)
    .single()

  return (
    <ProfileClient 
      userId={user.id}
      email={user.email} 
      initialFullName={profile?.full_name} 
      initialUsername={profile?.username}
      telegramHandle={profile?.telegram_handle}
      isTelegramLinked={!!profile?.telegram_user_id}
    />
  )
}