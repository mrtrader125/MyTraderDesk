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
    supabase.from('profiles').select('plan, protocol_established').eq('id', userId).single(),
    supabase.from('notifications')
      .select('*')
      .eq('type', 'BROADCAST')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase.from('user_vault').select('analysis_id, analyses(asset_symbol, timeframe, status)').eq('user_id', userId),
    // 🚨 OPTIMIZATION: Only fetch required fields, active/waiting status, and limit to 40
    supabase.from('analyses')
      .select('id, asset_symbol, timeframe, bias, status, category, created_at')
      .in('status', ['ACTIVE', 'WAITING'])
      .order('created_at', { ascending: false })
      .limit(40)
  ])

  if (profile?.protocol_established === false || profile?.protocol_established === null) {
    redirect('/onboarding')
  }

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

  // No longer need to strip out heavy content/notes as they aren't queried anymore
  const safeAnalyses = analyses || []

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
