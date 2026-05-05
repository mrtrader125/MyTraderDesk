import { handleToolCall } from '@/ai/kernel/toolDispatcher'
import { safeGenerateMentorDecision } from '@/ai/safeGenerate'
import { decodeUserIntent } from '@/ai/services/intentRouter'

export async function handleUserMessage(user: any, text: string) {
  const routerResult = await decodeUserIntent(text);

  if (routerResult.intent !== 'UNKNOWN') {
    if (routerResult.intent === 'RESUME_USER') {
      await handleToolCall(user, { tool: 'resume_user', args: {} });
      return "Acknowledged. Status set to ACTIVE. Operations resumed.";
    } 
    
    if (routerResult.intent === 'MAINTAIN_LEAVE') {
      return "Acknowledged. Status remains ON_LEAVE. Close the terminal.";
    }
    
    if (routerResult.intent === 'VALID_EXCEPTION') {
      return "Exception logged. Proceed with admin task. Status remains ON_LEAVE.";
    }

    if (routerResult.intent === 'PAUSE_USER') {
      await handleToolCall(user, { tool: 'pause_user', args: { days: 1 } });
      return "Acknowledged. Status set to ON_LEAVE. Mental capital protected.";
    }

    if (routerResult.intent === 'MARK_PREP_DONE') {
      await handleToolCall(user, { tool: 'mark_prep_done', args: {} });
      return "Acknowledged. Prep marked complete.";
    }
  }

  // Fallback to strict CRO for unknown edge cases
  const decision = await safeGenerateMentorDecision({ prompt: text, user });
  return decision.type === 'message' ? decision.content : null;
}
