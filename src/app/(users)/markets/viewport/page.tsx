import { createClient } from '@/lib/supabaseServer'
import ViewportClient from './ViewportClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function ViewportPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams
  const asset = typeof resolvedParams.asset === 'string' ? resolvedParams.asset : null
  const tfParam = typeof resolvedParams.tf === 'string' ? resolvedParams.tf : null
  const fromParam = typeof resolvedParams.from === 'string' ? resolvedParams.from : null

  // Security check: bounce out if no asset is provided
  if (!asset) {
    redirect('/markets')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Parallel fetch: User Plan, Bookmarks, and Setup History
  const [
    { data: profile },
    { data: vaultData },
    { data: history }
  ] = await Promise.all([
    user ? supabase.from('profiles').select('plan').eq('id', user.id).single() : Promise.resolve({ data: null }),
    user ? supabase.from('user_vault').select('analysis_id').eq('user_id', user.id) : Promise.resolve({ data: null }),
    supabase.from('analyses').select('*').eq('asset_symbol', asset).order('created_at', { ascending: false })
  ])

  const formattedWatchlist = vaultData ? vaultData.map((v: any) => ({ id: v.analysis_id })) : []

  return (
    <ViewportClient 
      asset={asset}
      tfParam={tfParam}
      fromParam={fromParam}
      initialHistory={history || []}
      initialPlan={profile?.plan?.toLowerCase() || 'free'}
      initialWatchlist={formattedWatchlist}
      userId={user?.id}
    />
  )
}
