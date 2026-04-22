// src/ai/services/geminiClient.ts
import { mentorTools } from '../core/tools';

export async function generateMentorResponse(messages: any[], systemPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key is missing");

  // Format the history securely, preserving function calls and responses
  const formattedMessages = messages.map((m: any) => {
    const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';

    // If this message contains a tool request or database result, pass it exactly as-is
    if (m.parts && (m.parts[0].functionCall || m.parts[0].functionResponse)) {
      return { role, parts: m.parts };
    }

    // Otherwise, treat it as standard text communication
    return {
      role,
      parts: [{ text: m.content || '' }]
    };
  });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: { text: systemPrompt } },
      contents: formattedMessages,
      tools: [{ functionDeclarations: mentorTools }], // The Menu
      generationConfig: { temperature: 0.4 } 
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Error communicating with AI');

  // Return the raw parts array so the Next.js API route can intercept function calls
  return data.candidates[0].content.parts;
}
