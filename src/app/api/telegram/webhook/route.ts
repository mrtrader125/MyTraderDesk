import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("=== 1. INCOMING TELEGRAM PAYLOAD ===")
    console.log(JSON.stringify(body))

    const message = body.message || body.edited_message
    if (!message) {
      console.log("❌ NO MESSAGE FOUND. EXITING.")
      return NextResponse.json({ status: 'success' })
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const adminId = process.env.ADMIN_TELEGRAM_ID
    
    console.log(`=== 2. ENVIRONMENT CHECK ===`)
    console.log(`Bot Token Exists? ${!!botToken}`)
    console.log(`Admin ID Exists? ${!!adminId}`)
    console.log(`Supabase URL Exists? ${!!process.env.NEXT_PUBLIC_SUPABASE_URL}`)

    const chatId = message.chat.id
    const telegramUserId = message.from.id
    const text = (message.text || message.caption || '').trim()
    
    console.log(`=== 3. MESSAGE DETAILS ===`)
    console.log(`From User ID: ${telegramUserId}`)
    console.log(`Message Text: "${text}"`)

    const sendMessage = async (msgText: string) => {
      console.log(`🚀 ATTEMPTING TO SEND MESSAGE: "${msgText}"`)
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msgText, parse_mode: 'Markdown' })
      })
      console.log(`📬 TELEGRAM RESPONSE STATUS: ${res.status}`)
    }

    // Is it the Admin?
    if (telegramUserId.toString() === adminId) {
      console.log("👑 ADMIN DETECTED! Routing to Live Floor logic...")
      // If the admin sends a 6 digit code, let's force it to act like a normal user just for testing
      if (/^\d{6}$/.test(text)) {
         console.log("⚠️ Admin sent an OTP code. Bypassing floor logic to test OTP linker.")
      } else {
         await sendMessage('✅ *Deployed directly to the Live Floor.*')
         return NextResponse.json({ status: 'success' })
      }
    }

    // Normal User OTP Logic
    console.log("👤 RUNNING NORMAL USER LOGIC...")
    if (message.chat.type === 'private') {
      if (/^\d{6}$/.test(text)) {
        console.log(`🔍 SEARCHING SUPABASE FOR OTP: ${text}`)
        
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
        const { data: linkingUser, error } = await supabase.from('profiles').select('id, username').eq('telegram_verification_code', text).maybeSingle()
        
        if (error) console.log("❌ SUPABASE ERROR:", error)

        if (linkingUser) {
          console.log(`✅ MATCH FOUND IN DATABASE: ${linkingUser.username}`)
          await supabase.from('profiles').update({ telegram_user_id: telegramUserId, telegram_verification_code: null }).eq('id', linkingUser.id)
          await sendMessage(`✅ **Identity Verified.** Welcome, *${linkingUser.username}*!`)
        } else {
          console.log("❌ NO MATCH FOUND FOR OTP IN DATABASE.")
          await sendMessage(`❌ Invalid or expired transmission code.`)
        }
      } else {
        console.log("ℹ️ MESSAGE WAS NOT A 6-DIGIT CODE.")
      }
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('🔥 FATAL WEBHOOK ERROR:', error)
    return NextResponse.json({ status: 'fatal_error' }, { status: 500 })
  }
}
