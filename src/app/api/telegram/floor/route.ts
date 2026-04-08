import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const botToken = process.env.TELEGRAM_FLOOR_TOKEN
    const adminId = process.env.ADMIN_TELEGRAM_ID

    if (!botToken || !adminId) return NextResponse.json({ status: 'error' }, { status: 500 })

    // ==========================================
    // 1. HANDLE INCOMING ADMIN MESSAGES
    // ==========================================
    const message = body.message
    if (message && message.chat.type === 'private') {
      if (message.from.id.toString() !== adminId) {
        // Ignore anyone who isn't you
        return NextResponse.json({ status: 'success' })
      }

      const text = message.text || message.caption || ''
      const hasPhoto = message.photo && message.photo.length > 0

      if (!text && !hasPhoto) return NextResponse.json({ status: 'success' })

      // Reply with confirmation keyboard
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chat.id,
          reply_to_message_id: message.message_id,
          text: `⚡ **Floor Deployment Detected**\nDo you want to broadcast this to the Live Floor?`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: "✅ Confirm Deploy", callback_data: "deploy_yes" },
              { text: "❌ Cancel", callback_data: "deploy_no" }
            ]]
          }
        })
      })
      return NextResponse.json({ status: 'success' })
    }

    // ==========================================
    // 2. HANDLE CONFIRMATION CLICKS
    // ==========================================
    const callbackQuery = body.callback_query
    if (callbackQuery) {
      if (callbackQuery.from.id.toString() !== adminId) return NextResponse.json({ status: 'success' })

      const chatId = callbackQuery.message.chat.id
      const messageId = callbackQuery.message.message_id
      const originalMessage = callbackQuery.message.reply_to_message // The message you originally sent

      if (callbackQuery.data === 'deploy_no') {
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: "❌ Deployment Canceled." })
        })
        return NextResponse.json({ status: 'success' })
      }

      if (callbackQuery.data === 'deploy_yes' && originalMessage) {
        // Edit button to "Loading..." immediately
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: "⏳ Processing Deployment..." })
        })

        const text = originalMessage.text || originalMessage.caption || ''
        let finalMediaUrl = null

        // Handle Image if you attached one
        if (originalMessage.photo && originalMessage.photo.length > 0) {
          const fileId = originalMessage.photo[originalMessage.photo.length - 1].file_id
          const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`)
          const fileData = await fileRes.json()

          if (fileData.ok) {
            const imgRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`)
            const imgBlob = await imgRes.blob()
            const fileName = `floor/${Date.now()}-${fileId}.jpg`
            
            const { error: uploadError } = await supabase.storage
              .from('analysis-images')
              .upload(fileName, imgBlob, { contentType: 'image/jpeg' })

            if (!uploadError) {
              const { data } = supabase.storage.from('analysis-images').getPublicUrl(fileName)
              finalMediaUrl = data.publicUrl
            }
          }
        }

        // Deploy to Live Floor
        await supabase.from('terminal_posts').insert({
          ticker: 'UPDATE',
          timeframe: 'LIVE',
          thesis: text,
          image_url: finalMediaUrl,
          tier_access: 'essential'
        })

        // Update message to Success
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: "✅ **Successfully deployed to Live Floor.**", parse_mode: 'Markdown' })
        })
      }
      
      // Tell Telegram the button was processed
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQuery.id })
      })
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Floor Bot Webhook Error:', error)
    return NextResponse.json({ status: 'fatal_error' }, { status: 500 })
  }
}