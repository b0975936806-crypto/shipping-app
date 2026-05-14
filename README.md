# Shipping-App (LINE Mini App)

## 專案說明
- 本地路徑: /home/yu/projects/shipping-app
- 網址: https://yuring.ddns.net
- 功能: 出貨記錄管理 LINE Mini App (LIFF)

## 維運資訊
- 部署方式: Docker (docker-compose)
- 資料儲存: SQLite (掛載於主機 `./server/data/shipments.db`)
- 圖片儲存: 上傳圖片 (掛載於主機 `./server/uploads`)

### 容器管理
- `shipping-api`: 後端 Express，port 3020
- `shipping-web`: 前端靜態資源，port 8080
- 重啟命令: `docker compose restart shipping-web`
- 查看日誌: `docker compose logs -f shipping-web`

## 啟動與管理
- API 啟動命令: `npx pm2 start server/index.js --name "shipping-api" --time --restart-delay 3000 -- --port 3020`
- 前端啟動命令: `npm run dev --prefix client`

## 環境設定 (LIFF)
- LIFF ID: 2009886016 (狀態: Review)
- 環境變數: 定義於 client/.env (VITE_LIFF_ID="2009886016")


## 編譯與部署指南
### 1. 編譯前端 (Build)
- 進入 client 目錄進行編譯:
  ```bash
  cd /home/yu/projects/shipping-app/client && npm run build
  ```
- 打包後的檔案位於 `client/dist/`，可透過 Nginx/Caddy 提供靜態服務。
  cd /home/yu/projects/shipping-app/client
  sudo rm -rf /var/www/shipping-app/* && sudo cp -r dist/* /var/www/shipping-app/ && sudo chown -R www-data:www-data /var/www/shipping-app/

### 2. 部署前端 (Production)
```bash
cd /home/yu/projects/shipping-app
git pull
docker compose build shipping-web
docker compose up -d shipping-web
```

### 3. Caddy 代理配置建議
- 請將 `yuring.ddns.net` 之流量如下轉發：
  - `/` -> 指向 `http://127.0.0.1:8080` (shipping-web)
  - `/api` -> 反向代理至 `http://127.0.0.1:3020` (shipping-api)

### 部署注意事項 (Production)
- Docker 容器：`shipping-api`、`shipping-web`
- 資料持久化：`server/data/` 與 `server/uploads/` 掛載於主機，不受容器重建影響
- 若需完全重啟：先 `docker compose stop`，再 `docker compose up -d`
