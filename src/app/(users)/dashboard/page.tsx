import { createClient } from '@/lib/supabaseServer'
import DashboardClient from './DashboardClient'

export const runtime = 'edge'
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id

  // 🚨 OPTIMIZATION: Fetch everything in parallel to eliminate the waterfall
  const [
    { data: profile },
    { data: broadcasts },
    { data: vaultData },
    { data: analyses }
  ] = await Promise.all([
    userId ? supabase.from('profiles').select('plan').eq('id', userId).single() : Promise.resolve({ data: null }),
    supabase.from('notifications')
      .select('*')
      .eq('type', 'BROADCAST')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(1),
    userId ? supabase.from('user_vault').select('analysis_id, analyses(asset_symbol, timeframe, status)').eq('user_id', userId) : Promise.resolve({ data: null }),
    supabase.from('analyses').select('*').order('created_at', { ascending: false })
  ])

  // Format watchlist
  const formattedWatchlist = vaultData?.map((v: any) => ({
    id: v.analysis_id, 
    symbol: v.analyses?.asset_symbol, 
    timeframe: v.analyses?.timeframe, 
    status: v.analyses?.status
  })) || []

  // Ensure tier-based broadcast logic is respected
  let activeBroadcast = null
  if (broadcasts && broadcasts.length > 0) {
    const b = broadcasts[0]
    const userTier = profile?.plan ? profile.plan.toUpperCase() : 'FREE'
    if (b.target_tier === 'ALL' || b.target_tier === userTier) {
      activeBroadcast = b
    }
  }

  // Inject everything straight into the client!
  return (
    <DashboardClient 
      userId={userId}
      initialPlan={profile?.plan?.toLowerCase()}
      initialBroadcast={activeBroadcast}
      initialWatchlist={formattedWatchlist}
      initialSetups={analyses || []}
    />
  )
}
