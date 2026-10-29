# 🚀 HƯỚNG DẪN DEPLOY PRODUCTION TOÀN DIỆN - ENGLISHFLOW LMS

Tài liệu này cung cấp quy trình từng bước (Step-by-step) chuẩn kiến trúc DevOps dành cho hệ thống **EnglishFlow LMS (Multi-tenant AI SaaS)**, giúp bạn đưa toàn bộ hệ thống lên môi trường Internet thực tế với chi phí tối ưu (hoàn toàn có thể dùng tier Miễn phí / Free-tier) và độ bảo mật cao nhất.

---

## 🏗️ 1. TỔNG QUAN KIẾN TRÚC DEPLOYMENT

```
                      ┌──────────────────────────────────────────┐
                      │             NGƯỜI DÙNG                   │
                      │   (Học viên / Giảng viên / Quản lý)     │
                      └─────────────────────┬────────────────────┘
                                            │
                                            ▼
                      ┌──────────────────────────────────────────┐
                      │         FRONTEND (VERCEL EDGE CDN)       │
                      │  - React 19 + TypeScript + Vite + Tailwind│
                      │  - Rewrite SPA Routing qua vercel.json   │
                      │  - Domain: https://englishflow.vercel.app│
                      └─────────────────────┬────────────────────┘
                                            │ API Requests (JWT + CORS)
                                            ▼
                      ┌──────────────────────────────────────────┐
                      │       BACKEND API (RENDER / RAILWAY)     │
                      │  - Node.js 22 + Express + Multi-tenant   │
                      │  - Multer Audio Uploads + Rate Limiter   │
                      │  - Domain: https://api.englishflow.vn    │
                      └──────────────┬───────────────────────────┘
                                     │
             ┌───────────────────────┴──────────────────────────┐
             ▼                                                  ▼
┌───────────────────────────┐                      ┌───────────────────────────┐
│   POSTGRESQL DATABASE     │                      │      AI ENGINE CLOUD      │
│ (Supabase / Neon / Render)│                      │    (Google Gemini API)    │
│ - Multi-tenant Schemas    │                      │ - Phân tích Writing barem │
│ - Connection Pooling      │                      │ - Bóc băng & phát âm IPA  │
└───────────────────────────┘                      └───────────────────────────┘
```

---

## 📦 2. CHUẨN BỊ MÃ NGUỒN & ĐẨY LÊN GITHUB

Mở Terminal tại thư mục gốc dự án (`D:\ai-english-lms`) và thực hiện:

```bash
# 1. Khởi tạo Git (nếu chưa có)
git init

# 2. Kiểm tra các file nhạy cảm đã nằm trong .gitignore (.env, dev.db, node_modules)
git status

# 3. Thêm toàn bộ mã nguồn
git add .

# 4. Commit phiên bản sẵn sàng Production
git commit -m "feat(devops): prepare production deployment for Vercel and Render"

# 5. Liên kết với Repository GitHub của bạn (thay URL bên dưới)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/englishflow-lms.git

# 6. Đẩy mã nguồn lên branch main
git branch -M main
git push -u origin main
```

---

## 🗄️ 3. KHỞI TẠO POSTGRESQL DATABASE MIỄN PHÍ TRÊN SUPABASE

Hệ thống EnglishFlow LMS được tối ưu hóa cho **PostgreSQL**. Bạn có thể tạo Database miễn phí trên **Supabase** (khuyến nghị vì có cụm máy chủ tại Singapore rất nhanh):

1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập bằng tài khoản GitHub.
2. Bấm **"New project"**:
   - **Name:** `englishflow-lms-db`
   - **Database Password:** *Tạo mật khẩu mạnh và LƯU LẠI* (VD: `Ef_Secure_Pass_2026!@#`)
   - **Region:** Chọn `Southeast Asia (Singapore) - ap-southeast-1` để có độ trễ thấp nhất về Việt Nam.
