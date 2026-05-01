// src/ai/context/index.ts
import { redis } from '@/lib/redis'
import { supabase } from '@/lib/supabase'

export async function buildContext(user: any) {
  const key = `ctx:v1:${user.user_id}`
  let behavior: any = await redis.get(key)

  if (!behavior) {
    const { data: logs } = await supabase.from('operator_score_logs')
      .select('final_score, missed_prep_count, overtrade_count, off_session_count, unlogged_session_count')
      .eq('user_id', user.user_id).order('trading_date', { ascending: false }).limit(5)
    
    if (!logs || logs.length === 0) return ''

    const aggregatedSummary = logs.reduce((acc, d) => {
      acc.avgScore += d.final_score
      acc.missedPrep += d.missed_prep_count
      acc.overtrade += d.overtrade_count
      acc.offSession += d.off_session_count
      acc.unlogged += d.unlogged_session_count
      return acc
    }, { avgScore: 0, missedPrep: 0, overtrade: 0, offSession: 0, unlogged: 0 })

    if (logs.length > 0) {
      aggregatedSummary.avgScore = Math.round(aggregatedSummary.avgScore / logs.length)
    }

    await redis.set(key, aggregatedSummary, { ex: 600 })
    behavior = aggregatedSummary
  }

  return `
[OPERATOR STATE]
Status: ${user.status}
Day State: ${user.current_day_state}
Trades: ${user.current_day_trades_taken}/${user.max_daily_trades}

[RECENT BEHAVIOR]
Avg Score (5D): ${behavior.avgScore ?? 'N/A'}
Missed Prep: ${behavior.missedPrep ?? 0}
Overtrades: ${behavior.overtrade ?? 0}
`
}