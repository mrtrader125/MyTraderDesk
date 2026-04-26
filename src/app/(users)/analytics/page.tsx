import AnalyticsClient from './AnalyticsClient'
import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Macro Analytics | Sentinel Vortex',
  description: 'Long-term statistical proof of your behavioral discipline.',
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <AnalyticsClient />
}
