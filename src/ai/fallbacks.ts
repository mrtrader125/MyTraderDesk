import { redis } from '@/lib/redis'

export function getFallbackMessage(trigger: string, user: any) {
  switch (trigger) {
    case 'OVERTRADE':
      return `System Notice: You have exceeded your ${user.max_daily_trades}-trade limit. Step away.`
    case 'MISSED_PREP':
      return `System Notice: Daily prep window missed. Protocol breached.`
    case 'OFF_SESSION_EXECUTION':
      return `System Notice: Execution detected outside active session window.`
    default:
      return `System Notice: Action required based on your protocol.`
  }
}

// Circuit Breaker logic
export async function isCircuitOpen() {
  const state = await redis.get<string>('cb:llm:state')
  if (state === 'OPEN') {
    const lastFailure = await redis.get<number>('cb:llm:last_failure')
    if (Date.now() - (lastFailure || 0) > 60000) {
      await redis.set('cb:llm:state', 'HALF_OPEN')
      return false
    }
    return true
  }
  return false
}

export async function recordFailure() {
  const count = (await redis.incr('cb:llm:fail_count')) || 1
  await redis.set('cb:llm:last_failure', Date.now())
  if (count >= 5) await redis.set('cb:llm:state', 'OPEN')
}

export async function recordSuccess() {
  await redis.set('cb:llm:fail_count', 0)
  await redis.set('cb:llm:state', 'CLOSED')
}