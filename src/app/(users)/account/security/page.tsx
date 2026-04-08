import { createClient } from '@/lib/supabaseServer'
import SecurityClient from './SecurityClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function SecurityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Strict security check
  if (!user || !user.email) {
    redirect('/login')
  }

  return <SecurityClient userEmail={user.email} />
}
