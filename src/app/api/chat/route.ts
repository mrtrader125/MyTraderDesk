// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { buildSystemPrompt } from '@/ai/core/systemPrompt';
import { getDailyTraderContext } from '@/ai/services/contextBuilder';
import { generateMentorResponse } from '@/ai/services/geminiClient';

// --- FETCH CHAT HISTORY ON MOUNT ---
export async function GET(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: logs } = await supabase
    .from('mentor_chat_logs')
    .select('role, content')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20); // Get last 20 messages

  return NextResponse.json({ messages: logs?.reverse() || [] });
}

// --- HANDLE NEW MESSAGES ---
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userMessage = messages[messages.length - 1];

    // 1. Log the user's message immediately
    await supabase.from('mentor_chat_logs').insert([
      { user_id: user.id, role: 'user', content: userMessage.content }
    ]);

    // 2. Fetch reality context & build prompt
    const { userProfile, liveContext } = await getDailyTraderContext(supabase, user.id);
    const unifiedSystemPrompt = `${buildSystemPrompt(userProfile)}\n\n${liveContext}`;

    // 3. Generate Response
    const aiResponse = await generateMentorResponse(messages, unifiedSystemPrompt);
    
    // Extract the exact string from the Groq/Gemini response array
    const replyText = aiResponse[0]?.text || "System constraint: No response generated.";

    // 🚨 THE SILENCE INTERCEPTOR
    // If the trader is disciplined, the AI stays silent. We drop the message.
    if (replyText.includes('[SILENCE]')) {
      return NextResponse.json({ text: null });
    }

    // 4. Log the clean text to the database (only if not silent)
    await supabase.from('mentor_chat_logs').insert([
      { user_id: user.id, role: 'model', content: replyText }
    ]);

    // 5. Send the clean text back to the React widget
    return NextResponse.json({ text: replyText });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