3. Sau khi project khởi tạo xong (khoảng 1-2 phút), vào mục **Project Settings** -> **Database**:
   - Tìm mục **Connection string** -> chọn tab **URI** (hoặc **Transaction pooler** port `6543`).
   - Sao chép chuỗi kết nối:
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
     ```
4. **Cập nhật Schema & Đồng bộ Database:**
   - Trong thư mục `server/prisma/schema.prisma`, đổi dòng:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Chạy lệnh đẩy cấu trúc bảng lên Supabase từ máy của bạn:
     ```bash
     cd server
     # Đặt biến môi trường tạm thời hoặc trong file server/.env
     npx prisma db push
     # Khởi tạo dữ liệu mẫu (Seed 4 Tenants, Classes, Users)
     npx tsx prisma/seed.ts
     ```

---

## ⚙️ 4. DEPLOY BACKEND API LÊN RENDER (HOẶC RAILWAY)

### Cách A: Deploy dạng Web Service chuẩn trên Render (Khuyên dùng)
1. Đăng nhập [https://render.com](https://render.com) bằng tài khoản GitHub.
2. Bấm **"New +"** -> Chọn **"Web Service"**.
3. Chọn Repository `englishflow-lms` bạn vừa đẩy lên GitHub.
4. Cấu hình các thông số Web Service:
   - **Name:** `englishflow-api`
   - **Region:** `Singapore (Southeast Asia)`
   - **Branch:** `main`
   - **Root Directory:** `server` *(TỐI QUAN TRỌNG: Nhập chính xác chữ `server`)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start` *(sẽ chạy `node dist/index.js`)*
   - **Instance Type:** `Free` (hoặc `Starter` $7/tháng để server không bị sleep)
5. **Khai báo Environment Variables (Cấu hình môi trường):**
   Bấm vào **"Advanced"** -> **"Add Environment Variable"** và điền:

   | Key | Value Khuyến Nghị | Ghi chú |
   |---|---|---|
   | `NODE_ENV` | `production` | Môi trường production |
   | `PORT` | `5000` | Port lắng nghe |
   | `DATABASE_URL` | *Chuỗi PostgreSQL từ Supabase ở Bước 3* | Kết nối CSDL đám mây |
   | `FRONTEND_URL` | `https://englishflow-lms.vercel.app` | Domain Frontend trên Vercel |
   | `CORS_ORIGIN` | `https://englishflow-lms.vercel.app` | Cho phép Vercel gọi API |
   | `JWT_ACCESS_SECRET` | *Chuỗi bí mật ngẫu nhiên 64 ký tự* | Mã hóa Token đăng nhập |
   | `JWT_REFRESH_SECRET`| *Chuỗi bí mật ngẫu nhiên 64 ký tự* | Token làm mới phiên |
   | `AI_MOCK_MODE` | `false` (hoặc `true` nếu chưa có API Key)| Bật/tắt AI thật |
   | `GEMINI_API_KEY` | *API Key từ Google AI Studio* | Dùng cho AI chấm Writing/Speaking |

6. Bấm **"Create Web Service"**. Render sẽ tự động clone code, cài đặt thư viện, sinh Prisma Client và khởi chạy server.
7. Khi Render báo `Live`, ghi lại URL của Backend (VD: `https://englishflow-api.onrender.com`).
   - Kiểm tra bằng cách mở trình duyệt truy cập: `https://englishflow-api.onrender.com/health` -> Nhận được JSON `{"status":"UP"}` là thành công 100%!

---

### Cách B: Deploy bằng Dockerfile (Trên Render / Railway / DigitalOcean / VPS)
Trong thư mục `server/` đã có sẵn file `Dockerfile` chuẩn multi-stage tối ưu dung lượng:
- Khi tạo New Web Service trên Render, mục **Runtime** chọn **Docker**.
- Render sẽ tự động build image Node 22 Alpine, tạo thư mục `uploads/` và chạy server.

---

## 🌐 5. DEPLOY FRONTEND REACT LÊN VERCEL

