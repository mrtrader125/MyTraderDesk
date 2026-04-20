// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/ai/core/systemPrompt';

export async function POST(req: Request) {
  try {
    const { messages, userProfile } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key is missing" }, { status: 500 });
    }

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Generate the dynamic prompt using our new dedicated file
    const systemPrompt = buildSystemPrompt(userProfile);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: { text: systemPrompt }
        },
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.4, // Slightly higher temperature (0.4) allows the mentor to sound more conversational and human
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Error:", data);
      return NextResponse.json({ error: data.error.message || 'Error communicating with AI' }, { status: 500 });
    }

    const aiReply = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ text: aiReply });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
