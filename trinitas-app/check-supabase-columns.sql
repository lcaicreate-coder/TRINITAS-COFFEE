-- 檢查 Supabase 數據庫的實際欄位類型和數據
-- 在 Supabase SQL Editor 中執行此查詢

-- 1. 檢查 orders 表的結構
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 2. 檢查 orders 表的實際數據樣本
SELECT 
    id,
    order_number,
    display_name,
    created_at,
    pg_typeof(created_at) as created_at_type
FROM orders 
LIMIT 3;

-- 3. 檢查 order_items 表的結構
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- 4. 檢查 order_counter 表的結構
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_counter' 
ORDER BY ordinal_position;
