-- 簡單修復 Supabase 數據庫結構
-- 這個腳本會安全地添加缺失的欄位

-- 1. 檢查並添加 order_number 欄位到 orders 表
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number INTEGER;

-- 2. 檢查並添加 updated_at 欄位到 orders 表
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. 創建 order_items 表（如果不存在）
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT,
  menu_item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  add_ons TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 添加外鍵約束（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_order_id_fkey'
    ) THEN
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. 創建 order_counter 表（如果不存在）
CREATE TABLE IF NOT EXISTS order_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  counter INTEGER NOT NULL DEFAULT 0,
  last_reset_date TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_counter CHECK (id = 1)
);

-- 6. 插入初始計數器記錄（如果不存在）
INSERT INTO order_counter (counter, last_reset_date) 
VALUES (0, '2025-10-24')
ON CONFLICT (id) DO NOTHING;

-- 7. 創建索引
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 8. 啟用 RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_counter ENABLE ROW LEVEL SECURITY;

-- 9. 創建策略
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
DROP POLICY IF EXISTS "Allow all operations on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow all operations on order_counter" ON order_counter;

CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on order_counter" ON order_counter FOR ALL USING (true);
