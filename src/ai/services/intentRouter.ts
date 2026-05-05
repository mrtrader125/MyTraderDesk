// src/ai/services/intentRouter.ts

export async function decodeUserIntent(userMessage: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  const systemPrompt = `
You are a strict intent router for a trading system.
Read the user's message and categorize it into exactly one of these intents.

Valid Intents:
1. "PAUSE_USER" - The user is taking a break, sick, exhausted, off the desk, or stepping away.
2. "MARK_PREP_DONE" - The user has finished their required prep work or analysis.
3. "LOG_TRADE" - The user just took a trade, executed a setup, or locked an entry.
4. "UNKNOWN" - The user is just chatting, asking a question, or the intent is unclear.
5. "RESUME_USER" - The user is returning to the desk after a break, saying they are back, or ready to start trading again.

OUTPUT FORMAT:
You must return ONLY a raw JSON object. No markdown formatting, no code blocks, no explanation.

JSON Schema:
{
  "intent": "STRING", // Must be one of the Valid Intents
  "days": 1 // Only include if intent is PAUSE_USER. Estimate days (e.g., "today" = 1, "this week" = 5). Default is 1.
}
`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0, // Zero creativity, strict routing
        response_format: { type: "json_object" } // Forces the LLM to output valid JSON
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Router API Error');

    // Parse the JSON returned by the LLM
    const result = JSON.parse(data.choices[0].message.content);
    return result;

  } catch (error) {
    console.error("Intent Router Failed:", error);
    // If the API fails or the user says gibberish, fail safely
    return { intent: "UNKNOWN" };
  }
}
