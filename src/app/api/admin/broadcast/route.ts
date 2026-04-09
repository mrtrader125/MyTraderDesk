import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
  try {
    const botToken = process.env.TELEGRAM_SENTINEL_TOKEN;
    const channelId = process.env.TELEGRAM_BROADCAST_CHANNEL_ID;

    if (!botToken || !channelId) {
      console.error("❌ TELEGRAM BROADCAST ERROR: Missing Environment Variables");
      return NextResponse.json({ error: "Telegram credentials missing." }, { status: 500 });
    }

    // Your exact formatted message
    const messageText = `🟢 **Today's analysis is live.**

🖥️ Check the website/app for full details.

⚡ Watch the live floor terminal for real-time execution and updates.

⚠️ _Risk Advisory : Risk management is not optional. Keep your stops tight and size your positions responsibly._`;

    // Send the message to the broadcast channel
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

    if (!data.ok) {
      console.error("❌ Telegram API Error:", data);
      return NextResponse.json({ error: data.description }, { status: 400 });
    }

    return NextResponse.json({ success: true, messageId: data.result.message_id });

  } catch (error: any) {
    console.error("🔥 Fatal Broadcast Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
