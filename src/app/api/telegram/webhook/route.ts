// src/app/api/telegram/webhook/route.ts
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
    const message = body.message || body.edited_message

    // If there is no message payload, exit cleanly
    if (!message) return NextResponse.json({ status: 'success' })

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const adminId = process.env.ADMIN_TELEGRAM_ID
    const broadcastChannelId = process.env.TELEGRAM_BROADCAST_ID

    const chatId = message.chat.id
    const telegramUserId = message.from.id
    const telegramHandle = message.from.username || message.from.first_name || 'Unknown'
    const chatType = message.chat.type
    const rawText = message.text || message.caption || ''
    const text = rawText.trim()

    // Helper to send messages back to the user
    const sendMessage = async (msgText: string) => {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msgText, parse_mode: 'Markdown' })
      })
    }

    // ==========================================
    // FEATURE 1: ADMIN REMOTE CONTROL (LIVE FLOOR)
    // ==========================================
    // If YOU send a message to the bot, it instantly posts to mytraderdesk.com/floor
    if (telegramUserId.toString() === adminId) {
      let finalMediaUrl = null

      if (message.photo && message.photo.length > 0) {
        const fileId = message.photo[message.photo.length - 1].file_id
        const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`)
        const fileData = await fileRes.json()

        if (fileData.ok) {
          const imgRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`)
          const imgBlob = await imgRes.blob()
          const fileName = `telegram/${Date.now()}-${fileId}.jpg`

          const { error: uploadError } = await supabase.storage.from('analysis-images').upload(fileName, imgBlob, { contentType: 'image/jpeg' })
          if (!uploadError) {
            const { data } = supabase.storage.from('analysis-images').getPublicUrl(fileName)
            finalMediaUrl = data.publicUrl
          }
        }
      }

      if (text || finalMediaUrl) {
        await supabase.from('live_squawk').insert({
          author_username: 'Sentinel Admin',
          message: text,
          media_url: finalMediaUrl,
          source: 'telegram',
          telegram_message_id: message.message_id
        })
        await sendMessage('✅ *Deployed directly to the Live Floor.*')
      }
      return NextResponse.json({ status: 'success' })
    }

    // ==========================================
    // FEATURE 2: USER OTP LINKING & GATEKEEPER
    // ==========================================
    // If a normal user DMs the bot, process their OTP code
    if (chatType === 'private') {
      if (text === '/start') {
        await sendMessage("Welcome to Sentinel Command.\n\nPlease enter the 6-digit transmission code from your mytraderdesk.com account settings.")
        return NextResponse.json({ status: 'success' })
      }

      if (/^\d{6}$/.test(text)) {
        const { data: linkingUser } = await supabase.from('profiles').select('id, username').eq('telegram_verification_code', text).maybeSingle()

        if (linkingUser) {
          // Link the user in the database
          await supabase.from('profiles').update({ telegram_user_id: telegramUserId, telegram_verification_code: null, telegram_handle: telegramHandle }).eq('id', linkingUser.id)

          // Generate Single-Use Invite Link to your Broadcast Channel
          const linkRes = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: broadcastChannelId, member_limit: 1, name: `Access: ${linkingUser.username}` })
          })
          const linkData = await linkRes.json()

          if (linkData.ok) {
            await sendMessage(`✅ **Identity Verified.**\nWelcome, *${linkingUser.username}*.\n\nHere is your single-use access link to the Broadcast Channel. Do not share it:\n\n${linkData.result.invite_link}`)
          } else {
            await sendMessage(`✅ Linked to *${linkingUser.username}*! However, I lack admin rights to generate your invite link. Ensure I am an Admin in the Broadcast Channel.`)
          }
        } else {
          await sendMessage(`❌ Invalid or expired transmission code.`)
        }
      } else {
        await sendMessage(`Please enter a valid 6-digit transmission code, or type /start.`)
      }
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Master Webhook Error:', error)
    return NextResponse.json({ status: 'fatal_error' }, { status: 500 })
  }
}
