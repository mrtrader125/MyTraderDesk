import { createClient } from '@/lib/supabaseServer'
import VaultClient from './VaultClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function VaultPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parallel edge-fetching
  const [
    { data: profile },
    { data: vaultData }
  ] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', user.id).single(),
    supabase.from('user_vault')
      .select(`id, note, created_at, analysis_id, analyses (*)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  ])

  // Process the joined data directly on the server
  let formattedItems: any[] = []
  if (vaultData) {
    formattedItems = vaultData.map((item: any) => ({
      ...item.analyses, 
      vault_id: item.id, 
      saved_note: item.note, 
      saved_at: item.created_at
    }))
  }

  return (
    <VaultClient 
      initialItems={formattedItems} 
      initialPlan={profile?.plan?.toLowerCase() || 'free'}
      userId={user.id}
    />
  )
}
