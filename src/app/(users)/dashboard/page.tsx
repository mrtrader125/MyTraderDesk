import { createClient } from '@/lib/supabaseServer'
import DashboardClient from './DashboardClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userId = user.id

  const [
    { data: profile },
    { data: broadcasts },
    { data: vaultData },
    { data: analyses }
  ] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', userId).single(),
    supabase.from('notifications')
      .select('*')
      .eq('type', 'BROADCAST')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase.from('user_vault').select('analysis_id, analyses(asset_symbol, timeframe, status)').eq('user_id', userId),
    supabase.from('analyses').select('*').order('created_at', { ascending: false })
  ])

  const formattedWatchlist = vaultData?.map((v: any) => ({
    id: v.analysis_id,
    symbol: v.analyses?.asset_symbol,
    timeframe: v.analyses?.timeframe,
    status: v.analyses?.status
  })) || []

  let activeBroadcast = null
  if (broadcasts && broadcasts.length > 0) {
    const b = broadcasts[0]
    const userTier = profile?.plan ? profile.plan.toUpperCase() : 'DEMO'
    if (b.target_tier === 'ALL' || b.target_tier === userTier) {
      activeBroadcast = b
    }
  }

  // PAYLOAD SCRUBBING: Prevent Next.js from leaking premium notes into the HTML payload for demo users.
  const isPro = profile?.plan === 'pro'
  const safeAnalyses = analyses?.map((setup: any) => {
    if (isPro) return setup
    return {
      ...setup,
      notes: null,
      content: null
    }
  }) || []

  return (
    <DashboardClient 
      userId={userId} 
      initialPlan={profile?.plan?.toLowerCase() || 'demo'} 
      initialBroadcast={activeBroadcast} 
      initialWatchlist={formattedWatchlist} 
      initialSetups={safeAnalyses} 
    />
  )
}
