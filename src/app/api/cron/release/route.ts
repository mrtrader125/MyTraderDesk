import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. Vercel Cron Security Check
  // This ensures random people on the internet cannot trigger your endpoint
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Initialize Supabase with the SERVICE_ROLE key (Bypasses RLS to allow backend database moves)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 3. Fetch the Target Time from your settings table
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('global_release_time')
      .eq('id', 1)
      .single();

    if (settingsError || !settings?.global_release_time) {
      return NextResponse.json({ message: 'No target time configured.' }, { status: 200 });
    }

    const targetTimeStr = settings.global_release_time; // e.g., "08:00 PM"

    // 4. Get Current Time in IST (Indian Standard Time)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata', 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const currentTimeStr = formatter.format(now); // e.g., "07:58 PM"

    // Helper to convert "08:00 PM" to pure minutes for easy math
    const getMinutes = (timeStr: string) => {
      const [time, ampm] = timeStr.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const targetMins = getMinutes(targetTimeStr);
    const currentMins = getMinutes(currentTimeStr);

    // 5. SAFETY WINDOW LOGIC
    // Vercel Cron will check this file every 5 minutes. 
    // If the current time is between the target time and 6 minutes after, we pull the trigger.
    if (currentMins >= targetMins && currentMins < targetMins + 6) {
      
      // Fetch Queued Items
      const { data: queuedItems, error: fetchError } = await supabase.from('queued_analyses').select('*');
      if (fetchError) throw fetchError;
      
      if (!queuedItems || queuedItems.length === 0) {
        return NextResponse.json({ message: 'Time matched, but queue is empty.' }, { status: 200 });
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

      // Execute Database Transfer
      const { error: insertError } = await supabase.from('analyses').insert(liveItems);
      if (insertError) throw insertError;

      const { error: deleteError } = await supabase.from('queued_analyses').delete().in('id', idsArray);
      if (deleteError) throw deleteError;

      return NextResponse.json({ message: `Success! Deployed ${liveItems.length} setups to Live Floor.` }, { status: 200 });
    }

    return NextResponse.json({ message: 'Not time to deploy yet.' }, { status: 200 });

  } catch (error: any) {
    console.error('Cron Deployment Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
