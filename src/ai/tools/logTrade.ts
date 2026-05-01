import { supabase } from '@/lib/supabase'

export async function logTrade(userId: string) {
  const { data, error } = await supabase.rpc('safe_log_trade', { u_id: userId })
  
  if (!data) {
    return { success: false, reason: 'LIMIT_REACHED', message: "Daily trade limit reached. Step away." }
  }
  return { success: true }
}