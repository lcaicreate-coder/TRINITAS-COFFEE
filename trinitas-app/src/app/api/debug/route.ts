import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const debug = {
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      kvUrl: process.env.KV_REST_API_URL ? 'Set' : 'Not set',
      kvToken: process.env.KV_REST_API_TOKEN ? 'Set' : 'Not set',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json({ error: 'Debug failed', details: error }, { status: 500 });
  }
}
