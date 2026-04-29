import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Client } from '@upstash/qstash'
import { evaluateTrigger } from '@/kernel/triggerEngine'
import { isShiftActiveForUser, didShiftJustStart } from '@/mentor/shiftLogic'

// Use Edge runtime for fast cron execution
export const runtime = 'edge';

const qstash = new Client({ token: process.env.QSTASH_TOKEN! })

export async function GET(req: Request) {
  // 1. Cron Security Check (Make sure your cronjobs.com header matches this!)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Mentor Cron Error: Unauthorized access attempt.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: users } = await supabase.from('user_trading_modules').select('*').eq('status', 'ACTIVE')
    if (!users || users.length === 0) return NextResponse.json({ status: 'ok', message: 'No active users found.' })

    const { data: template } = await supabase.from('mentor_shift_template').select('*').single()
    if (!template) {
        console.error("Mentor Cron Error: Missing shift template config.");
        return NextResponse.json({ error: 'Missing shift config' }, { status: 500 });
    }

    // 2. Process the Sweep globally
    for (const user of users) {
      const nowActive = isShiftActiveForUser(new Date(), user.timezone || 'UTC', template)
      
      // Check for Morning Catch-up if their shift just triggered
      if (didShiftJustStart(user.last_shift_active, nowActive)) {
        await qstash.publishJSON({
          url: `${process.env.BASE_URL}/api/worker/catchup`,
          body: { userId: user.user_id },
          delay: Math.floor(Math.random() * 5)
        })
      }

      // Update Shift State to maintain the lock
      await supabase.from('user_trading_modules').update({
        last_shift_active: nowActive,
        last_shift_check: new Date().toISOString()
      }).eq('id', user.id)

      // Evaluate standard behavioral triggers (Overtrade, Missed Prep, etc.)
      const trigger = evaluateTrigger(user)
      if (trigger) {
        await qstash.publishJSON({
          url: `${process.env.BASE_URL}/api/worker/ai-task`,
          body: { userId: user.user_id, trigger },
          delay: Math.floor(Math.random() * 5)
        })
      }
    }

    return NextResponse.json({ status: 'ok', message: 'Sweep completed successfully.' })

  } catch (error: any) {
    console.error('Mentor Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
