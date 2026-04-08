import { createClient } from '@/lib/supabaseServer'
import ProfileClient from './ProfileClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all identity data
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, telegram_handle, telegram_user_id')
    .eq('id', user.id)
    .single()

  return (
    <ProfileClient 
      email={user.email} 
      fullName={profile?.full_name} 
      username={profile?.username}
      telegram={profile?.telegram_handle}
      isTelegramLinked={!!profile?.telegram_user_id}
    />
  )
}
