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

    if (releaseType === 'manual') {
      messageText = `⚡ **Quick Setup Released!**\n\nA new setup has just been dropped on the Live Floor.\n\n🖥️ [Open Terminal to view](https://mytraderdesk.com/markets)`;
    } else {
      messageText = `🟢 **Today's analysis is live.**\n\n🖥️ [Check the website/app for full details.](https://mytraderdesk.com/markets)\n\n⚡ Watch the live floor terminal for real-time execution and updates.\n\n⚠️ _Risk Advisory : Risk management is not optional. Keep your stops tight and size your positions responsibly._`;
    }

    // 🚨 REVERTED: Standard message payload without the crashing web_app button
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: messageText,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      }),
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.description);

    const { error: dbError } = await supabase.from('live_squawk').insert({
      author_username: 'Sentinel Admin',
      message: messageText,
      source: 'system_broadcast',
      tag: 'Broadcast',
      telegram_message_id: data.result.message_id
    });

    if (dbError) console.error("❌ Failed to mirror broadcast to Supabase:", dbError);

    return NextResponse.json({ success: true, messageId: data.result.message_id });

  } catch (error: any) {
    console.error("🔥 Fatal Broadcast Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
