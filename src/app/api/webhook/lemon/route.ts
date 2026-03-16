import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '')
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
    const signature = Buffer.from(req.headers.get('x-signature') || '', 'utf8')

    // 1. Security Check: Ensure this request actually came from Lemon Squeezy
    if (signature.length !== digest.length || !crypto.timingSafeEqual(digest, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const eventName = payload.meta.event_name
    const customData = payload.meta.custom_data

    // 2. Only act if the payment was successful
    if (eventName === 'order_created' || eventName === 'subscription_created') {
      const userId = customData.user_id

      // 3. Direct Admin access to update the profile
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // You will need to add this to .env
      )

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ plan: 'PRO' })
        .eq('id', userId)

      if (error) throw error
      console.log(`User ${userId} upgraded to PRO successfully.`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook Error:', err.message)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
