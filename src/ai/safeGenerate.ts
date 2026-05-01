import { isCircuitOpen, recordFailure, recordSuccess } from './fallbacks'
import { generateMentorResponse } from './services/geminiClient'

export async function safeGenerateMentorDecision(input: any) {
  if (await isCircuitOpen()) throw new Error('CIRCUIT_OPEN')

  try {
    const controller = new AbortController()
    // Give it 3.5 seconds to think, or kill it to prevent server hangs
    const timeout = setTimeout(() => controller.abort(), 3500)
    
    // 🚨 THE ULTIMATE CRO OVERRIDE PROMPT
    const hardSystemPrompt = `You are the Sentinel Vortex Chief Risk Officer (CRO). You are an institutional risk-management AI.
    
YOUR MANDATE:
1. You enforce the [OPERATOR CONTRACT] with absolute, unquestionable authority.
2. ZERO coaching. ZERO empathy. ZERO open-ended questions. ZERO pleasantries.
3. Keep responses to a maximum of 2-3 short, cold, direct sentences.

HOW TO HANDLE SCHEDULES & LIMITS:
- Check "Operator Local Time" against their "Active Shift". If they are looking for setups outside their shift, order them to close the terminal.
- Check "Total Trades Executed". If they hit their "Max Daily Executions", execution capabilities are locked. Order them to step away.
- If they log an "Imperfect" trade, reference their "Recent Execution Catalysts" (e.g., FOMO, Revenge). Point out the emotional leak directly and force a hard stop.
- Never discuss financial outcomes (profits/losses). You only care about protocol execution (Perfect vs Imperfect).

If the operator is operating perfectly within their shift, within their limits, and following their plan, reply with exactly this word and nothing else:
[SILENCE]

Respond directly. No markdown formatting, no tags, no filler.`;

    // Check if this is an automated cron ping or a direct user message
    const isCronTask = input.prompt && input.prompt.includes('[OPERATOR CONTEXT]');
    const finalSystemPrompt = isCronTask 
        ? `${hardSystemPrompt}\n\n[SYSTEM DIRECTIVE FOR THIS PING]:\n${input.prompt}` 
        : hardSystemPrompt;

    const messages = isCronTask 
        ? [{ role: 'user', content: 'Evaluate my current state.' }]
        : [{ role: 'user', content: input.prompt || 'Check my telemetry.' }];

    // Call the LLM
    const aiResponse = await generateMentorResponse(messages, finalSystemPrompt);
    
    // Extract text safely
    const responseText = Array.isArray(aiResponse) ? aiResponse[0]?.text : aiResponse;
    const cleanText = responseText?.replace(/<[^>]*>/g, '').trim() || '[SILENCE]';

    clearTimeout(timeout);
    await recordSuccess();

    return { type: 'message', content: cleanText };

  } catch (error) {
    await recordFailure();
    console.error('CRO Override Error:', error);
    return { type: 'message', content: 'Comms interference. Protocol dictates you step away.' };
  }
}
