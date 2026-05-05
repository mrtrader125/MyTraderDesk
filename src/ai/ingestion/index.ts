// src/ai/ingestion/index.ts

import { handleToolCall } from '@/ai/kernel/toolDispatcher'
import { safeGenerateMentorDecision } from '@/ai/safeGenerate'
import { decodeUserIntent } from '@/ai/services/intentRouter' // <-- Imports our new LLM decoder

export async function handleUserMessage(user: any, text: string) {
  // 1. Send the messy user text to the Intent Router
  const routerResult = await decodeUserIntent(text);

  // 2. If the router caught a specific command, map it to the database tool
  if (routerResult.intent !== 'UNKNOWN') {
    let toolDecision = null;

    if (routerResult.intent === 'PAUSE_USER') {
      toolDecision = { tool: 'pause_user', args: { days: routerResult.days || 1 } };
    } 
    else if (routerResult.intent === 'MARK_PREP_DONE') {
      toolDecision = { tool: 'mark_prep_done', args: {} };
    } 
    else if (routerResult.intent === 'LOG_TRADE') {
      toolDecision = { tool: 'log_trade', args: {} };
    }

    // 3. Execute the Database Update
    if (toolDecision) {
      const result = await handleToolCall(user, toolDecision);
      
      // If the database updated successfully, the Mentor confirms it.
      return result.success 
        ? "Acknowledged. Operator protocol and database have been updated." 
        : result.message;
    }
  }

  // 4. If the intent was UNKNOWN (general chat or questions), hand it to the normal AI
  const decision = await safeGenerateMentorDecision({ prompt: text, user });
  return decision.type === 'message' ? decision.content : null;
}
