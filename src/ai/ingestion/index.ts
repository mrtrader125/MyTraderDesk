// src/ai/ingestion/index.ts

import { handleToolCall } from '@/ai/kernel/toolDispatcher'
import { safeGenerateMentorDecision } from '@/ai/safeGenerate'
import { decodeUserIntent } from '@/ai/services/intentRouter'

export async function handleUserMessage(user: any, text: string) {
  const routerResult = await decodeUserIntent(text);

  if (routerResult.intent !== 'UNKNOWN') {
    
    // --- THE STANDOFF INTENTS ---
    if (routerResult.intent === 'MAINTAIN_LEAVE') {
      return "Acknowledged. Status remains ON_LEAVE. Close the terminal.";
    }
    if (routerResult.intent === 'VALID_EXCEPTION') {
      return "Exception logged. Proceed with admin task. Status remains ON_LEAVE.";
    }

    // --- THE DATABASE TOOL INTENTS ---
    let toolDecision = null;

    if (routerResult.intent === 'PAUSE_USER') {
      // Correctly passes the days variable from the LLM
      toolDecision = { tool: 'pause_user', args: { days: routerResult.days || 1 } };
    } 
    else if (routerResult.intent === 'RESUME_USER') {
      toolDecision = { tool: 'resume_user', args: {} };
    }
    else if (routerResult.intent === 'MARK_PREP_DONE') {
      toolDecision = { tool: 'mark_prep_done', args: {} };
    } 
    else if (routerResult.intent === 'LOG_TRADE') {
      toolDecision = { tool: 'log_trade', args: {} };
    }

    // Execute the Database Update
    if (toolDecision) {
      const result = await handleToolCall(user, toolDecision);
      
      if (result.success) {
        if (toolDecision.tool === 'resume_user') return "Acknowledged. Status set to ACTIVE. Operations resumed.";
        if (toolDecision.tool === 'pause_user') return "Acknowledged. Status set to ON_LEAVE. Mental capital protected.";
        return "Acknowledged. Operator protocol and database have been updated.";
      }
      return result.message;
    }
  }

  // Fallback to strict CRO for unknown edge cases
  const decision = await safeGenerateMentorDecision({ prompt: text, user });
  return decision.type === 'message' ? decision.content : null;
}
