// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { handleUserMessage } from '@/ingestion';

// --- FETCH CHAT HISTORY ON MOUNT (Kept exactly as you had it) ---
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
    .limit(20);

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

    // 1. Log the user's message immediately so it shows up in history
    await supabase.from('mentor_chat_logs').insert([
      { user_id: user.id, role: 'user', content: userMessage.content }
    ]);

    // 2. Fetch the user's active trading state for the new Kernel
    const { data: userModule } = await supabase
      .from('user_trading_modules')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!userModule) {
       return NextResponse.json({ text: "Sentinel module initializing. Please complete your setup in the terminal." })
    }

    // 3. Route the message through the new Ingestion Layer (this replaces your contextBuilder & systemPrompt)
    const aiReply = await handleUserMessage(userModule, userMessage.content);

    // 4. Log the AI's response
    if (aiReply && aiReply !== '[SILENCE]') {
        await supabase.from('mentor_chat_logs').insert([
          { user_id: user.id, role: 'model', content: aiReply }
        ]);
    }

    return NextResponse.json({ text: aiReply || "Acknowledged." });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
