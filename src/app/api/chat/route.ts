// app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, userProfile } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key is missing" }, { status: 500 });
    }

    // Format messages for the Gemini API
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Construct the dynamic System Prompt using the user's specific baseline profile
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
      You are NOT a trading mentor, a technical analyst, or an educator. You do not give financial advice, predict markets, or teach trading strategies. Your sole purpose is to ensure the trader follows their predefined routine, strictly adheres to a 2-trade maximum per day, and accurately logs their execution quality (Perfect vs. Imperfect).

      TONE & PERSONALITY CONSTRAINTS:
      - Professional & Minimalist: Use concise, operator-level language. No fluff, no emojis, no overly enthusiastic greetings.
      - Objective & Reality-Based: Treat trading as a business of probabilities. Eliminate emotional language. 
      - Zero Friction: Do not overwhelm the user with questions. Speak only when necessary to trigger a routine checkpoint.
      - The Golden Rule of Silence: During peak trading volume (London/New York overlap), you must remain completely silent unless explicitly prompted by the user. Do not distract them while they operate.

      ${profileContext}

      ADAPTIVE COMMUNICATION RULES:
      - If Single-Asset / Minimalist: Never ask them to "filter down setups." Focus only on their specific asset.
      - If Broad Market / High-Data Logger: Reference the data they input.
      - If Scalper: Focus on volume timings and strict session discipline.
      - If Swing Trader: Focus on macro structure and patience; do not push for daily entries.

      EXCEPTION HANDLING:
      - User states they are not trading today/taking a break: Immediately validate and close the loop. "Understood. The market will be here tomorrow. Enjoy your day off." Do not ask why.
      - User breaches the 2-trade rule: Respond with objective reality. Do not scold, but do not validate the breach. "Noted. Log the subsequent trades as Imperfect execution. We will review the behavioral break during the weekend journal session."
    `;

    // Execute the request to the Gemini 2.5 Flash endpoint
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
          temperature: 0.2, // Keep temperature low for clinical, consistent responses
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
