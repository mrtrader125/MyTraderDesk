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
    const botToken = process.env.TELEGRAM_SENTINEL_TOKEN
    const broadcastChannelId = process.env.TELEGRAM_BROADCAST_CHANNEL_ID

    if (!botToken || !broadcastChannelId) return NextResponse.json({ status: 'error' }, { status: 500 })

    // Helper to keep code clean when sending messages back to the user
    const sendMessage = async (chatId: number, text: string, parseMode?: string) => {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode })
      })
    }

    // ==========================================
    // ROUTE A: PRIVATE DMs (CONTEXT-AWARE VERIFICATION)
    // ==========================================
    const message = body.message
    if (message && message.chat.type === 'private') {
      const text = (message.text || '').trim()
      const chatId = message.chat.id
      const telegramUserId = message.from.id
      const telegramHandle = message.from.username || message.from.first_name || 'Unknown'

      // STEP 1: Check if the user's Telegram is already in the database
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username, plan')
        .eq('telegram_user_id', telegramUserId)
        .maybeSingle()

      // USER IS ALREADY CONNECTED
      if (existingProfile) {
        if (text === '/start') {
          await sendMessage(
            chatId,
            `Welcome back, *${existingProfile.username || 'Trader'}*.\n\nYour Telegram is already connected to the Sentinel Vortex terminal. Your current access level is: *${(existingProfile.plan || 'Free').toUpperCase()}*.`,
            'Markdown'
          )
        } else {
          await sendMessage(
            chatId,
            `System alert: Your Telegram is already securely connected to the terminal. You do not need to submit any further transmission codes.`
          )
        }
        return NextResponse.json({ status: 'success' })
      }

      // USER IS NOT CONNECTED YET
      if (text === '/start') {
        await sendMessage(
          chatId,
          `Welcome to Sentinel Command.\n\nYour Telegram is NOT connected to the terminal. Please enter the 6-digit transmission code from your mytraderdesk.com account settings.`
        )
        return NextResponse.json({ status: 'success' })
      }

      // IF THEY SUBMIT A CODE
      if (/^\d{6}$/.test(text)) {
        const { data: linkingUser } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('telegram_verification_code', text)
          .maybeSingle()

        if (linkingUser) {
          // Lock Telegram ID to user and clear the code
          await supabase.from('profiles').update({ 
            telegram_user_id: telegramUserId, 
            telegram_verification_code: null, 
            telegram_handle: telegramHandle 
          }).eq('id', linkingUser.id)

          // Generate Single-Use Link
          const linkRes = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: broadcastChannelId,
              member_limit: 1, 
              name: `Access: ${linkingUser.username}`
            })
          })
          
          const linkData = await linkRes.json()

          if (linkData.ok) {
            await sendMessage(
              chatId,
              `✅ **Identity Verified.**\nWelcome to Sentinel Command, *${linkingUser.username}*.\n\nHere is your single-use access link to the Live Broadcast Channel. Do not share this link; it will expire immediately after one use:\n\n${linkData.result.invite_link}`,
              'Markdown'
            )
          } else {
             await sendMessage(
               chatId, 
               `✅ Linked to *${linkingUser.username}*! However, I lack admin rights to generate your invite link. Contact support.`,
               'Markdown'
             )
          }
        } else {
          await sendMessage(chatId, `❌ Invalid or expired transmission code.`)
        }
      } else {
        // If they type something that isn't /start or a 6 digit code
        await sendMessage(chatId, `Please enter a valid 6-digit transmission code, or type /start to restart.`)
      }
      
      return NextResponse.json({ status: 'success' })
    }

    // ==========================================
    // ROUTE B: CHANNEL POSTS (MIRROR TO WEB)
    // ==========================================
    const channelPost = body.channel_post || body.edited_channel_post
    if (channelPost && channelPost.chat.id.toString() === broadcastChannelId) {
      const messageId = channelPost.message_id
      const rawText = channelPost.text || channelPost.caption || ''
      const text = rawText.trim()
      let finalMediaUrl = null

      if (channelPost.photo && channelPost.photo.length > 0) {
        const fileId = channelPost.photo[channelPost.photo.length - 1].file_id
        const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`)
        const fileData = await fileRes.json()

        if (fileData.ok) {
          const imgRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`)
          const imgBlob = await imgRes.blob()
          const fileName = `telegram/${Date.now()}-${fileId}.jpg`
          
          const { error: uploadError } = await supabase.storage
            .from('analysis-images')
            .upload(fileName, imgBlob, { contentType: 'image/jpeg' })

          if (!uploadError) {
            const { data } = supabase.storage.from('analysis-images').getPublicUrl(fileName)
            finalMediaUrl = data.publicUrl
          }
        }
      }

      if (!text && !finalMediaUrl) return NextResponse.json({ status: 'success' })

      await supabase.from('live_squawk').insert({
        author_username: 'Sentinel Admin', 
        message: text || '', 
        media_url: finalMediaUrl, 
        source: 'telegram',
        telegram_message_id: messageId,
        tag: 'Broadcast'
      })
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Sentinel Webhook Error:', error)
    return NextResponse.json({ status: 'fatal_error' }, { status: 500 })
  }
}
