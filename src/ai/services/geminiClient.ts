// src/ai/services/geminiClient.ts

export async function generateMentorResponse(messages: any[], systemPrompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  // 1. Build Message History (Stripping out any old tool data to prevent API crashes)
  const openAiMessages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  messages.forEach((m: any) => {
    const isModel = m.role === 'model' || m.role === 'assistant';
    let textContent = m.content;

    if (m.parts && m.parts.length > 0) {
      const part = m.parts[0];
      if (part.text) textContent = part.text;
      // We explicitly ignore part.functionCall and part.functionResponse
    }

    // Only push valid text messages. Drop all tool-related history.
    if (textContent) {
      openAiMessages.push({
        role: isModel ? 'assistant' : 'user',
        content: textContent
      });
    }
  });

  // 2. Make the call to Groq (NO TOOLS ALLOWED)
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile", 
      messages: openAiMessages,
      temperature: 0.1 // 🚨 REDUCED TO 0.1: Kills creativity, forces strict deterministic enforcement
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Error communicating with Groq');

  // 3. Return sanitized text
  return [{
    text: data.choices[0].message.content
  }];
}
