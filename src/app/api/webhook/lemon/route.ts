import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '')
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
    const signature = Buffer.from(req.headers.get('x-signature') || '', 'utf8')

    // 1. Security Check
    if (signature.length !== digest.length || !crypto.timingSafeEqual(digest, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const eventName = payload.meta.event_name
    const customData = payload.meta.custom_data

    // Safe Check: Ensure user_id was passed in the checkout payload
    if (!customData || !customData.user_id) {
       return NextResponse.json({ error: 'Missing user_id in custom_data' }, { status: 400 })
    }

    const userId = customData.user_id
    
    // Initialize Admin Client (God Mode) to bypass Row Level Security
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 2. Process Successful Subscriptions & Upgrades
    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const variantId = payload.data.attributes.variant_id?.toString()

      if (!variantId) {
        return NextResponse.json({ error: 'Missing variant_id' }, { status: 400 })
      }

      let planTarget = 'demo'
      let cycleTarget = 'none'

      // Map Lemon Squeezy Variants to Database Tiers
      if (variantId === process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_ID) {
        planTarget = 'pro'; cycleTarget = 'monthly';
      } else if (variantId === process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_ID) {
        planTarget = 'pro'; cycleTarget = 'yearly';
      }

      // Update the Database (Only if it matches an active Pro variant)
      if (planTarget === 'pro') {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ 
            plan: planTarget, 
            billing_cycle: cycleTarget 
          })
          .eq('id', userId)

        if (error) throw error
        console.log(`User ${userId} updated to ${planTarget.toUpperCase()} (${cycleTarget}) successfully.`)
        
        // Push an instant UX Notification to the terminal
        await supabaseAdmin.from('notifications').insert([{
          user_id: userId,
          title: 'Terminal Unlocked',
          message: 'Your Professional subscription is active. Welcome to the Sentinel Vortex floor.',
          type: 'SYSTEM',
          status: 'UNREAD'
        }])
      }
    }

    // 3. Process Expirations (Downgrades)
    // We ONLY downgrade when the time runs out (expired), not immediately on cancel.
    if (eventName === 'subscription_expired') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          plan: 'demo', 
          billing_cycle: 'none' 
        })
        .eq('id', userId)

      if (error) throw error
      console.log(`User ${userId} subscription ended. Downgraded to DEMO.`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook Error:', err.message)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
