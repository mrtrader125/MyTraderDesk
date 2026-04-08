import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, record } = body

    // 🚨 CRITICAL CHECK: We ONLY want to forward messages that came from the Web!
    // If we forward Telegram messages back to Telegram, we create an infinite loop.
    if (type === 'INSERT' && record.source !== 'telegram') {
      
      // Format how the message will look in Telegram
      const text = `💬 *${record.author_username || 'Web User'}*:\n${record.message}`

      // Send it to Telegram
      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_GROUP_ID,
          text: text,
          parse_mode: 'Markdown'
        })
      })

      if (!response.ok) {
        console.error('Telegram API Error:', await response.text())
      }
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Outbound Webhook Error:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}