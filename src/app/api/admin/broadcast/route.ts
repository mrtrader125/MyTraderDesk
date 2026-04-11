import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    let releaseType = 'automated'; 
    try {
      const body = await req.json();
      if (body.type) releaseType = body.type;
    } catch (e) {
      // Safe fallback
    }

    const botToken = process.env.TELEGRAM_SENTINEL_TOKEN;
    const channelId = process.env.TELEGRAM_BROADCAST_CHANNEL_ID;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!botToken || !channelId || !supabaseUrl || !supabaseKey) {
      console.error("❌ TELEGRAM BROADCAST ERROR: Missing Environment Variables");
      return NextResponse.json({ error: "Credentials missing." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let messageText = '';

    // Cleaned up text since buttons handle the links now
    if (releaseType === 'manual') {
      messageText = `⚡ **Quick Setup Released!**\n\nA new setup has just been dropped on the Live Floor.`;
    } else {
      messageText = `🟢 **Today's analysis is live.**\n\n⚡ Watch the live floor terminal for real-time execution and updates.\n\n⚠️ _Risk Advisory : Risk management is not optional. Keep your stops tight and size your positions responsibly._`;
    }

    // 1. Fetch the ID of the LAST message we sent so we can remove its buttons
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('last_telegram_msg_id')
      .eq('id', 1)
      .single();
    
    const oldMessageId = settings?.last_telegram_msg_id;

    // 2. Define the Keyboard with TWO buttons (Mini App & Website)
    const dualKeyboard = {
      inline_keyboard: [
        [
          { text: "📱 Open Mini App", web_app: { url: "https://mytraderdesk.com/markets" } },
          { text: "🌐 Visit Website", url: "https://mytraderdesk.com/markets" }
        ]
      ]
    };

    // 3. INSTANT DUAL BROADCAST (Parallel Execution)
    const [tgResponse, dbResult] = await Promise.all([
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          text: messageText,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          reply_markup: dualKeyboard // Attach both buttons here!
        }),
      }),
      supabase.from('live_squawk').insert({
        author_username: 'Sentinel Admin',
        message: messageText,
        source: 'telegram', // Using 'telegram' for consistency with mirror
        tag: 'Broadcast'
      })
    ]);

    const tgData = await tgResponse.json();
    if (dbResult.error) console.error("❌ Failed to mirror broadcast to Supabase:", dbResult.error);
    if (!tgData.ok) throw new Error(tgData.description);

    // 4. THE HOPPING LOGIC
    const newMessageId = tgData.result.message_id;

    // Save the NEW message ID to Supabase in the background
    supabase.from('platform_settings').update({ last_telegram_msg_id: newMessageId }).eq('id', 1).then();

    // REMOVE the buttons from the OLD message in the background
    if (oldMessageId) {
      fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          message_id: oldMessageId,
          reply_markup: { inline_keyboard: [] } // Empty array instantly deletes the buttons
        }),
      }).catch(err => console.error("Failed to remove old buttons:", err));
    }

    return NextResponse.json({ success: true, messageId: newMessageId });

  } catch (error: any) {
    console.error("🔥 Fatal Broadcast Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
