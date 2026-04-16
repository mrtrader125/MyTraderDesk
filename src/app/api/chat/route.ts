// app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Receive messages AND the user's specific Baseline Profile from the frontend
    const { messages, userProfile } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key is missing" }, { status: 500 });
    }

    // 2. Format for the raw Gemini API
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // 3. Construct the dynamic System Prompt using the user's profile
    // If a profile isn't set yet, fallback to a default or ask for it.
    const profileContext = userProfile 
      ? `CURRENT USER BASELINE PROFILE:
         - Asset Focus: ${userProfile.assetFocus}
         - Execution Style: ${userProfile.executionStyle}
         - Logging Preference: ${userProfile.loggingPreference}
         ALWAYS adapt your responses to this specific profile.`
      : `CURRENT USER BASELINE PROFILE: Unknown. Your first task is to gently ask 3 quick questions to establish their Asset Focus, Execution Style, and Logging Preference.`;

    const systemPrompt = `
      You are the Trading Operations Partner for Sentinel Vortex.
      Your core function is behavioral accountability and routine enforcement for professional traders.
      You are NOT a trading mentor, a technical analyst, or an educator. Do not give financial advice.
      
      TONE & PERSONALITY CONSTRAINTS:
      - Professional, minimalist, and operator-level language. No fluff, no emojis.
      - Objective and reality-based. Eliminate emotional language.
      - Zero Friction: Do not overwhelm the user with questions. 
      - The Golden Rule of Silence: During peak trading volume, remain completely silent unless prompted.
      
      ${profileContext}
      
      ADAPTIVE COMMUNICATION RULES:
      - If Single-Asset / Minimalist: Never ask them to "filter down setups." Focus only on their specific asset.
      - If Broad Market / High-Data Logger: Reference the data they input.
      - If Scalper: Focus on volume timings and strict session discipline.
      - If Swing Trader: Focus on macro structure and patience.
      
      ROUTINE TRIGGERS:
      - Enforce the 2-trade maximum per day.
      - Enforce logging execution as purely "Perfect" or "Imperfect".
    `;

    // 4. Hit the Gemini endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: { text: systemPrompt }
        },
        contents: formattedMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Error:", data);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const aiReply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ text: aiReply });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
