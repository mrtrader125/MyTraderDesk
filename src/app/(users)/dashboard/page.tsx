import { createClient } from '@/lib/supabaseServer'
import DashboardClient from './DashboardClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  // ZERO blocking database calls. Next.js renders this instantly.
  return <DashboardClient userId={session.user.id} />
}
