import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildSystemPrompt } from '@/ai/core/systemPrompt';

// Use Edge runtime for fast cron execution
export const runtime = 'edge';

export async function GET(request: Request) {
  // 1. Cron Security Check (Matches your existing setup)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Mentor Cron Error: Unauthorized access attempt.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const botToken = process.env.TELEGRAM_SENTINEL_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !botToken || !geminiKey) {
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
      
      // A. Fetch the user's active setups for today
      const { data: setups } = await supabase
        .from('user_desk_setups')
        .select('symbol, direction, is_today')
        .eq('user_id', user.id)
        .eq('is_today', true);

      // B. Fetch the user's logs (trades executed) for today
      // Calculating the start of the current day in UTC for safe fetching
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const { data: logs } = await supabase
        .from('user_desk_logs')
        .select('symbol, execution_type, outcome')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString());

      // C. Build the Context String for Gemini
      // This tells the AI exactly what the user is doing right now
      const activePairs = setups?.map(s => s.symbol).join(', ') || '0 pairs';
      const tradesTaken = logs?.length || 0;
      const perfectExecutions = logs?.filter(l => l.execution_type === 'Perfect').length || 0;
      const imperfectExecutions = logs?.filter(l => l.execution_type === 'Imperfect').length || 0;

      const currentContext = `
        Right now, this user has pushed the following pairs to their Daily Sniper focus: ${activePairs}.
        So far today, they have taken ${tradesTaken} trades (${perfectExecutions} Perfect, ${imperfectExecutions} Imperfect).
        Write a very brief (1-2 sentences) check-in message based on this current data.
      `;

      // D. Call Gemini (The Mentor Brain)
      // Note: We pass a mock userProfile here, but you can expand your profiles table to store this later.
      const systemPrompt = buildSystemPrompt({
        assetFocus: "Adaptive",
        executionStyle: "Intraday",
        loggingPreference: "Minimalist"
      });

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: { text: systemPrompt } },
          contents: [{ role: 'user', parts: [{ text: currentContext }] }],
          generationConfig: { temperature: 0.4 }
        })
      });

      const geminiData = await geminiResponse.json();
      if (!geminiData.candidates) return; // Skip if AI fails
      
      const mentorMessage = geminiData.candidates[0].content.parts[0].text;

      // E. Send the message directly to the user's Telegram DM
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegram_user_id,
          text: mentorMessage,
          parse_mode: 'Markdown'
        })
      });

      console.log(`Mentor message sent to ${user.username}`);
    });

    // Execute all mentorship checks in parallel
    await Promise.all(mentorPromises);

    return NextResponse.json({ message: `Successfully ran mentor checks for ${users.length} users.` }, { status: 200 });

  } catch (error: any) {
    console.error('Mentor Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}