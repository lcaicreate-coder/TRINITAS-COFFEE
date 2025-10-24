# 域名設置指南

## 更新到 trinitas-coffee.vercel.app

### 步驟 1: 在 Vercel Dashboard 中設置自定義域名

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的項目 `TRINITAS-COFFEE`
3. 進入 **Settings** → **Domains**
4. 添加新域名：`trinitas-coffee.vercel.app`

### 步驟 2: 更新環境變量（如果需要）

如果域名變更影響到任何環境變量，請在 Vercel Dashboard 中更新：
- 進入 **Settings** → **Environment Variables**
- 檢查是否有任何包含舊域名的變量需要更新

### 步驟 3: 重新部署

1. 在 Vercel Dashboard 中點擊 **Deployments**
2. 點擊最新的部署旁邊的三個點
3. 選擇 **Redeploy**

### 步驟 4: 測試新域名

部署完成後，測試以下 URL：

#### 主要頁面
- 主頁：`https://trinitas-coffee.vercel.app/`
- 登入頁：`https://trinitas-coffee.vercel.app/barista/login`
- 訂單管理：`https://trinitas-coffee.vercel.app/barista`

#### API 端點
- 調試信息：`https://trinitas-coffee.vercel.app/api/debug`
- Supabase 測試：`https://trinitas-coffee.vercel.app/api/test-supabase`
- 詳細診斷：`https://trinitas-coffee.vercel.app/api/diagnose-supabase`

#### 產品頁面
- 濃縮咖啡：`https://trinitas-coffee.vercel.app/espresso`
- 美式咖啡：`https://trinitas-coffee.vercel.app/americano`
- 拿鐵：`https://trinitas-coffee.vercel.app/latte`
- 泡沫咖啡：`https://trinitas-coffee.vercel.app/cappuccino`
- 髒咖啡：`https://trinitas-coffee.vercel.app/dirty`
- 濃縮通寧：`https://trinitas-coffee.vercel.app/espresso-tonic`
- 冰美式：`https://trinitas-coffee.vercel.app/ice-americano`
- 冰拿鐵：`https://trinitas-coffee.vercel.app/iced-latte`
- 抹茶拿鐵：`https://trinitas-coffee.vercel.app/green-tea-latte`
- 椰奶拿鐵：`https://trinitas-coffee.vercel.app/coconut-latte`

### 步驟 5: 更新任何外部引用

如果項目中有任何硬編碼的 URL 引用，請更新為新域名。

### 注意事項

- 舊域名 `trinitiscoffee10.vercel.app` 仍然會工作，但建議使用新域名
- 確保所有功能在新域名下正常工作
- 檢查 Supabase 環境變量是否正確設置
- 測試訂單創建和管理功能

## 故障排除

如果遇到問題：

1. 檢查 Vercel 部署日誌
2. 運行診斷端點：`/api/diagnose-supabase`
3. 檢查環境變量設置
4. 確認 Supabase 數據庫連接正常
