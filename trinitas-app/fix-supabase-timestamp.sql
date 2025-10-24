-- 修復 Supabase 數據庫的 created_at 欄位類型
-- 將 bigint 改為 timestamp with time zone

-- 1. 修改 orders 表的 created_at 欄位
ALTER TABLE orders 
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE 
USING to_timestamp(created_at / 1000);

-- 2. 修改 order_items 表的 created_at 欄位（如果存在）
ALTER TABLE order_items 
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE 
USING to_timestamp(created_at / 1000);

-- 3. 修改 order_counter 表的 updated_at 欄位（如果存在）
ALTER TABLE order_counter 
ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE 
USING to_timestamp(updated_at / 1000);

-- 4. 設置默認值
ALTER TABLE orders 
ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE order_items 
ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE order_counter 
ALTER COLUMN updated_at SET DEFAULT NOW();
