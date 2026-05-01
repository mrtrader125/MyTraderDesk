import { handleToolCall } from '@/ai/kernel/toolDispatcher'
import { safeGenerateMentorDecision } from '@/ai/safeGenerate'

// Rule-based fast path
function ruleMatch(text: string) {
  const t = text.toLowerCase()
  if (/(not trading|pause)/.test(t)) return { intent: 'PAUSE_REQUEST', tool: 'pause_user', args: { days: 1 } }
  if (/(prep done|ready)/.test(t)) return { intent: 'PREP_DONE', tool: 'mark_prep_done', args: {} }
  if (/(took trade|logged)/.test(t)) return { intent: 'TRADE_LOG', tool: 'log_trade', args: {} }
  return null
}

export async function handleUserMessage(user: any, text: string) {
  const ruleIntent = ruleMatch(text)

  if (ruleIntent) {
    const result = await handleToolCall(user, ruleIntent)
    return result.success ? "Done. Protocol updated." : result.message
  }

  // Fallback to AI for general chat
  const decision = await safeGenerateMentorDecision({ prompt: text, user })
  return decision.type === 'message' ? decision.content : null
}