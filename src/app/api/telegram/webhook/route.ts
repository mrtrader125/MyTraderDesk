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
    console.log("=== 1. INCOMING TELEGRAM PAYLOAD ===")
    console.log(JSON.stringify(body))

    const botToken = process.env.TELEGRAM_SENTINEL_TOKEN
    const broadcastChannelId = process.env.TELEGRAM_BROADCAST_CHANNEL_ID
    const adminId = process.env.ADMIN_TELEGRAM_ID // Used for Live Floor Remote Control

    console.log(`=== 2. ENVIRONMENT CHECK ===`)
    console.log(`Bot Token Exists? ${!!botToken}`)
    console.log(`Broadcast ID Exists? ${!!broadcastChannelId}`)
    console.log(`Admin ID Exists? ${!!adminId}`)

    if (!botToken || !broadcastChannelId) {
       console.error("❌ MISSING CRITICAL ENVIRONMENT VARIABLES")
       return NextResponse.json({ status: 'error' }, { status: 500 })
    }

    // Helper to keep code clean and log outbound messages
    const sendMessage = async (chatId: number, text: string, parseMode?: string) => {
      console.log(`🚀 OUTBOUND MESSAGE TO ${chatId}: "${text.substring(0, 50)}..."`)
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode })
      })
    }

    // ==========================================
    // ROUTE A: CHANNEL POSTS (MIRROR TO WEB)
    // ==========================================
    const channelPost = body.channel_post || body.edited_channel_post
    if (channelPost && channelPost.chat.id.toString() === broadcastChannelId) {
      console.log("📢 BROADCAST CHANNEL POST DETECTED. Mirroring to Web...")
      const messageId = channelPost.message_id
      const rawText = channelPost.text || channelPost.caption || ''
      const text = rawText.trim()
      let finalMediaUrl = null

      if (channelPost.photo && channelPost.photo.length > 0) {
        console.log("📸 Image detected in broadcast. Processing download...")
        const fileId = channelPost.photo[channelPost.photo.length - 1].file_id
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
            console.log("✅ Image mirrored successfully to Supabase.")
          } else {
             console.error("❌ Supabase Image Upload Error:", uploadError)
          }
        }
      }

      if (!text && !finalMediaUrl) return NextResponse.json({ status: 'success' })

      const { error: dbError } = await supabase.from('live_squawk').insert({
        author_username: 'Sentinel Admin', 
        message: text || '', 
        media_url: finalMediaUrl, 
        source: 'telegram',
        telegram_message_id: messageId,
        tag: 'Broadcast'
      })
      if (dbError) console.error("❌ DB Insert Error:", dbError)
      else console.log("✅ Broadcast mirrored to live_squawk database.")
      
      return NextResponse.json({ status: 'success' })
    }

    // ==========================================
    // ROUTE B: PRIVATE DMs (OTP & ADMIN REMOTE)
    // ==========================================
    const message = body.message
    if (message && message.chat.type === 'private') {
      const text = (message.text || message.caption || '').trim()
      const chatId = message.chat.id
      const telegramUserId = message.from.id
      const telegramHandle = message.from.username || message.from.first_name || 'Unknown'

      console.log(`👤 PRIVATE DM RECEIVED from ${telegramHandle} (ID: ${telegramUserId}): "${text}"`)

      // --- THE ADMIN REMOTE CONTROL ---
      // If you are sending a message that is NOT a 6-digit code, post it to the Live Floor
      if (telegramUserId.toString() === adminId && !/^\d{6}$/.test(text) && text !== '/start') {
         console.log("👑 ADMIN COMMAND DETECTED. Pushing to Live Floor...")
         // Note: Add image parsing here later if you want to send images from your phone to the floor
         await supabase.from('live_squawk').insert({
           author_username: 'Sentinel Admin',
           message: text,
           source: 'telegram',
           telegram_message_id: message.message_id
         })
         await sendMessage(chatId, '✅ *Deployed directly to the Live Floor.*', 'Markdown')
         return NextResponse.json({ status: 'success' })
      }

      // --- NORMAL USER OTP LOGIC ---
      console.log("🔍 Checking if user is already connected in Supabase...")
      const { data: existingProfile, error: profileErr } = await supabase.from('profiles').select('username, plan').eq('telegram_user_id', telegramUserId).maybeSingle()
      if (profileErr) console.error("❌ Supabase Profile Fetch Error:", profileErr)

      if (existingProfile) {
        console.log(`✅ User already connected: ${existingProfile.username}`)
        if (text === '/start') {
          await sendMessage(chatId, `Welcome back, *${existingProfile.username || 'Trader'}*.\n\nYour Telegram is already connected to the Sentinel Vortex terminal. Your current access level is: *${(existingProfile.plan || 'Free').toUpperCase()}*.`, 'Markdown')
        } else {
          await sendMessage(chatId, `System alert: Your Telegram is already securely connected to the terminal. You do not need to submit any further transmission codes.`)
        }
        return NextResponse.json({ status: 'success' })
      }

      if (text === '/start') {
        console.log("🏁 User triggered /start")
        await sendMessage(chatId, `Welcome to Sentinel Command.\n\nYour Telegram is NOT connected to the terminal. Please enter the 6-digit transmission code from your mytraderdesk.com account settings.`)
        return NextResponse.json({ status: 'success' })
      }

      if (/^\d{6}$/.test(text)) {
        console.log(`🔑 Valid OTP format detected. Searching DB for code: ${text}...`)
        const { data: linkingUser, error: linkErr } = await supabase.from('profiles').select('id, username').eq('telegram_verification_code', text).maybeSingle()
        if (linkErr) console.error("❌ Supabase Link Search Error:", linkErr)

        if (linkingUser) {
          console.log(`✅ Code matched to user: ${linkingUser.username}. Locking profile...`)
          await supabase.from('profiles').update({ telegram_user_id: telegramUserId, telegram_verification_code: null, telegram_handle: telegramHandle }).eq('id', linkingUser.id)

          console.log("🔗 Generating Single-Use Invite Link...")
          const linkRes = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: broadcastChannelId, member_limit: 1, name: `Access: ${linkingUser.username}` })
          })
          const linkData = await linkRes.json()

          if (linkData.ok) {
            console.log("✅ Invite link generated successfully.")
            await sendMessage(chatId, `✅ **Identity Verified.**\nWelcome to Sentinel Command, *${linkingUser.username}*.\n\nHere is your single-use access link to the Live Broadcast Channel. Do not share this link; it will expire immediately after one use:\n\n${linkData.result.invite_link}`, 'Markdown')
          } else {
             console.error("❌ Failed to generate invite link:", linkData)
             await sendMessage(chatId, `✅ Linked to *${linkingUser.username}*! However, I lack admin rights to generate your invite link. Contact support.`, 'Markdown')
          }
        } else {
          console.log("❌ OTP code not found in database.")
          await sendMessage(chatId, `❌ Invalid or expired transmission code.`)
        }
      } else {
        console.log("ℹ️ Input was not an OTP or valid command.")
        await sendMessage(chatId, `Please enter a valid 6-digit transmission code, or type /start to restart.`)
      }
      return NextResponse.json({ status: 'success' })
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('🔥 FATAL SENTINEL WEBHOOK ERROR:', error)
    return NextResponse.json({ status: 'fatal_error' }, { status: 500 })
  }
}
