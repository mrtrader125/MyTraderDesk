import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildSystemPrompt } from '@/ai/core/systemPrompt';
import { getDailyTraderContext } from '@/ai/services/contextBuilder';
import { generateMentorResponse } from '@/ai/services/geminiClient';

// Use Edge runtime for fast cron execution
export const runtime = 'edge';

export async function GET(request: Request) {
  // 1. Cron Security Check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Mentor Cron Error: Unauthorized access attempt.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const botToken = process.env.TELEGRAM_SENTINEL_TOKEN;

  if (!supabaseUrl || !supabaseServiceKey || !botToken) {
    console.error('Mentor Cron Error: Missing Environment Variables.');
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 2. Fetch all users who have securely linked their Telegram accounts
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, username, telegram_user_id')
      .not('telegram_user_id', 'is', null);

    if (userError || !users || users.length === 0) {
      return NextResponse.json({ message: 'No linked users found to mentor.' }, { status: 200 });
    }

    // 3. Process each user asynchronously
    const mentorPromises = users.map(async (user) => {
      
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60000).toISOString();
      const { data: recentLogs } = await supabase
        .from('user_desk_logs')
        .select('id, execution_type')
        .eq('user_id', user.id)
        .gte('created_at', fifteenMinutesAgo);

      // If they haven't logged a trade recently, remain silent.
      if (!recentLogs || recentLogs.length === 0) {
         return; 
      }

      // 4. Fetch the full daily context
      const { userProfile, liveContext, stats } = await getDailyTraderContext(supabase, user.id);

      // 5. Decide WHY we are reaching out
      const recentImperfect = recentLogs.filter(l => l.execution_type === 'Imperfect').length;
      let proactiveContext = "";

      if (recentImperfect > 0) {
         proactiveContext = `The user JUST logged an 'Imperfect' execution. As their mentor, proactively reach out. Acknowledge that the day didn't go strictly to plan, ask them what psychological trigger caused the deviation, and ensure they have stepped away from the desk to protect their capital. Feel free to check their past leaks if needed.`;
      } else if (stats.tradesTaken >= 2 && stats.imperfectCount === 0) {
         proactiveContext = `The user JUST finished their trades for the day (Daily limits reached) and graded them all as 'Perfect'. Proactively reach out to congratulate their discipline and tell them to close the charts for the day.`;
      } else {
         return; 
      }

      // 6. Build the prompt
      const systemPrompt = buildSystemPrompt(userProfile);
      const unifiedSystemPrompt = `${systemPrompt}\n\n${liveContext}\n\nCRITICAL INSTRUCTION: ${proactiveContext}`;
      
      const initialMessages = [{ role: 'user', content: 'Initiate proactive daily check-in based on recent activity.' }];

      // 7. Generate Response & Intercept Tools
      const aiParts = await generateMentorResponse(initialMessages, unifiedSystemPrompt);
      const firstPart = aiParts[0];
      let finalAiText = "";

      if (firstPart.functionCall) {
        const toolName = firstPart.functionCall.name;
        const toolArgs = firstPart.functionCall.args;
        let toolData: any = {};
        
        if (toolName === 'get_daily_status') {
          toolData = { live_stats: liveContext };
        } else if (toolName === 'get_trade_autopsy') {
          const { data } = await supabase.from('user_desk_logs').select('*, user_desk_setups(notes)').eq('user_id', user.id).ilike('symbol', `%${toolArgs.symbol}%`).order('created_at', { ascending: false }).limit(1);
          toolData = data ? data[0] : { error: "No recent trades found." };
        } else if (toolName === 'get_discipline_and_leaks' || toolName === 'get_playbook_performance') {
          let dateFilter = new Date();
          if (toolArgs.timeframe === 'WEEK') dateFilter.setDate(dateFilter.getDate() - 7);
          else if (toolArgs.timeframe === 'MONTH') dateFilter.setDate(dateFilter.getDate() - 30);
          else dateFilter = new Date(0);
          
          const { data } = await supabase.from('user_desk_logs').select('playbook, execution_type, outcome, rr, reason').eq('user_id', user.id).gte('created_at', dateFilter.toISOString());
          toolData = data || [];
        }

        const formattedMessagesForTool = [
            { role: 'user', parts: [{ text: initialMessages[0].content }] },
            { role: 'model', parts: [{ functionCall: firstPart.functionCall }] },
            { role: 'user', parts: [{ functionResponse: { name: toolName, response: { content: toolData } } }] }
        ];

        const finalReplyParts = await generateMentorResponse(formattedMessagesForTool, unifiedSystemPrompt);
        finalAiText = finalReplyParts[0].text;
      } else {
        finalAiText = firstPart.text;
      }

      // 8. Delivery
      if (!finalAiText.includes('[SILENCE]')) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: user.telegram_user_id, text: finalAiText, parse_mode: 'Markdown' })
          });

          await supabase.from('mentor_chat_logs').insert([
            { user_id: user.id, role: 'model', content: finalAiText }
          ]);
          console.log(`Mentor check-in sent to ${user.username}`);
      }
    });

    await Promise.all(mentorPromises);
    return NextResponse.json({ message: `Successfully ran mentor checks.` }, { status: 200 });

  } catch (error: any) {
    console.error('Mentor Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
