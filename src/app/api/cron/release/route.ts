import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. Cron Security Check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Cron Error: Unauthorized access attempt.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Initialize Supabase with SERVICE_ROLE (Bypasses RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Cron Error: Missing Supabase Env Variables.');
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 3. Fetch Target Time AND the Last Message ID from Supabase Settings
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('global_release_time, last_telegram_msg_id')
      .eq('id', 1)
      .single();

    if (settingsError || !settings?.global_release_time) {
      console.log('Cron: No target time configured in database.');
      return NextResponse.json({ message: 'No target time configured.' }, { status: 200 });
    }

    const targetTimeStr = settings.global_release_time;
    const oldMessageId = settings.last_telegram_msg_id; // For the hopping logic

    // 4. Get Current Time in IST (Asia/Kolkata)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata', 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const currentTimeStr = formatter.format(now); 

    const getMinutes = (timeString: string) => {
      const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/i);
      if (!match) return -1;
      
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();

      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const targetMins = getMinutes(targetTimeStr);
    const currentMins = getMinutes(currentTimeStr);

    console.log(`Cron Check -> Target: ${targetTimeStr} (${targetMins}m) | Current IST: ${currentTimeStr} (${currentMins}m)`);

    if (targetMins === -1 || currentMins === -1) {
       console.error('Cron Error: Failed to parse time strings.');
       return NextResponse.json({ error: 'Time parsing failed' }, { status: 500 });
    }

    // 5. SAFETY WINDOW LOGIC
    if (currentMins >= targetMins && currentMins < targetMins + 6) {
      console.log('Cron: Time matched! Executing Dark Pool drop...');
      
      const { data: queuedItems, error: fetchError } = await supabase.from('queued_analyses').select('*');
      if (fetchError) throw fetchError;
      
      if (!queuedItems || queuedItems.length === 0) {
        console.log('Cron: Queue is empty. Nothing to deploy.');
        return NextResponse.json({ message: 'Queue is empty.' }, { status: 200 });
      }

      // Format for Live Table
      const liveItems = queuedItems.map(item => ({
        asset_symbol: item.asset_symbol,
        category: item.category,
        timeframe: item.timeframe,
        bias: item.bias,
        title: item.title,
        content: item.content,
        tier_access: item.tier_access,
        is_featured: item.is_featured,
        image_url: item.image_url,
        status: 'ACTIVE' 
      }));

      const idsArray = queuedItems.map(item => item.id);

      console.log('Cron: Archiving old setups...');
      for (const item of liveItems) {
        await supabase
          .from('analyses')
          .update({ status: 'ARCHIVED' })
          .eq('asset_symbol', item.asset_symbol)
          .eq('timeframe', item.timeframe)
          .in('status', ['WAITING', 'ACTIVE']);
      }

      console.log('Cron: Inserting new setups...');
      const { error: insertError } = await supabase.from('analyses').insert(liveItems);
      if (insertError) throw insertError;

      console.log('Cron: Deleting from staging queue...');
      const { error: deleteError } = await supabase.from('queued_analyses').delete().in('id', idsArray);
      if (deleteError) throw deleteError;

      // ==========================================
      // ⚡ INSTANT DUAL BROADCAST WITH HOPPING BUTTON
      // ==========================================
      try {
        const botToken = process.env.TELEGRAM_SENTINEL_TOKEN;
        const channelId = process.env.TELEGRAM_BROADCAST_CHANNEL_ID;

        if (botToken && channelId) {
          const messageText = `🟢 **Today's analysis is live.**\n\n⚡ Watch the live floor terminal for real-time execution and updates.\n\n⚠️ _Risk Advisory : Risk management is not optional. Keep your stops tight and size your positions responsibly._`;

          // Define the Keyboard with TWO buttons (Mini App & Website)
          const dualKeyboard = {
            inline_keyboard: [
              [
                { text: "📱 Open Mini App", url: "https://t.me/sentinel_vortex_bot/My_Trader_Desk" },
                { text: "🌐 Visit Website", url: "https://mytraderdesk.com/markets" }
              ]
            ]
          };

          // Fire both simultaneously to ensure "instant" updates
          const [tgResponse, dbResult] = await Promise.all([
            fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: channelId,
                text: messageText,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                reply_markup: dualKeyboard // Re-attached the buttons!
              }),
            }),
            supabase.from('live_squawk').insert({
              author_username: 'Sentinel Admin',
              message: messageText,
              source: 'telegram',
              tag: 'Broadcast'
            })
          ]);
          
          const tgData = await tgResponse.json();
          if (dbResult.error) console.error('Cron: Database Mirror Failed:', dbResult.error);

          // THE HOPPING LOGIC (🚨 EXPLICIT AWAITS TO PREVENT VERCEL SHUTDOWN)
          if (tgData.ok) {
            const newMessageId = tgData.result.message_id;

            // A. Explicitly wait for Supabase to save the new ID
            await supabase.from('platform_settings').update({ last_telegram_msg_id: newMessageId }).eq('id', 1);

            // B. Explicitly wait for Telegram to strip the old buttons
            if (oldMessageId) {
              await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: channelId,
                  message_id: oldMessageId,
                  reply_markup: { inline_keyboard: [] } 
                }),
              });
            }
          }

          console.log('Cron: Dual broadcast triggered successfully!');
        }
      } catch (broadcastError) {
        console.error('Cron: Failed to execute parallel broadcast:', broadcastError);
      }

      console.log(`Cron: SUCCESS! Dropped ${liveItems.length} setups.`);
      return NextResponse.json({ message: `Success! Deployed ${liveItems.length} setups to Live Floor.` }, { status: 200 });
    }

    console.log('Cron: Not time to deploy yet.');
    return NextResponse.json({ message: 'Not time to deploy yet.' }, { status: 200 });

  } catch (error: any) {
    console.error('Cron Deployment Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
