import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase client not initialized',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
      }, { status: 500 });
    }

    // 測試基本連接
    const { data: testData, error: testError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);

    if (testError) {
      return NextResponse.json({ 
        error: 'Supabase query failed',
        details: testError.message,
        code: testError.code,
        hint: testError.hint
      }, { status: 500 });
    }

    // 測試 order_counter 表
    const { data: counterData, error: counterError } = await supabase
      .from('order_counter')
      .select('*')
      .limit(1);

    return NextResponse.json({
      success: true,
      ordersTable: 'OK',
      counterTable: counterError ? `Error: ${counterError.message}` : 'OK',
      counterData: counterData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
