import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. Cron Security Check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Cron Error: Unauthorized access attempt.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Initialize Supabase with SERVICE_ROLE (Bypasses RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Cron Error: Missing Supabase Env Variables.');
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 3. Fetch Target Time from Supabase Settings
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('global_release_time')
      .eq('id', 1)
      .single();

    if (settingsError || !settings?.global_release_time) {
      console.log('Cron: No target time configured in database.');
      return NextResponse.json({ message: 'No target time configured.' }, { status: 200 });
    }

    const targetTimeStr = settings.global_release_time; // e.g., "08:00 PM"

    // 4. Get Current Time in IST (Asia/Kolkata)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata', 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const currentTimeStr = formatter.format(now); 

    // 🚨 BULLETPROOF PARSER: Prevents the silent server crash caused by invisible spaces
    const getMinutes = (timeString: string) => {
      const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/i);
      if (!match) return -1;
      
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();

      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const targetMins = getMinutes(targetTimeStr);
    const currentMins = getMinutes(currentTimeStr);

    console.log(`Cron Check -> Target: ${targetTimeStr} (${targetMins}m) | Current IST: ${currentTimeStr} (${currentMins}m)`);

    if (targetMins === -1 || currentMins === -1) {
       console.error('Cron Error: Failed to parse time strings.');
       return NextResponse.json({ error: 'Time parsing failed' }, { status: 500 });
    }

    // 5. SAFETY WINDOW LOGIC (Between 0 and 5 minutes after target time)
    if (currentMins >= targetMins && currentMins < targetMins + 6) {
      console.log('Cron: Time matched! Executing Dark Pool drop...');
      
      const { data: queuedItems, error: fetchError } = await supabase.from('queued_analyses').select('*');
      if (fetchError) throw fetchError;
      
      if (!queuedItems || queuedItems.length === 0) {
        console.log('Cron: Queue is empty. Nothing to deploy.');
        return NextResponse.json({ message: 'Queue is empty.' }, { status: 200 });
      }

      // Format for Live Table
      const liveItems = queuedItems.map(item => ({
        asset_symbol: item.asset_symbol,
        category: item.category,
        timeframe: item.timeframe,
        bias: item.bias,
        title: item.title,
        content: item.content,
        tier_access: item.tier_access,
        is_featured: item.is_featured,
        image_url: item.image_url,
        status: 'ACTIVE' 
      }));

      const idsArray = queuedItems.map(item => item.id);

      // 🚨 AUTO-ARCHIVE LOGIC: Clean the floor before dropping new setups
      console.log('Cron: Archiving old setups...');
      for (const item of liveItems) {
        await supabase
          .from('analyses')
          .update({ status: 'ARCHIVED' })
          .eq('asset_symbol', item.asset_symbol)
          .eq('timeframe', item.timeframe)
          .in('status', ['WAITING', 'ACTIVE']);
      }

      // Execute Database Transfer
      console.log('Cron: Inserting new setups...');
      const { error: insertError } = await supabase.from('analyses').insert(liveItems);
      if (insertError) throw insertError;

      console.log('Cron: Deleting from staging queue...');
      const { error: deleteError } = await supabase.from('queued_analyses').delete().in('id', idsArray);
      if (deleteError) throw deleteError;

      // ==========================================
      // 🚨 NEW: TRIGGER THE TELEGRAM BROADCAST
      // ==========================================
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mytraderdesk.com';
        await fetch(`${baseUrl}/api/admin/broadcast`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'automated' }) 
        });
        console.log('Cron: Automated Telegram Broadcast Fired!');
      } catch (broadcastError) {
        console.error('Cron: Failed to send Telegram Broadcast:', broadcastError);
      }

      console.log(`Cron: SUCCESS! Dropped ${liveItems.length} setups.`);
      return NextResponse.json({ message: `Success! Deployed ${liveItems.length} setups to Live Floor.` }, { status: 200 });
    }

    console.log('Cron: Not time to deploy yet.');
    return NextResponse.json({ message: 'Not time to deploy yet.' }, { status: 200 });

  } catch (error: any) {
    console.error('Cron Deployment Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
