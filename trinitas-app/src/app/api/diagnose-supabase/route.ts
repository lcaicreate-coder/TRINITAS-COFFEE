import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const results: {
    timestamp: string;
    environment: string | undefined;
    supabaseUrl: string | undefined;
    supabaseKey: string;
    tests: Record<string, {
      success: boolean;
      error?: string;
      code?: string;
      hint?: string;
      data?: unknown;
      orderError?: string;
      itemError?: string;
    }>;
    error?: string;
    details?: string;
  } = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
    tests: {}
  };

  try {
    if (!supabase) {
      results.error = 'Supabase client not initialized';
      return NextResponse.json(results, { status: 500 });
    }

    // 測試 1: 基本連接
    try {
      const { error } = await supabase
        .from('orders')
        .select('count')
        .limit(1);
      
      results.tests.basicConnection = {
        success: !error,
        error: error?.message,
        code: error?.code
      };
    } catch (e) {
      results.tests.basicConnection = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // 測試 2: 檢查 orders 表結構
    try {
      const { error } = await supabase
        .from('orders')
        .select('id, order_number, display_name, note, status, created_at')
        .limit(1);
      
      results.tests.ordersTableStructure = {
        success: !error,
        error: error?.message,
        code: error?.code,
        hint: error?.hint
      };
    } catch (e) {
      results.tests.ordersTableStructure = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // 測試 3: 檢查 order_items 表
    try {
      const { error } = await supabase
        .from('order_items')
        .select('id, order_id, menu_item_id, quantity, add_ons')
        .limit(1);
      
      results.tests.orderItemsTable = {
        success: !error,
        error: error?.message,
        code: error?.code,
        hint: error?.hint
      };
    } catch (e) {
      results.tests.orderItemsTable = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // 測試 4: 檢查 order_counter 表
    try {
      const { data, error } = await supabase
        .from('order_counter')
        .select('*')
        .limit(1);
      
      results.tests.orderCounterTable = {
        success: !error,
        error: error?.message,
        code: error?.code,
        data: data
      };
    } catch (e) {
      results.tests.orderCounterTable = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // 測試 5: 嘗試創建一個測試訂單
    try {
      const testOrderId = `test_${Date.now()}`;
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: testOrderId,
          order_number: 999,
          display_name: 'Test Order',
          note: 'Diagnostic test',
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) {
        results.tests.createOrder = {
          success: false,
          orderError: orderError.message,
          code: orderError.code
        };
      } else {
        // 創建訂單項目
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: testOrderId,
            menu_item_id: 'test-item',
            quantity: 1,
            add_ons: []
          });

        // 清理測試數據
        await supabase.from('orders').delete().eq('id', testOrderId);

        results.tests.createOrder = {
          success: !itemError,
          orderError: undefined,
          itemError: itemError?.message || undefined
        };
      }
    } catch (e) {
      results.tests.createOrder = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    return NextResponse.json(results);

  } catch (error) {
    results.error = 'Diagnosis failed';
    results.details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(results, { status: 500 });
  }
}
