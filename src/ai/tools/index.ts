import { supabase } from '@/lib/supabase'

export async function logTrade(userId: string) {
  const { data } = await supabase.rpc('safe_log_trade', { u_id: userId })
  if (!data) return { success: false, message: 'Limit reached' }
  return { success: true }
}

export async function markPrepDone(userId: string) {
  const { data } = await supabase.from('user_trading_modules').update({ current_day_state: 'PREP_DONE' }).eq('user_id', userId).eq('status', 'ACTIVE')
  return data ? { success: true } : { success: false }
}

export async function pauseUser(userId: string, days: number) {
  const until = new Date(Date.now() + days * 86400000)
  await supabase.from('user_trading_modules').update({ status: 'ON_LEAVE', paused_until: until }).eq('user_id', userId)
  return { success: true }
}

export async function resumeUser(userId: string) {
  await supabase.from('user_trading_modules').update({ status: 'ACTIVE', paused_until: null }).eq('user_id', userId)
  return { success: true }
}
