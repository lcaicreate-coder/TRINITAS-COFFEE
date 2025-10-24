-- 正確的 Supabase 數據庫修復腳本
-- 根據實際欄位類型進行修復

-- 1. 檢查當前 orders 表的 created_at 欄位類型
-- 如果已經是 timestamp 類型，則不需要修改
-- 如果是 text/varchar 類型，則需要轉換

-- 方案 A: 如果 created_at 是 text/varchar 類型
-- ALTER TABLE orders 
-- ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE 
-- USING created_at::timestamp with time zone;

-- 方案 B: 如果 created_at 是 bigint 類型（毫秒時間戳）
-- ALTER TABLE orders 
-- ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE 
-- USING to_timestamp(created_at::bigint / 1000);

-- 方案 C: 如果 created_at 是 bigint 類型（秒時間戳）
-- ALTER TABLE orders 
-- ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE 
-- USING to_timestamp(created_at::bigint);

-- 方案 D: 如果 created_at 已經是正確的 timestamp 類型
-- 只需要設置默認值
ALTER TABLE orders 
ALTER COLUMN created_at SET DEFAULT NOW();

-- 2. 對 order_items 表做同樣的處理
ALTER TABLE order_items 
ALTER COLUMN created_at SET DEFAULT NOW();

-- 3. 對 order_counter 表做同樣的處理
ALTER TABLE order_counter 
ALTER COLUMN updated_at SET DEFAULT NOW();

-- 4. 確保所有表都有正確的索引
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
