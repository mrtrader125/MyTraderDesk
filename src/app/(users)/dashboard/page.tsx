import { Metadata } from 'next'
import DashboardClient from './DashboardClient'
import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Dashboard | MyTraderDesk',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // 0ms Auth Check: Reads local cookie, does not ping the server
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  // ZERO database queries. The page transitions instantly.
  return <DashboardClient />
}
