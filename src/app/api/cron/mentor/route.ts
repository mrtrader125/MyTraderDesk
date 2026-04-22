import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildSystemPrompt } from '@/ai/core/systemPrompt';
import { getDailyTraderContext } from '@/ai/services/contextBuilder';
import { generateMentorResponse } from '@/ai/services/geminiClient';

// Use Edge runtime for fast cron execution
export const runtime = 'edge';

export async function GET(request: Request) {
  // 1. Cron Security Check (Make sure your cronjobs.com header matches this!)
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
      
      // 🚨 THE 10-MINUTE SPAM FIX: Check if they logged a trade in the last 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60000).toISOString();
      const { data: recentLogs } = await supabase
        .from('user_desk_logs')
        .select('id, execution_type')
        .eq('user_id', user.id)
        .gte('created_at', fifteenMinutesAgo);

      // If they haven't logged a trade recently, the AI stays completely silent.
      if (!recentLogs || recentLogs.length === 0) {
         return; 
      }

      // 4. Fetch the full daily context using the centralized brain
      const { userProfile, liveContext, stats } = await getDailyTraderContext(supabase, user.id);

      // 5. Decide WHY we are reaching out based on the recent action
      const recentImperfect = recentLogs.filter(l => l.execution_type === 'Imperfect').length;
      let proactiveContext = "";

      if (recentImperfect > 0) {
         proactiveContext = `The user JUST logged an 'Imperfect' execution. As their mentor, proactively reach out. Acknowledge that the day didn't go strictly to plan, ask them what psychological trigger caused the deviation, and ensure they have stepped away from the desk to protect their capital.`;
      } else if (stats.tradesTaken >= 2 && stats.imperfectCount === 0) {
         proactiveContext = `The user JUST finished their trades for the day (Daily limits reached) and graded them all as 'Perfect' (following the plan). Proactively reach out to congratulate their discipline and tell them to close the charts for the day.`;
      } else {
         // They only took 1 perfect trade, let them keep hunting.
         return; 
      }

      // 6. Build the prompt
      const systemPrompt = buildSystemPrompt(userProfile);
      const unifiedSystemPrompt = `${systemPrompt}\n\n${liveContext}\n\nCRITICAL INSTRUCTION: ${proactiveContext}`;

      // 7. Generate & Send using the centralized client
      const mentorMessage = await generateMentorResponse([{ role: 'user', content: 'Initiate daily check-in.' }], unifiedSystemPrompt);

      // The Silence Interceptor
      if (!mentorMessage.includes('[SILENCE]')) {
          // A. Send the message directly to the user's Telegram DM
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: user.telegram_user_id, text: mentorMessage, parse_mode: 'Markdown' })
          });

          // B. Save this to the memory bank so the web widget remembers it
          await supabase.from('mentor_chat_logs').insert([
            { user_id: user.id, role: 'model', content: mentorMessage }
          ]);

          console.log(`Mentor check-in sent to ${user.username}`);
      }
    });

    // Execute all mentorship checks in parallel
    await Promise.all(mentorPromises);

    return NextResponse.json({ message: `Successfully ran mentor checks.` }, { status: 200 });

  } catch (error: any) {
    console.error('Mentor Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
