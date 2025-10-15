# Trinitas Cafe Web App 需求（精簡版）

## 使用者角色
- 訪客（下單者）
- 同工（處理訂單）

## 功能範圍
### 訪客
- 查看菜單（自由奉獻，不顯示價格）
- 選擇飲品 → 輸入稱呼（1–20）與備註（≤100） → 送單
- 送單成功頁文案：
  - 「請期待你的咖啡。如果你都享受 Trinitas 嘅體驗，歡迎奉獻支持。」

### 同工
- 看板分欄：待處理 / 製作中 / 已完成
- 每張卡片顯示：稱呼、下單時間（相對時間）、飲品項目、備註
- 操作：待處理→製作中、製作中→完成；新單抵達提示音（可靜音）

## 架構與技術
- Next.js 15（App Router）
- UI：Tailwind CSS 4（`globals.css` 定義 Token）
- API：`/api/orders`、`/api/orders/[id]`、`/api/health`
- 資料：
  - 主要：Vercel KV（`@vercel/kv`）
  - 後備：記憶體（本地開發或未設 KV 時）

## 路由
- `/`：菜單列表（連至 `/:id`）
- `/:id`：下單頁（對應 `MENU`）
- `/barista`：訂單頁(同工專用)（2s 輪詢 `/api/orders`）
- `/api/orders`：
  - GET：回傳 `orders`（含 `itemsDetailed`）
  - POST：建立訂單（驗證稱呼、飲品）
- `/api/orders/[id]`：
  - PATCH：更新狀態（`pending|in_progress|ready|done`）
- `/api/health`：健康檢查（edge、no-store）

## 資料模型（摘要）
```ts
export type OrderStatus = "pending" | "in_progress" | "ready" | "done";
export interface OrderItem { menuItemId: string; qty: number }
export interface Order {
  id: string; displayName: string; note?: string; status: OrderStatus;
  createdAt: number; items: OrderItem[];
}
```

## 部署
- Vercel → Root Directory：`trinitas-app`
- 環境變數：`KV_REST_API_URL`、`KV_REST_API_TOKEN`
- 路由執行環境：`edge`，禁用快取（`dynamic = "force-dynamic"`, `revalidate = 0`）

## 待辦方向（未來）
- 看板保護（簡單密碼或 token）
- Ratelimit（防濫用送單）
- 訂單完成自動過濾（只顯示近期）/ 歷史頁
- 圖片與菜單分類

