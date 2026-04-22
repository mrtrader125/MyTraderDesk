// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { buildSystemPrompt } from '@/ai/core/systemPrompt';
import { getDailyTraderContext } from '@/ai/services/contextBuilder';
import { generateMentorResponse } from '@/ai/services/geminiClient';

// ... (Keep your existing GET route) ...

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

    // 3. Generate Initial Response from Gemini
    // Note: We updated geminiClient.ts to return the raw 'parts' array
    const aiParts = await generateMentorResponse(messages, unifiedSystemPrompt);
    const firstPart = aiParts[0];

    // 4. THE INTERCEPTOR: Check if the AI wants to use a tool
    if (firstPart.functionCall) {
      const toolName = firstPart.functionCall.name;
      const toolArgs = firstPart.functionCall.args;
      let toolData: any = {};

      // --- EXECUTE THE SECURE DATABASE QUERIES ---
      
      if (toolName === 'get_daily_status') {
        // We already have this data from contextBuilder!
        toolData = { live_stats: liveContext };
      } 
      
      else if (toolName === 'get_trade_autopsy') {
        // Fetch specific trade details for this user
        const { data } = await supabase
          .from('user_desk_logs')
          .select('*, user_desk_setups(notes)')
          .eq('user_id', user.id) // SECURITY: Hardcoded to current user
          .ilike('symbol', `%${toolArgs.symbol}%`)
          .order('created_at', { ascending: false })
          .limit(1);
        toolData = data ? data[0] : { error: "No recent trades found for this asset." };
      } 
      
      else if (toolName === 'get_discipline_and_leaks' || toolName === 'get_playbook_performance') {
        // Determine the date range
        let dateFilter = new Date();
        if (toolArgs.timeframe === 'WEEK') dateFilter.setDate(dateFilter.getDate() - 7);
        else if (toolArgs.timeframe === 'MONTH') dateFilter.setDate(dateFilter.getDate() - 30);
        else dateFilter = new Date(0); // ALL time

        const { data } = await supabase
          .from('user_desk_logs')
          .select('playbook, execution_type, outcome, rr, reason')
          .eq('user_id', user.id) // SECURITY: Hardcoded to current user
          .gte('created_at', dateFilter.toISOString());
        
        toolData = data || [];
      }

      // --- THE HANDOFF: Send data back to Gemini ---
      
      // Append the AI's request to the message history
      messages.push({
        role: 'assistant',
        parts: [{ functionCall: firstPart.functionCall }]
      });

      // Append our secure database results to the message history
      messages.push({
        role: 'user', // In the Gemini REST API, function responses are sent by the 'user'
        parts: [{
          functionResponse: {
            name: toolName,
            response: { content: toolData }
          }
        }]
      });

      // Call Gemini one last time with the new data so it can formulate a human response
      const finalReplyParts = await generateMentorResponse(messages, unifiedSystemPrompt);
      const finalReplyText = finalReplyParts[0].text;

      // Log the AI's final response
      await supabase.from('mentor_chat_logs').insert([
        { user_id: user.id, role: 'model', content: finalReplyText }
      ]);

      return NextResponse.json({ text: finalReplyText });
    }

    // 5. STANDARD TEXT RESPONSE (If no tools were requested)
    const standardReplyText = firstPart.text;
    await supabase.from('mentor_chat_logs').insert([
      { user_id: user.id, role: 'model', content: standardReplyText }
    ]);

    return NextResponse.json({ text: standardReplyText });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
