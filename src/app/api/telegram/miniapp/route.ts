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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, plan')
      .eq('telegram_user_id', telegramUserId)
      .single()

    if (error || !profile) {
      return NextResponse.json({ authorized: false, reason: 'not_linked' })
    }

    if (profile.plan !== 'pro' && profile.plan !== 'premium') {
      return NextResponse.json({ authorized: false, reason: 'not_pro' })
    }

    // Success! Return the user data to authorize the frontend
    return NextResponse.json({ authorized: true, user: profile })

  } catch (error) {
    console.error('Mini App Auth Error:', error)
    return NextResponse.json({ authorized: false, reason: 'server_error' }, { status: 500 })
  }
}