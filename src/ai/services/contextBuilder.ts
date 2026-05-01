import { SupabaseClient } from '@supabase/supabase-js';

export async function getDailyTraderContext(supabase: SupabaseClient, userId: string) {
  // 1. Fetch the Operator Contract & Profile
  const { data: userData } = await supabase
    .from('profiles')
    .select(`
      username, timezone,
      user_trading_modules (
        status, current_day_state, daily_prep_time, weekly_prep_time, shift_start, shift_end, max_daily_trades, max_staged_assets
      )
    `)
    .eq('id', userId)
    .single();

  const module = userData?.user_trading_modules?.[0] || {};
  const userTimezone = userData?.timezone || 'UTC';

  // 2. Calculate their exact local time
  const nowUserLocal = new Date(new Date().toLocaleString('en-US', { timeZone: userTimezone }));
  const currentTimeString = nowUserLocal.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  // 3. Fetch Today's Activity (Start of their local day)
  const startOfDayLocal = new Date(nowUserLocal.setHours(0, 0, 0, 0)).toISOString();
  
  const [
    { data: setups },
    { data: logs }
  ] = await Promise.all([
    supabase.from('user_desk_setups').select('symbol, playbook').eq('user_id', userId).gte('created_at', startOfDayLocal),
    supabase.from('user_desk_logs').select('execution_type, reason, symbol').eq('user_id', userId).gte('created_at', startOfDayLocal)
  ]);

  const activeSetups = setups || [];
  const todayLogs = logs || [];
  
  const perfectCount = todayLogs.filter(l => l.execution_type === 'Perfect').length;
  const imperfectCount = todayLogs.filter(l => l.execution_type === 'Imperfect').length;
  const totalTrades = perfectCount + imperfectCount;

  // 4. Build the live telemetry payload for the LLM
  const liveContext = `
[LIVE TELEMETRY FEED]
Operator: @${userData?.username || 'Operator'}
Operator Local Time: ${currentTimeString}
Timezone: ${userTimezone}

[OPERATOR CONTRACT]
Active Shift: ${module.shift_start || '08:00'} to ${module.shift_end || '12:00'}
Daily Prep Deadline: ${module.daily_prep_time || '07:00'}
Max Daily Executions: ${module.max_daily_trades || 2} trades

[TODAY'S ACTIVITY]
Current State: ${module.current_day_state || 'AWAITING_PREP'}
Assets Staged in Desk: ${activeSetups.length} (Symbols: ${activeSetups.map(s => s.symbol).join(', ') || 'None'})
Total Trades Executed Today: ${totalTrades} / ${module.max_daily_trades || 2}

[EXECUTION QUALITY]
Perfect Executions (Followed Plan): ${perfectCount}
Imperfect Executions (Emotional/Deviated): ${imperfectCount}
Recent Execution Catalysts: ${todayLogs.map(l => l.reason).join(', ') || 'None logged'}
`;

  return {
    userProfile: userData,
    liveContext,
    stats: { tradesTaken: totalTrades, perfectCount, imperfectCount }
  };
}
