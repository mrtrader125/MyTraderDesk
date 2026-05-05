// src/ai/services/intentRouter.ts

export async function decodeUserIntent(userMessage: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  const systemPrompt = `
You are a strict intent router for an institutional trading system.
Categorize the user's message into exactly one of these intents:

1. "PAUSE_USER" - User wants to initiate a break, is sick, or stepping away.
2. "RESUME_USER" - User is officially returning to the desk/resuming operations.
3. "MAINTAIN_LEAVE" - User is acknowledging a warning but will stay off the desk (e.g., "Just looking", "Deleting it and leaving").
4. "VALID_EXCEPTION" - User is performing admin work that doesn't break their leave (e.g., "Just logging a past trade", "Reviewing data").
5. "MARK_PREP_DONE" - User has finished their required prep work.
6. "LOG_TRADE" - User just took a trade or locked an entry.
7. "UNKNOWN" - Unclear intent or general chat.

OUTPUT FORMAT: RAW JSON ONLY.

JSON Schema:
{
  "intent": "STRING", // Must be one of the Valid Intents
  "days": 1 // Only include if intent is PAUSE_USER. Estimate days (e.g., "today" = 1, "this week" = 5). Default is 1.
}
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
        temperature: 0,
        response_format: { type: "json_object" }
      })
    });
    
    return JSON.parse((await response.json()).choices[0].message.content);
    
  } catch (error) {
    console.error("Intent Router Failed:", error);
    return { intent: "UNKNOWN" };
  }
}
