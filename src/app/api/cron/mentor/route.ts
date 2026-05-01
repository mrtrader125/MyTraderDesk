import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDailyTraderContext } from '@/ai/services/contextBuilder';
import { safeGenerateMentorDecision } from '@/ai/safeGenerate';

export const runtime = 'edge';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const botToken = process.env.TELEGRAM_SENTINEL_TOKEN!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Fetch users + their specific Operator Contract
    // We join the profiles (for timezone) and the modules (for rules)
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id, username, telegram_user_id, timezone, plan,
        user_trading_modules!inner (
            status, current_day_state, daily_prep_time, shift_start, shift_end, max_daily_trades
        )
      `)
      .not('telegram_user_id', 'is', null)
      .eq('user_trading_modules.status', 'ACTIVE');

    if (error || !users || users.length === 0) {
      return NextResponse.json({ message: 'No active protocols to monitor.' }, { status: 200 });
    }

    const mentorPromises = users.map(async (user: any) => {
      const module = user.user_trading_modules[0];
      
      // --- TIMEZONE MATH ---
      // Convert UTC server time to the user's specific local time
      const userTimezone = user.timezone || 'UTC';
      const nowUserLocal = new Date(new Date().toLocaleString('en-US', { timeZone: userTimezone }));
      const userHour = nowUserLocal.getHours();
      const userMinute = nowUserLocal.getMinutes();
      
      // Convert "07:00:00" string to hour/min integers for comparison
      const [prepTargetHour, prepTargetMin] = (module.daily_prep_time || '07:00').split(':').map(Number);
      const [shiftStartHour, shiftStartMin] = (module.shift_start || '08:00').split(':').map(Number);
      const [shiftEndHour, shiftEndMin] = (module.shift_end || '12:00').split(':').map(Number);

      const isPastPrepDeadline = (userHour > prepTargetHour) || (userHour === prepTargetHour && userMinute >= prepTargetMin);
      
      const currentMins = userHour * 60 + userMinute;
      const shiftStartMins = shiftStartHour * 60 + shiftStartMin;
      const shiftEndMins = shiftEndHour * 60 + shiftEndMin;
      const isInsideActiveShift = currentMins >= shiftStartMins && currentMins <= shiftEndMins;

      // --- TRIGGER 1: THE MISSED PREP CHECK ---
      if (isPastPrepDeadline && module.current_day_state === 'AWAITING_PREP') {
          const warningPrompt = `[OPERATOR CONTEXT]\nThe user has missed their designated local prep time of ${module.daily_prep_time}. Their terminal shows they have not marked their prep as done. Issue a direct, cold warning. Tell them protocol is breached and they must complete their prep immediately.`;
          
          await triggerAI(user, warningPrompt, supabase, botToken);
          
          // Mark them as warned so we don't spam them every 5 minutes all day
          await supabase.from('user_trading_modules').update({ current_day_state: 'PREP_MISSED_WARNED' }).eq('user_id', user.id);
          return;
      }

      // --- THE GOLDEN SILENCE CHECK ---
      // If they are in their shift, we completely abort any further checks to prevent distraction.
      if (isInsideActiveShift) return;

      // --- TRIGGER 2: THE TRADE EXECUTION CHECK (Your original logic) ---
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60000).toISOString();
      const { data: recentLogs } = await supabase
        .from('user_desk_logs')
        .select('execution_type')
        .eq('user_id', user.id)
        .gte('created_at', fifteenMinutesAgo);

      if (!recentLogs || recentLogs.length === 0) return;

      const { userProfile, liveContext, stats } = await getDailyTraderContext(supabase, user.id);
      const recentImperfect = recentLogs.filter(l => l.execution_type === 'Imperfect').length;
      let proactiveContext = "";

      if (recentImperfect > 0) {
         proactiveContext = `[OPERATOR CONTEXT]\n${liveContext}\nThe user JUST logged an 'Imperfect' execution. Acknowledge the deviation, ask what psychological trigger caused it, and shut down their session.`;
      } else if (stats.tradesTaken >= module.max_daily_trades && stats.imperfectCount === 0) {
         proactiveContext = `[OPERATOR CONTEXT]\n${liveContext}\nThe user JUST finished their trades for the day. Daily limits reached perfectly. Acknowledge discipline and order them to close the charts.`;
      } else {
         return; 
      }

      await triggerAI(user, proactiveContext, supabase, botToken);
    });

    await Promise.all(mentorPromises);
    return NextResponse.json({ message: `Heartbeat sweep complete.` }, { status: 200 });

  } catch (error: any) {
    console.error('Heartbeat Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to keep the route clean
async function triggerAI(user: any, prompt: string, supabase: any, botToken: string) {
    // We use safeGenerateMentorDecision so it goes through your strict CRO firewall
    const decision = await safeGenerateMentorDecision({ prompt, user });
    
    if (decision && decision.type === 'message' && decision.content !== '[SILENCE]') {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: user.telegram_user_id, text: decision.content, parse_mode: 'Markdown' })
        });

        await supabase.from('mentor_chat_logs').insert([
            { user_id: user.id, role: 'model', content: decision.content }
        ]);
    }
}
