import { createClient } from '@/lib/supabaseServer'
import DashboardClient from './DashboardClient'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // =========================================
  // CREATE SUPABASE CLIENT
  // =========================================
  const supabase = await createClient()

  // =========================================
  // GET AUTHENTICATED USER
  // =========================================
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // =========================================
  // PROTECT DASHBOARD
  // =========================================
  if (!user) {
    redirect('/login')
  }

  const userId = user.id

  // =========================================
  // PARALLEL DATA FETCHING
  // =========================================
  const [
    { data: profile },
    { data: broadcasts },
    { data: vaultData },
    { data: analyses },
  ] = await Promise.all([

    // =========================================
    // USER PROFILE
    // =========================================
    supabase
      .from('profiles')
      .select('plan, protocol_established')
      .eq('id', userId)
      .single(),

    // =========================================
    // ACTIVE BROADCASTS
    // =========================================
    supabase
      .from('notifications')
      .select('*')
      .eq('type', 'BROADCAST')
      .eq('status', 'ACTIVE')
      .order('created_at', {
        ascending: false,
      })
      .limit(1),

    // =========================================
    // USER WATCHLIST / VAULT
    // =========================================
    supabase
      .from('user_vault')
      .select(`
        analysis_id,
        analyses (
          asset_symbol,
          timeframe,
          status
        )
      `)
      .eq('user_id', userId),

    // =========================================
    // LIGHTWEIGHT DASHBOARD FEED
    // =========================================
    // IMPORTANT:
    // DO NOT FETCH:
    // - notes
    // - content
    // - image_url
    // - large metadata
    //
    // Those should load ONLY
    // inside viewport pages.
    supabase
      .from('analyses')
      .select(`
        id,
        asset_symbol,
        timeframe,
        bias,
        status,
        category,
        created_at
      `)
      .order('created_at', {
        ascending: false,
      })
      .limit(150),
  ])

  // =========================================
  // ONBOARDING PROTECTION
  // =========================================
  if (
    profile?.protocol_established === false ||
    profile?.protocol_established === null
  ) {
    redirect('/onboarding')
  }

  // =========================================
  // FORMAT WATCHLIST
  // =========================================
  const formattedWatchlist =
    vaultData?.map((v: any) => ({
      id: v.analysis_id,
      symbol: v.analyses?.asset_symbol,
      timeframe: v.analyses?.timeframe,
      status: v.analyses?.status,
    })) || []

  // =========================================
  // ACTIVE BROADCAST FILTERING
  // =========================================
  let activeBroadcast = null

  if (broadcasts && broadcasts.length > 0) {
    const b = broadcasts[0]

    const userTier = profile?.plan
      ? profile.plan.toUpperCase()
      : 'DEMO'

    if (
      b.target_tier === 'ALL' ||
      b.target_tier === userTier
    ) {
      activeBroadcast = b
    }
  }

  // =========================================
  // SAFE LIGHTWEIGHT ANALYSES
  // =========================================
  // Since we already excluded heavy fields,
  // the payload is naturally safe + optimized.
  const safeAnalyses = analyses || []

  // =========================================
  // RENDER DASHBOARD
  // =========================================
  return (
    <DashboardClient
      userId={userId}
      initialPlan={
        profile?.plan?.toLowerCase() || 'demo'
      }
      initialBroadcast={activeBroadcast}
      initialWatchlist={formattedWatchlist}
      initialSetups={safeAnalyses}
    />
  )
}
