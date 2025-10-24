-- 檢查當前表結構
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 檢查 order_items 表結構
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- 檢查 order_counter 表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'order_items', 'order_counter');
