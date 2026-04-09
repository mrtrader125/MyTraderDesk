import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { telegramId } = await req.json()

    if (!telegramId) {
      return NextResponse.json({ authorized: false, reason: 'no_id' }, { status: 400 })
    }

    // Use SERVICE_ROLE to bypass RLS and securely check the profiles table
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 🚨 FIX 1: Corrected variable name to `telegramId`
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, plan')
      .eq('telegram_user_id', telegramId)
      .single()

    if (error || !profile) {
      return NextResponse.json({ authorized: false, reason: 'not_linked' })
    }

    // 🚨 FIX 2: Bulletproof plan check (handles uppercase, nulls, and spacing)
    const userPlan = (profile.plan || 'free').toLowerCase().trim()

    if (userPlan !== 'pro' && userPlan !== 'premium') {
      return NextResponse.json({ authorized: false, reason: 'not_pro' })
    }

    // Success! Return the user data to authorize the frontend
    return NextResponse.json({ authorized: true, user: profile })

  } catch (error) {
    console.error('Mini App Auth Error:', error)
    return NextResponse.json({ authorized: false, reason: 'server_error' }, { status: 500 })
  }
}
