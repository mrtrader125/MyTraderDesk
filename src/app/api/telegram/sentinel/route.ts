import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildSystemPrompt } from '@/ai/core/systemPrompt'
import { getDailyTraderContext } from '@/ai/services/contextBuilder'
import { generateMentorResponse } from '@/ai/services/geminiClient'

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
    const adminId = process.env.ADMIN_TELEGRAM_ID

    if (!botToken || !broadcastChannelId) {
       console.error("❌ MISSING CRITICAL ENVIRONMENT VARIABLES")
       return NextResponse.json({ status: 'error' }, { status: 500 })
    }

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
      const data = cb.data 
      const chatId = cb.message.chat.id
      const messageId = cb.message.message_id

      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: cb.id })
      })

      if (data.startsWith('cancel_')) {
        const draftId = data.replace('cancel_', '')
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: '❌ *Update Cancelled.*', parse_mode: 'Markdown' })
        })
        await supabase.from('queued_analyses').delete().eq('id', draftId)
        return NextResponse.json({ status: 'success' })
      }

      if (data.startsWith('deploy_')) {
        const draftId = data.replace('deploy_', '')
        const { data: deletedDrafts } = await supabase.from('queued_analyses').delete().eq('id', draftId).select()
        
        if (deletedDrafts && deletedDrafts.length > 0) {
          const draft = deletedDrafts[0]
          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: '✅ *Deployed to Main Live Floor.*', parse_mode: 'Markdown' })
          })
          
          const { error: insertError } = await supabase.from('terminal_posts').insert({
            thesis: draft.content || '',
            ticker: 'UPDATE',
            timeframe: 'NOW',
            tier_access: 'pro',
            image_url: draft.image_url
          })
          if (insertError) console.error("Floor Insert Error:", insertError)
        }
        return NextResponse.json({ status: 'success' })
      }
    }

    // ==========================================
    // ROUTE B: CHANNEL POSTS (MIRROR TO RIGHT PANE)
    // ==========================================
    const channelPost = body.channel_post || body.edited_channel_post
    if (channelPost && channelPost.chat.id.toString() === broadcastChannelId) {
      const messageId = channelPost.message_id
      const rawText = channelPost.text || channelPost.caption || ''
      const text = rawText.trim()
      let finalMediaUrl = null

      if (text.includes("Today's analysis is live") || text.includes("Quick Setup Released!")) {
         return NextResponse.json({ status: 'success' })
      }

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

      const mirrorPayload: any = {
        author_username: 'Sentinel Admin', 
        message: text || '', 
        source: 'telegram',
        telegram_message_id: messageId,
        tag: 'Broadcast'
      }
      
      if (finalMediaUrl) mirrorPayload.image_url = finalMediaUrl;

      const { error: insertError } = await supabase.from('live_squawk').insert(mirrorPayload)
      if (insertError) console.error("Mirror Database Error:", insertError)

      return NextResponse.json({ status: 'success' })
    }

    // ==========================================
    // ROUTE C: PRIVATE DMs (OTP & AI MENTOR)
    // ==========================================
    const message = body.message
    if (message && message.chat.type === 'private') {
      const text = (message.text || message.caption || '').trim()
      const chatId = message.chat.id
      const telegramUserId = message.from.id
      const telegramHandle = message.from.username || message.from.first_name || 'Unknown'

      // --- THE ADMIN REMOTE CONTROL (MAIN FLOOR) ---
      if (telegramUserId.toString() === adminId && !/^\d{6}$/.test(text) && text !== '/start') {
         let finalMediaUrl = null

         if (message.photo && message.photo.length > 0) {
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

         const { data: draftData } = await supabase.from('queued_analyses').insert({
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

            await sendMessage(chatId, '⚠️ **Ready to deploy.**\n\nDo you want to push this desk update to the Main Live Floor?', 'Markdown', inlineKeyboard, message.message_id)
         }
         return NextResponse.json({ status: 'success' })
      }

      // --- NORMAL USER OTP LOGIC & MENTOR AI INTERCEPTION ---
      const { data: existingProfile } = await supabase.from('profiles').select('id, username, plan').eq('telegram_user_id', telegramUserId).maybeSingle()

      if (existingProfile) {
        if (text === '/start') {
           await sendMessage(chatId, `Welcome back, *${existingProfile.username || 'Trader'}*.\n\nYour Telegram is already connected to the Sentinel Vortex terminal.\nYour current access level is: *${(existingProfile.plan || 'Free').toUpperCase()}*.`, 'Markdown')
           return NextResponse.json({ status: 'success' })
        } 
        
        // ⚡ THE AI MENTOR TAKES OVER HERE ⚡
        try {
          // 1. Show a typing indicator to make it feel responsive
          await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, action: 'typing' })
          });

          // 2. Fetch recent chat history
          const { data: historyData } = await supabase
            .from('mentor_chat_logs')
            .select('role, content')
            .eq('user_id', existingProfile.id)
            .order('created_at', { ascending: false })
            .limit(10);

          const pastMessages = (historyData || []).reverse().map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.content
          }));

          // Append the current message
          pastMessages.push({ role: 'user', content: text });

          // 3. Fetch centralized reality context & build prompt
          const { userProfile, liveContext } = await getDailyTraderContext(supabase, existingProfile.id);
          const unifiedSystemPrompt = `${buildSystemPrompt(userProfile)}\n\n${liveContext}`;

          // 4. Generate Initial Response from AI
          const aiParts = await generateMentorResponse(pastMessages, unifiedSystemPrompt);
          const firstPart = aiParts[0];

          let finalAiText = "";

          // 5. THE INTERCEPTOR: Check if Telegram AI requested a Tool
          if (firstPart?.functionCall) {
            const toolName = firstPart.functionCall.name;
            const toolArgs = firstPart.functionCall.args;
            let toolData: any = {};
            
            if (toolName === 'get_daily_status') {
              toolData = { live_stats: liveContext };
            } else if (toolName === 'get_trade_autopsy') {
              const { data } = await supabase
                .from('user_desk_logs')
                .select('*, user_desk_setups(notes)')
                .eq('user_id', existingProfile.id)
                .ilike('symbol', `%${toolArgs.symbol}%`)
                .order('created_at', { ascending: false })
                .limit(1);
              toolData = data ? data[0] : { error: "No recent trades found for this asset." };
            } else if (toolName === 'get_discipline_and_leaks' || toolName === 'get_playbook_performance') {
              let dateFilter = new Date();
              if (toolArgs.timeframe === 'WEEK') dateFilter.setDate(dateFilter.getDate() - 7);
              else if (toolArgs.timeframe === 'MONTH') dateFilter.setDate(dateFilter.getDate() - 30);
              else dateFilter = new Date(0);
              
              const { data } = await supabase
                .from('user_desk_logs')
                .select('playbook, execution_type, outcome, rr, reason')
                .eq('user_id', existingProfile.id)
                .gte('created_at', dateFilter.toISOString());
              toolData = data || [];
            }

            // Map standard messages for the client format
            const formattedMessagesForTool = pastMessages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            // Handoff data back to AI
            formattedMessagesForTool.push({ role: 'model', parts: [{ functionCall: firstPart.functionCall }] });
            formattedMessagesForTool.push({ role: 'user', parts: [{ functionResponse: { name: toolName, response: { content: toolData } } }] });

            const finalReplyParts = await generateMentorResponse(formattedMessagesForTool, unifiedSystemPrompt);
            
            // 🚨 THE FIX: Optional chaining and fallback to empty string
            finalAiText = finalReplyParts[0]?.text || "";
            
          } else {
             // No tools requested, just standard text
             // 🚨 THE FIX: Optional chaining and fallback
             finalAiText = firstPart?.text || "";
          }

          // 6. The Silence Interceptor & Delivery
          // 🚨 THE FIX: Safely check if finalAiText exists and is a string before calling .includes()
          if (finalAiText && finalAiText.includes('[SILENCE]')) {
             console.log("Mentor chose to remain silent.");
             return NextResponse.json({ status: 'success' });
          }

          // Save the conversation so the Web Widget sees it too
          // Only save and send if there's actually text to send
          if (finalAiText) {
              await supabase.from('mentor_chat_logs').insert([
                { user_id: existingProfile.id, role: 'user', content: text },
                { user_id: existingProfile.id, role: 'model', content: finalAiText }
              ]);

              await sendMessage(chatId, finalAiText, 'Markdown');
          }

        } catch (aiError) {
          console.error("Mentor AI Error:", aiError);
          await sendMessage(chatId, "Comms interference. I'll check back in shortly.");
        }
        
        return NextResponse.json({ status: 'success' })
      }

      if (text === '/start') {
        await sendMessage(chatId, `Welcome to Sentinel Command.\n\nYour Telegram is NOT connected to the terminal. Please enter the 6-digit transmission code from your account settings.`)
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
             await sendMessage(chatId, `✅ **Identity Verified.**\nWelcome to Sentinel Command, *${linkingUser.username}*.\n\nHere is your single-use access link to the Live Broadcast Channel.\nDo not share this link; it will expire immediately after one use:\n\n${linkData.result.invite_link}`, 'Markdown')
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
