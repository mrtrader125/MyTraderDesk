// src/ai/services/geminiClient.ts

export async function generateMentorResponse(messages: any[], systemPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key is missing");

  const formattedMessages = messages.map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: { text: systemPrompt } },
      contents: formattedMessages,
      generationConfig: { temperature: 0.4 } 
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Error communicating with AI');

  return data.candidates[0].content.parts[0].text;
}
