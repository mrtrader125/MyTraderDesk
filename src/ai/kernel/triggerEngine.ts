// src/kernel/triggerEngine.ts
import { getUserLocalHour } from '@/ai/utils/timezone';

export function evaluateTrigger(user: any): string | null {
  if (user.current_day_trades_taken > user.max_daily_trades) {
    return 'OVERTRADE'
  }
  
  const hour = getUserLocalHour(user.active_trading_timezone || 'UTC');
  const prepHour = user.daily_prep_time ? parseInt(user.daily_prep_time.split(':')[0]) : null

  if (prepHour !== null && hour > prepHour && user.current_day_state === 'NOT_STARTED') {
    return 'MISSED_PREP'
  }
  return null
}