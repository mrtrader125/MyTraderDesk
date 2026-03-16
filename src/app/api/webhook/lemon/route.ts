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

    // 2. Process Successful Subscriptions
    if (eventName === 'subscription_created' || eventName === 'order_created') {
      const userId = customData.user_id
      const variantId = payload.data.attributes.variant_id.toString()

      // 3. Determine Plan & Cycle based on your Env Variables
      let planTarget = 'free'
      let cycleTarget = 'monthly'

      if (variantId === process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_ID) {
        planTarget = 'pro'; cycleTarget = 'monthly';
      } else if (variantId === process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_ID) {
        planTarget = 'pro'; cycleTarget = 'yearly';
      } else if (variantId === process.env.NEXT_PUBLIC_LEMONSQUEEZY_ESSENTIAL_MONTHLY_ID) {
        planTarget = 'essential'; cycleTarget = 'monthly';
      } else if (variantId === process.env.NEXT_PUBLIC_LEMONSQUEEZY_ESSENTIAL_YEARLY_ID) {
        planTarget = 'essential'; cycleTarget = 'yearly';
      }

      // 4. Update the Database
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          plan: planTarget, 
          billing_cycle: cycleTarget 
        })
        .eq('id', userId)

      if (error) throw error
      console.log(`User ${userId} upgraded to ${planTarget.toUpperCase()} (${cycleTarget}) successfully.`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook Error:', err.message)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
