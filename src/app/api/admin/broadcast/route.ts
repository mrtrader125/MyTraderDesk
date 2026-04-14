import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Default values
    let releaseType = 'automated';
    let customMessage = '';
    let customTag = 'Broadcast';

    // 1. Extract the payload sent from your Admin frontend
    try {
      const body = await req.json();
      if (body.type) releaseType = body.type;
      if (body.message) customMessage = body.message;
      if (body.tag) customTag = body.tag;
    } catch (e) {}

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
    
// 🚨 2. PROPER ROUTING LOGIC
    if (releaseType === 'custom') {
        // Catches the "Open Desk" and "Wrap Desk" buttons
        // Format: The "System" look (Separators and monospace tags we discussed)
        messageText = customMessage;
        
    } else if (releaseType === 'manual') {
        // Catches standard setup drops. 
        // Format: The "Highlight" look (Heavy use of blockquotes to draw the eye to the action)
        messageText = `⚡ **QUICK SETUP **\n\n• **A new setup has been routed to the desk.**\n• Execution parameters, invalidation zones, and targets are now active on the floor.`;
        
    } else {
        // Catches the automated Cron Job
        // Format: The "Dossier" look (Clean bullet points and italicized footnotes for easy reading)
        messageText = `🗓️ **DAILY ANALYSIS: LIVE**\n\nToday's market mapping and directional bias are now available.\n\n▪️ **Status:** Monitoring institutional flow\n▪️ **Access:** Live Terminal Dashboard\n\n_⚠️ Risk Advisory: Capital preservation is the primary objective. Keep stops tight and size responsibly._`;
    }

    const { data: settings } = await supabase.from('platform_settings').select('last_telegram_msg_id').eq('id', 1).single();
    const oldMessageId = settings?.last_telegram_msg_id;

    const dualKeyboard = {
      inline_keyboard: [
        [
          { text: "📱 Open Mini App", url: "https://t.me/sentinel_vortex_bot/My_Trader_Desk" },
          { text: "🌐 Visit Website", url: "https://mytraderdesk.com/markets" }
        ]
      ]
    };

    // 3. Fire to Telegram & Supabase simultaneously
    const [tgResponse, dbResult] = await Promise.all([
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          text: messageText,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          // Custom desk messages don't get the bulky app buttons, only official setups do
          reply_markup: releaseType === 'custom' ? undefined : dualKeyboard 
        }),
      }),
      supabase.from('live_squawk').insert({
        author_username: 'Sentinel Admin',
        message: messageText,
        source: 'telegram',
        tag: customTag
      })
    ]);

    const tgData = await tgResponse.json();
    if (!tgData.ok) throw new Error(tgData.description);

    // 4. Update the "Hopping Buttons" (Skipped for custom Open/Close desk messages)
    if (releaseType !== 'custom') {
        const newMessageId = tgData.result.message_id;
        await supabase.from('platform_settings').update({ last_telegram_msg_id: newMessageId }).eq('id', 1);
        
        if (oldMessageId) {
          await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: channelId, message_id: oldMessageId, reply_markup: { inline_keyboard: [] } }),
          });
        }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("🔥 Fatal Broadcast Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
