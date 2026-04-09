import { NextResponse } from 'next/server';

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

    if (!botToken || !channelId) {
      console.error("❌ TELEGRAM BROADCAST ERROR: Missing Environment Variables");
      return NextResponse.json({ error: "Telegram credentials missing." }, { status: 500 });
    }

    // 2. Decide which message to send based on the trigger
    let messageText = '';

    if (releaseType === 'manual') {
      // The Urgent Manual Drop
      messageText = `⚡ **Quick Setup Released!**\n\nA new setup has just been dropped on the Live Floor.\n\n🖥️ [Open Terminal to view](https://mytraderdesk.com/markets)`;
    } else {
      // The Daily Scheduled Drop
      messageText = `🟢 **Today's analysis is live.**\n\n🖥️ Check the website/app for full details.\n\n⚡ Watch the live floor terminal for real-time execution and updates.\n\n⚠️ _Risk Advisory : Risk management is not optional. Keep your stops tight and size your positions responsibly._`;
    }

    // 3. Send to Telegram
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

    return NextResponse.json({ success: true, messageId: data.result.message_id });

  } catch (error: any) {
    console.error("🔥 Fatal Broadcast Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
