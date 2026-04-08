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

    if (message) {
      const messageId = message.message_id
      const telegramUserId = message.from.id 
      const telegramHandle = message.from.username || message.from.first_name || 'Unknown'
      const chatId = message.chat.id
      const chatType = message.chat.type 
      
      // 1. EXTRACT TEXT OR CAPTION
      const rawText = message.text || message.caption || ''
      const text = rawText.trim()

      // 2. CHECK FOR OTP LOGIC FIRST
      if (/^\d{6}$/.test(text)) {
        // ... (Keep your exact existing OTP link logic here - I'm keeping it brief for space, 
        // but ensure your OTP logic remains identical to what you had working)
        const { data: linkingUser } = await supabase.from('profiles').select('id, username').eq('telegram_verification_code', text).maybeSingle()
        if (linkingUser) {
           await supabase.from('profiles').update({ telegram_user_id: telegramUserId, telegram_verification_code: null, telegram_handle: telegramHandle }).eq('id', linkingUser.id)
           await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `✅ Success! Linked to: *${linkingUser.username}*`, parse_mode: 'Markdown' }) })
        } else {
           await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `❌ Invalid code.` }) })
        }
        return NextResponse.json({ status: 'success' })
      }

      // Exit early for commands or DMs
      if (text.startsWith('/')) return NextResponse.json({ status: 'success' })
      if (chatType === 'private') return NextResponse.json({ status: 'success' })

      // ==========================================
      // 🚨 THE FIX: SECURE IMAGE TRANSFER SYSTEM
      // ==========================================
      let finalMediaUrl = null

      if (message.photo && message.photo.length > 0) {
        // Telegram sends multiple sizes. Grab the highest resolution (the last one).
        const highestResPhoto = message.photo[message.photo.length - 1]
        const fileId = highestResPhoto.file_id

        // 1. Ask Telegram for the file path
        const fileRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`)
        const fileData = await fileRes.json()

        if (fileData.ok) {
          const filePath = fileData.result.file_path
          const tgFileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`

          // 2. Download the image into server memory
          const imgRes = await fetch(tgFileUrl)
          const imgBlob = await imgRes.blob()

          // 3. Upload to your public Supabase Storage Bucket safely
          const fileName = `telegram/${Date.now()}-${fileId}.jpg`
          const { error: uploadError } = await supabase.storage
            .from('analysis-images')
            .upload(fileName, imgBlob, { contentType: 'image/jpeg' })

          if (!uploadError) {
            // 4. Get the safe public URL
            const { data: publicUrlData } = supabase.storage.from('analysis-images').getPublicUrl(fileName)
            finalMediaUrl = publicUrlData.publicUrl
          } else {
            console.error("Storage Upload Error:", uploadError)
          }
        }
      }

      // Ignore messages that are entirely blank (no text and no image)
      if (!text && !finalMediaUrl) return NextResponse.json({ status: 'success' })

      // ==========================================
      // SAVE TO LIVE SQUAWK
      // ==========================================
      const { data: profile } = await supabase.from('profiles').select('id, username, telegram_handle').eq('telegram_user_id', telegramUserId).maybeSingle()

      const authorUsername = profile?.username || telegramHandle
      const userId = profile?.id || null

      const { error } = await supabase.from('live_squawk').insert({
        user_id: userId,
        author_username: authorUsername,
        message: text || '', // Fallback to empty string if it's just an image
        media_url: finalMediaUrl, // 🚨 Saves the safe Supabase URL!
        source: 'telegram',
        telegram_message_id: messageId
      })

      if (error) console.error("Supabase Insert Error:", error)
    }

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('Fatal Webhook Error:', error)
    return NextResponse.json({ status: 'fatal_error' }, { status: 500 })
  }
}
