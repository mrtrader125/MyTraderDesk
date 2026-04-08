import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. Vercel Cron Security Check
  // This ensures random people on the internet cannot trigger your drop
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Initialize Supabase with the SERVICE_ROLE key (Bypasses all RLS security to allow backend transfers)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Make sure this is in your Vercel Environment Variables!
  );

  try {
    // 3. Fetch everything currently in the Dark Pool Queue
    const { data: queuedItems, error: fetchError } = await supabase
      .from('queued_analyses')
      .select('*');

    if (fetchError) throw fetchError;
    if (!queuedItems || queuedItems.length === 0) {
      return NextResponse.json({ message: 'Queue empty, nothing to deploy.' }, { status: 200 });
    }

    // 4. Format them for the Live Table
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
      status: 'ACTIVE' // Forces it Live
    }));

    const idsArray = queuedItems.map(item => item.id);

    // 5. Transfer to Live Table
    const { error: insertError } = await supabase.from('analyses').insert(liveItems);
    if (insertError) throw insertError;

    // 6. Delete from Queue Table
    const { error: deleteError } = await supabase.from('queued_analyses').delete().in('id', idsArray);
    if (deleteError) throw deleteError;

    return NextResponse.json({ message: `Successfully deployed ${liveItems.length} setups.` }, { status: 200 });

  } catch (error: any) {
    console.error('Cron Deployment Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}