# Personal Finance Monorepo

Dự án monorepo bao gồm Backend Spring Boot và Frontend React Vite TS.

## Cấu trúc
- `backend/`: Spring Boot 3 API.
- `frontend/`: React + Vite + TS + MUI.
- `docker-compose.yml`: Orchestration cho MySQL, Backend, và Frontend (Nginx proxy).

## Cách chạy (Verify)
1. Build và khởi động các service:
   ```bash
   docker compose up --build
   ```
2. Kiểm tra Health Check qua Frontend Proxy (Port 3000):
   ```bash
   curl http://localhost:3000/api/health
   ```
   Kết quả mong đợi: `{"status":"ok"}`

3. Truy cập UI:
   Mở trình duyệt tại `http://localhost:3000`
