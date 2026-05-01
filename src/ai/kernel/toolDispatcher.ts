import { pauseUser, resumeUser, markPrepDone, logTrade } from '@/ai/tools'

export async function handleToolCall(user: any, decision: any) {
  try {
    switch (decision.tool) {
      case 'pause_user':
        return await pauseUser(user.user_id, decision.args.days)
      case 'resume_user':
        return await resumeUser(user.user_id)
      case 'mark_prep_done':
        return await markPrepDone(user.user_id)
      case 'log_trade':
        return await logTrade(user.user_id)
      default:
        return { success: false, message: 'Unknown tool requested.' }
    }
  } catch (error) {
    return { success: false, message: 'System constraint prevented execution.' }
  }
}