1. Truy cập [https://vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
2. Bấm **"Add New..."** -> Chọn **"Project"**.
3. Chọn Repository `englishflow-lms` từ danh sách.
4. Cấu hình Project trên Vercel:
   - **Framework Preset:** `Vite` *(Vercel tự động nhận diện)*
   - **Root Directory:** `./` *(để trống hoặc chọn thư mục gốc)*
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Khai báo Environment Variables:**
   Mở mục **Environment Variables** và thêm:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://englishflow-api.onrender.com/api/v1` *(Thay bằng URL Render backend ở Bước 4)*
6. Bấm **"Deploy"**:
   - Vercel sẽ biên dịch dự án với Rolldown/Vite trong khoảng 20-40 giây.
   - File [`vercel.json`](file:///D:/ai-english-lms/vercel.json) đã được thiết lập sẵn quy tắc rewrite:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
     Đảm bảo bạn có thể truy cập bất kỳ đường dẫn nào (`/teacher/grading`, `/student/practice`, `/center-manager/dashboard`) và F5 làm mới trang mà không bao giờ bị lỗi 404!

---

## 🔍 6. KIỂM THỬ HỆ THỐNG SAU KHI DEPLOY (POST-DEPLOYMENT CHECKLIST)

Sau khi cả 2 dịch vụ đã Live, hãy thực hiện kiểm thử quy trình:

| STT | Hạng Mục Kiểm Thử | Thao Tác | Kết Quả Mong Đợi |
|:---:|:---|:---|:---|
| 1 | **Tải trang chủ** | Truy cập domain Vercel | Giao diện hiển thị tức thì, CSS/Font/Icon đầy đủ |
| 2 | **Đăng nhập & Role Switcher** | Chọn tài khoản Demo hoặc đăng nhập `manager.hn@englishflow.vn` / `123456` | Chuyển hướng vào Dashboard thành công, nhận JWT Token |
| 3 | **F5 Deep Link** | Truy cập trực tiếp `/teacher/lesson-planner` và bấm F5 | Trang tải lại mượt mà, không bị lỗi 404 của Vercel |
| 4 | **AI Writing Evaluator** | Vào `/student/practice` -> Tab Writing -> Nộp bài luận | Nhận kết quả chấm điểm 4 tiêu chí IELTS và các sửa lỗi ngữ pháp |
| 5 | **AI Speaking & Audio** | Vào `/student/practice` -> Tab Speaking -> Thu âm bằng micro -> Nộp bài | File audio gửi lên backend thành công, nhận phân tích IPA |
| 6 | **CORS Security** | Thử gọi API từ một origin lạ bằng Console | Bị chặn bởi CORS Middleware an toàn |

---

## 🛠️ 7. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

1. **Lỗi `CORS error: No 'Access-Control-Allow-Origin' header`:**
   - *Nguyên nhân:* Biến `FRONTEND_URL` trên Render chưa khớp chính xác với domain Vercel.
   - *Khắc phục:* Vào Render -> Environment Variables -> Đảm bảo `FRONTEND_URL=https://<your-project>.vercel.app` (không có dấu gạch chéo `/` ở cuối) rồi bấm Save Changes.

2. **Render Free-tier khởi động chậm sau 15 phút không dùng (Cold Start):**
   - *Hiện tượng:* Lần đầu truy cập sau một thời gian, API mất 30-50s để phản hồi.
   - *Khắc phục:* Có thể dùng dịch vụ miễn phí như [UptimeRobot](https://uptimerobot.com) để ping endpoint `https://<your-api>.onrender.com/health` mỗi 10 phút một lần để giữ server luôn "thức". Hoặc nâng cấp gói Starter ($7/mo) của Render.

3. **Lỗi Prisma Client không tìm thấy bảng:**
   - *Khắc phục:* Kiểm tra xem đã chạy `npx prisma db push` trên database PostgreSQL chưa. Script `"postinstall": "prisma generate"` trong `server/package.json` sẽ tự động đảm bảo Client luôn đồng bộ khi deploy.

