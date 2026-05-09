import { Metadata } from 'next'
import DeskClient from './DeskClient'
import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Operator Desk | MyTraderDesk',
}

export default async function DeskPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <DeskClient />
}
