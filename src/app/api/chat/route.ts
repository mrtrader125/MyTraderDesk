import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key is missing" }, { status: 500 });
    }

    // Format for the raw Gemini API
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Hit the free public endpoint directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: { 
            text: "You are a trading mentor helping intermediate traders build a consistent daily routine. Speak in an authentic, conversational tone—do not sound like a drill sergeant barking orders. Keep it real and relatable to their daily life." 
          }
        },
        contents: formattedMessages
      })
    });

    const data = await response.json();

    // Catch any Google-side errors
    if (!response.ok) {
      console.error("Google API Error:", data);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    // Extract the exact text response
    const aiReply = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ text: aiReply });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}