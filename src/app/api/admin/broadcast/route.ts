// app/api/admin/broadcast/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker, timeframe, thesis, image_url, tier_access } = body;

    // 1. Validate the incoming data
    if (!ticker || !thesis) {
      return NextResponse.json(
        { message: 'Ticker and thesis are required' },
        { status: 400 }
      );
    }

    // 2. TODO: Insert into your Supabase database here (if not doing it on frontend)
    // 3. TODO: Send message to your Telegram Bot here using fetch()

    // 4. Return a success JSON response
    return NextResponse.json({ 
      success: true, 
      message: 'Broadcast successful' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Broadcast API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}