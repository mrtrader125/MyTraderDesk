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
    
    const botToken = process.env.TELEGRAM_SENTINEL_TOKEN
    const broadcastChannelId = process.env.TELEGRAM_BROADCAST_CHANNEL_ID
    const adminId = process.env.ADMIN_TELEGRAM_ID

    if (!botToken || !broadcastChannelId) {
       console.error("❌ MISSING CRITICAL ENVIRONMENT VARIABLES")
       return NextResponse.json({ status: 'error' }, { status: 500 })
    }

    // Helper to keep code clean and log outbound messages
    const sendMessage = async (chatId: number, text: string, parseMode?: string, replyMarkup?: any, replyToId?: number) => {
      const payload: any = { chat_id: chatId, text, parse_mode: parseMode }
      if (replyMarkup) payload.reply_markup = replyMarkup
      if (replyToId) payload.reply_to_message_id = replyToId

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }

    // ==========================================
    // ROUTE A: INLINE BUTTON CLICKS (CALLBACKS)
    // ==========================================
    if (body.callback_query) {
      const cb = body.callback_query
      const data = cb.data // e.g., 'deploy_123' or 'cancel_123'
      const chatId = cb.message.chat.id
      const messageId = cb.message.message_id

      // Immediately answer callback to stop the loading spinner on the user's button
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: cb.id })
      })

      if (data.startsWith('cancel_')) {
        const draftId = data.replace('cancel_', '')
        await supabase.from('queued_analyses').delete().eq('id', draftId)
        
        // Edit the message to show it was cancelled
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: '❌ *Update Cancelled.*', parse_mode: 'Markdown' })
        })
        return NextResponse.json({ status: 'success' })
      }

      if (data.startsWith('deploy_')) {
        const draftId = data.replace('deploy_', '')
        
        // 1. Fetch the draft securely
        const { data: draft } = await supabase.from('queued_analyses').select('*').eq('id', draftId).single()
        
        if (draft) {
          // 2. Deploy it to the MAIN LIVE FLOOR (Left Pane)
          await supabase.from('terminal_posts').insert({
            thesis: draft.content || '',
            ticker: 'UPDATE',
            timeframe: 'NOW',
            tier_access: 'pro',
            image_url: draft.image_url
          })

          // Fallback just in case you use the analyses table instead of terminal_posts
          await supabase.from('analyses').insert({
            content: draft.content || '',
            asset_symbol: 'UPDATE',
            timeframe: 'NOW',
            tier_access: 'pro',
            status: 'ACTIVE',
            image_url: draft.image_url
          }).catch(() => {})

          // 3. Delete the draft
          await supabase.from('queued_analyses').delete().eq('id', draftId)

          // 4. Update the Telegram message
          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: '✅ *Deployed to Main Live Floor.*', parse_mode: 'Markdown' })
          })
        }
        return NextResponse.json({ status: 'success' })
      }
    }

    // ==========================================
    // ROUTE B: CHANNEL POSTS (MIRROR TO RIGHT PANE)
    // ==========================================
    const channelPost = body.channel_post || body.edited_channel_post
    if (channelPost && channelPost.chat.id.toString() === broadcastChannelId) {
      console.log("📢 BROADCAST CHANNEL POST DETECTED. Mirroring to Web...")
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
          
          const { error: uploadError } = await supabase.storage.from('analysis-images').upload(fileName, imgBlob, { contentType: 'image/jpeg' })
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
      return NextResponse.json({ status: 'success' })
    }

    // ==========================================
    // ROUTE C: PRIVATE DMs (OTP & ADMIN REMOTE TO LEFT PANE)
    // ==========================================
    const message = body.message
    if (message && message.chat.type === 'private') {
      const text = (message.text || message.caption || '').trim()
      const chatId = message.chat.id
      const telegramUserId = message.from.id
      const telegramHandle = message.from.username || message.from.first_name || 'Unknown'

      // --- THE ADMIN REMOTE CONTROL (MAIN FLOOR) ---
      if (telegramUserId.toString() === adminId && !/^\d{6}$/.test(text) && text !== '/start') {
         console.log("👑 ADMIN COMMAND DETECTED. Processing Draft...")
         
         let finalMediaUrl = null

         if (message.photo && message.photo.length > 0) {
           console.log("📸 Image detected in Admin DM. Processing download...")
           const fileId = message.photo[message.photo.length - 1].file_id
           const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`)
           const fileData = await fileRes.json()

           if (fileData.ok) {
             const imgRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`)
             const imgBlob = await imgRes.blob()
             const fileName = `admin-floor/${Date.now()}-${fileId}.jpg`
             
             const { error: uploadError } = await supabase.storage.from('analysis-images').upload(fileName, imgBlob, { contentType: 'image/jpeg' })
             if (!uploadError) {
               const { data } = supabase.storage.from('analysis-images').getPublicUrl(fileName)
               finalMediaUrl = data.publicUrl
             }
           }
         }

         // Save securely in the staging queue to prevent it flashing on the live floor unconfirmed
         const { data: draftData, error: draftError } = await supabase.from('queued_analyses').insert({
           asset_symbol: 'UPDATE',
           timeframe: 'NOW',
           content: text || '',
           image_url: finalMediaUrl,
           category: 'FOREX',
           bias: 'NEUTRAL',
           tier_access: 'pro'
         }).select('id').single()

         if (draftData) {
            const inlineKeyboard = {
              inline_keyboard: [
                [
                  { text: "✅ Deploy to Main Floor", callback_data: `deploy_${draftData.id}` },
                  { text: "❌ Cancel", callback_data: `cancel_${draftData.id}` }
                ]
              ]
            }

            await sendMessage(
              chatId, 
              '⚠️ **Ready to deploy.**\n\nDo you want to push this desk update to the Main Live Floor?', 
              'Markdown', 
              inlineKeyboard, 
              message.message_id
            )
         } else {
            console.error("Draft Save Error:", draftError)
         }
         return NextResponse.json({ status: 'success' })
      }

      // --- NORMAL USER OTP LOGIC ---
      const { data: existingProfile } = await supabase.from('profiles').select('username, plan').eq('telegram_user_id', telegramUserId).maybeSingle()

      if (existingProfile) {
        if (text === '/start') {
          await sendMessage(chatId, `Welcome back, *${existingProfile.username || 'Trader'}*.\n\nYour Telegram is already connected to the Sentinel Vortex terminal. Your current access level is: *${(existingProfile.plan || 'Free').toUpperCase()}*.`, 'Markdown')
        } else {
          await sendMessage(chatId, `System alert: Your Telegram is already securely connected to the terminal. You do not need to submit any further transmission codes.`)
        }
        return NextResponse.json({ status: 'success' })
      }

      if (text === '/start') {
        await sendMessage(chatId, `Welcome to Sentinel Command.\n\nYour Telegram is NOT connected to the terminal. Please enter the 6-digit transmission code from your mytraderdesk.com account settings.`)
        return NextResponse.json({ status: 'success' })
      }

      if (/^\d{6}$/.test(text)) {
        const { data: linkingUser } = await supabase.from('profiles').select('id, username').eq('telegram_verification_code', text).maybeSingle()

        if (linkingUser) {
          await supabase.from('profiles').update({ telegram_user_id: telegramUserId, telegram_verification_code: null, telegram_handle: telegramHandle }).eq('id', linkingUser.id)

          const linkRes = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: broadcastChannelId, member_limit: 1, name: `Access: ${linkingUser.username}` })
          })
          const linkData = await linkRes.json()

          if (linkData.ok) {
            await sendMessage(chatId, `✅ **Identity Verified.**\nWelcome to Sentinel Command, *${linkingUser.username}*.\n\nHere is your single-use access link to the Live Broadcast Channel. Do not share this link; it will expire immediately after one use:\n\n${linkData.result.invite_link}`, 'Markdown')
          } else {
             await sendMessage(chatId, `✅ Linked to *${linkingUser.username}*! However, I lack admin rights to generate your invite link. Contact support.`, 'Markdown')
          }
        } else {
          await sendMessage(chatId, `❌ Invalid or expired transmission code.`)
        }
      } else {
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
