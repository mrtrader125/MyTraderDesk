import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // 1. Read the incoming payload to see who triggered this
    let releaseType = 'automated'; // Default to automated
    try {
      const body = await req.json();
      if (body.type) releaseType = body.type;
    } catch (e) {
      // If no body is sent, it safely falls back to automated
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

    // 2. Decide which message to send based on the trigger
    let messageText = '';

    if (releaseType === 'manual') {
      // The Urgent Manual Drop
      messageText = `⚡ **Quick Setup Released!**\n\nA new setup has just been dropped on the Live Floor.`;
    } else {
      // The Daily Scheduled Drop
      messageText = `🟢 **Today's analysis is live.**\n\n🖥️ Check the website/app for full details.\n\n⚡ Watch the live floor terminal for real-time execution and updates.\n\n⚠️ _Risk Advisory : Risk management is not optional. Keep your stops tight and size your positions responsibly._`;
    }

    // 3. Send to Telegram WITH Mini App Button
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: messageText,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [
              { 
                text: "⚡ Open Terminal", 
                web_app: { url: "https://mytraderdesk.com/miniapp" } 
              }
            ]
          ]
        }
      }),
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.description);

    // 4. 🚨 MIRROR TO DATABASE
    // This guarantees the Live Floor updates instantly alongside Telegram
    const { error: dbError } = await supabase.from('live_squawk').insert({
      author_username: 'Sentinel Admin',
      message: messageText,
      source: 'system_broadcast',
      tag: 'Broadcast',
      telegram_message_id: data.result.message_id
    });

    if (dbError) {
       console.error("❌ Failed to mirror broadcast to Supabase:", dbError);
    } else {
       console.log("✅ Broadcast mirrored to live_squawk database.");
    }

    return NextResponse.json({ success: true, messageId: data.result.message_id });

  } catch (error: any) {
    console.error("🔥 Fatal Broadcast Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
