// src/ai/services/geminiClient.ts
import { mentorTools } from '../core/tools';

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
      // 👇 We add the tools right here so Gemini knows what it can do
      tools: [{ functionDeclarations: mentorTools }],
      generationConfig: { temperature: 0.4 } 
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Error communicating with AI');

  // The AI might return a regular text message, OR it might return a function call request.
  // We return the raw parts so our Next.js API route can decide what to do next.
  return data.candidates[0].content.parts;
}
