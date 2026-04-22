// src/ai/services/contextBuilder.ts

export async function getDailyTraderContext(supabase: any, userId: string) {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  // 1. Fetch everything in parallel
  const [profileRes, setupsRes, logsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_desk_setups').select('symbol, playbook').eq('user_id', userId).eq('is_today', true),
    supabase.from('user_desk_logs').select('symbol, execution_type, outcome').eq('user_id', userId).gte('created_at', startOfDay.toISOString())
  ]);

  const profileData = profileRes.data || {};
  const activeSetups = setupsRes.data || [];
  const logs = logsRes.data || [];

  // 2. Map Profile
  const userProfile = {
    assetFocus: profileData.asset_focus || "Adaptive",
    executionStyle: profileData.execution_style || "Intraday",
    loggingPreference: profileData.logging_preference || "Minimalist",
    timezone: profileData.timezone || "UTC"
  };

  // 3. Crunch Daily Stats
  const activePairs = activeSetups.map((s: any) => s.symbol).join(', ') || '0 pairs';
  const tradesTaken = logs.length;
  const imperfectCount = logs.filter((l: any) => l.execution_type === 'Imperfect').length;
  const perfectCount = logs.filter((l: any) => l.execution_type === 'Perfect').length;

  // 4. Build the Injectable Context String
  const liveContext = `
    [SYSTEM REAL-TIME CONTEXT DATA]
    - Staged Pairs Today: ${activePairs}
    - Total Executions Today: ${tradesTaken} / 2 Maximum
    - Discipline Breakdown: ${perfectCount} Perfect, ${imperfectCount} Imperfect
  `;

  return { userProfile, liveContext, stats: { tradesTaken, imperfectCount, perfectCount } };
}
