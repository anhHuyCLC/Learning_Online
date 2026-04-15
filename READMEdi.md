# Hướng Dẫn Chạy Ứng Dụng Learning Online

Tài liệu này hướng dẫn cách thiết lập và chạy ứng dụng Learning Online từ backend đến frontend trên máy local hoặc deploy lên server.

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: v18 trở lên
- **npm**: v9 trở lên
- **Hệ điều hành**: Windows, macOS, hoặc Linux
- **Cổng**: 3000 (backend), 5173 (frontend)

## 🗂️ Cấu Trúc Dự Án

```
Learning_Online/
├── backend/              # API server Express + SQLite
│   ├── config/          # Database config
│   ├── controllers/      # API logic
│   ├── models/          # Database queries
│   ├── routes/          # Routes định nghĩa
│   ├── middleware/       # Auth, validation
│   ├── data/            # SQLite database (auto-created)
│   ├── package.json
│   └── app.ts           # Entry point
├── frontend/            # React + Vite
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── package.json         # Root scripts
```

---

## 🚀 Bước 1: Chuẩn Bị Môi Trường

### 1.1 Clone hoặc mở project
```bash
cd d:/MentorThuan/Learning_Online
```

### 1.2 Cài đặt dependencies toàn bộ project
```bash
npm install
```

Lệnh này sẽ cài cho cả root, backend, và frontend tại các bước sau.

---

## ⚙️ Bước 2: Cấu Hình Backend

### 2.1 Cài đặt dependencies backend
```bash
npm --prefix backend install
```

Lệnh này sẽ cài các package bao gồm Express, SQLite, bcrypt, JWT, v.v.

### 2.2 Tạo file `.env` cho backend

Tạo file `backend/.env` có nội dung:

```env
# SQLite database file path
SQLITE_DB_PATH=./data/learning_online.sqlite

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

**Lưu ý:**
- Thay `JWT_SECRET` bằng chuỗi mật khẩu mạnh tùy ý
- `SQLITE_DB_PATH` sẽ được tạo tự động, bạn không cần tạo thủ công
- Nếu deploy production, thay `FRONTEND_URL` thành domain frontend thực tế, có thể dùng dấu phẩy để cách nhiều domain

### 2.3 Xem cấu trúc database

Backend sẽ tự tạo database khi server khởi động lần đầu. Nếu muốn xem script SQL, tham khảo:
```
backend/scripts/create_enrollments_table.sql
backend/scripts/create_user_progress_table.sql
```

---

## ▶️ Bước 3: Chạy Backend

### Lựa chọn A: Chạy ở chế độ development (auto-reload)
```bash
npm --prefix backend run dev
```

Output sẽ hiển thị:
```
SQLite connected successfully: D:\MentorThuan\Learning_Online\backend\data\learning_online.sqlite
Server running on port 3000
```

### Lựa chọn B: Chạy production
```bash
npm --prefix backend run start
```

### Xác nhận backend hoạt động
- Mở browser, truy cập `http://localhost:3000`
- Nếu không báo lỗi, backend đã chạy thành công
- API có sẵn tại `http://localhost:3000/api/...`

---

## ⚙️ Bước 4: Cấu Hình Frontend

### 4.1 Cài đặt dependencies frontend
```bash
npm --prefix frontend install
```

### 4.2 Tạo file `.env` cho frontend

Tạo file `frontend/.env` có nội dung:

```env
VITE_API_URL=http://localhost:3000
```

**Lưu ý:**
- Đây là URL backend mà frontend sẽ gọi API
- Khi deploy production, thay thành URL backend thực tế (ví dụ: `https://your-backend-domain.com`)

---

## ▶️ Bước 5: Chạy Frontend

### Lựa chọn A: Chạy ở chế độ development
```bash
npm --prefix frontend run dev
```

Output sẽ hiển thị:
```
VITE v7.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Press h + enter to show help
```

### Lựa chọn B: Build cho production
```bash
npm --prefix frontend run build
```

Lệnh này sẽ tạo thư mục `frontend/dist/` chứa file HTML, JS, CSS đã tối ưu hóa.

### Xác nhận frontend hoạt động
- Mở browser, truy cập `http://localhost:5173`
- Bạn sẽ thấy trang đăng nhập hoặc trang chủ
- Nếu frontend gọi lên backend và không báo lỗi CORS, mọi thứ hoạt động ổn

---

## 🔀 Bước 6: Chạy Cả Backend + Frontend Cùng Lúc

Nếu bạn muốn chạy cả hai app từ 1 cửa sổ terminal:

### Từ thư mục root project
```bash
npm run dev
```

Lệnh này sẽ:
1. Chạy backend (`npm --prefix backend run dev`)
2. Chạy frontend (`npm --prefix frontend run dev`)
3. Hiển thị log của cả hai app cùng lúc

Nhấn `Ctrl+C` để dừng cả hai.

---

## 🧪 Bước 7: Kiểm Tra Chức Năng Cơ Bản

### 7.1 Tạo tài khoản
1. Mở `http://localhost:5173`
2. Click "Đăng Ký"
3. Nhập: Tên, Email, Mật khẩu
4. Click "Đăng Ký"

### 7.2 Đăng nhập
1. Dùng email và mật khẩu vừa tạo
2. Nếu thành công, sẽ chuyển sang trang chủ

### 7.3 Xem khóa học
1. Vào "Trang Chủ" hoặc "Home"
2. Danh sách khóa học sẽ hiển thị

### 7.4 Kiểm tra backend API
Dùng tool như Postman hoặc curl kiểm tra:

```bash
# Lấy danh sách khóa học
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/courses

# Lấy thông tin user
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users
```

Thay `YOUR_TOKEN` bằng token JWT nhận được lúc đăng nhập.

---

## 📦 Bước 8: Build & Deploy

### 8.1 Build backend
```bash
npm --prefix backend run build
```
Sẽ kiểm tra TypeScript syntax. Nếu không lỗi, bạn có thể deploy.

### 8.2 Build frontend
```bash
npm --prefix frontend run build
```
Sẽ tạo thư mục `frontend/dist/` sẵn sàng deploy lên server tĩnh (Vercel, Netlify, S3, v.v.).

### 8.3 Chuẩn Bị Deploy EC2

**Backend trên EC2:**
1. SSH vào EC2 instance
2. Clone repository
3. Cài Node.js v18+
4. Chạy `npm --prefix backend install`
5. Tạo file `.env` (như Bước 2.2)
6. Chạy `npm --prefix backend run start` hoặc dùng PM2 để persist process

**Kết nối tới DB SQLite:**
- File DB sẽ ở `backend/data/learning_online.sqlite` trên server
- Đảm bảo thư mục `backend/data/` có quyền ghi

**Frontend (CD lên Vercel/Netlify):**
1. Push code lên GitHub
2. Connect repository với Vercel/Netlify
3. Set environment variable: `VITE_API_URL=https://your-backend-domain.com`
4. Deploy tự động

---

## 🔧 Troubleshooting (Khắc Phục Sự Cố)

### Backend không start
```
Error: Cannot find module 'sqlite3'
```
→ Chạy `npm --prefix backend install` lại

### Frontend không kết nối backend
```
CORS error: Access to XMLHttpRequest from origin has been blocked
```
→ Kiểm tra `FRONTEND_URL` ở backend `.env` khớp với frontend domain
→ Kiểm tra `VITE_API_URL` ở frontend `.env` trỏ đúng backend

### Port 3000/5173 đã bị dùng
```bash
# Thay port backend
PORT=3001 npm --prefix backend run start

# Thay port frontend
npm --prefix frontend run dev -- --port 5174
```

### Xóa toàn bộ cache, rebuild
```bash
# Xóa node_modules
rm -rf node_modules backend/node_modules frontend/node_modules

# Xóa database SQLite (sẽ mất dữ liệu!)
rm -rf backend/data/

# Cài lại
npm install
```

---

## 📝 Danh Sách Lệnh Thường Dùng

```bash
# Dev: Chạy cả backend + frontend
npm run dev

# Dev: Chạy backend riêng
npm --prefix backend run dev

# Dev: Chạy frontend riêng
npm --prefix frontend run dev

# Build: Check TypeScript backend
npm --prefix backend run build

# Build: Build frontend cho production
npm --prefix frontend run build

# Production: Chạy backend
npm --prefix backend run start

# Production: Preview build frontend
npm --prefix frontend run preview
```

---

## 🌐 Biến Môi Trường Tham Khảo

### Backend (backend/.env)
| Biến | Mô Tả | Mặc Định |
|------|--------|---------|
| SQLITE_DB_PATH | Đường dẫn file SQLite | ./data/learning_online.sqlite |
| PORT | Cổng server | 3000 |
| NODE_ENV | Chế độ (development/production) | development |
| JWT_SECRET | Khóa bí mật JWT | (bắt buộc phải set) |
| JWT_EXPIRE | Thời hạn token | 7d |
| FRONTEND_URL | Domain frontend (CORS) | http://localhost:5173 |

### Frontend (frontend/.env)
| Biến | Mô Tả | Mặc Định |
|------|--------|---------|
| VITE_API_URL | URL backend API | http://localhost:3000 |

---

## 📚 Tài Liệu Thêm

- [DEPLOYMENT_SPLIT.md](DEPLOYMENT_SPLIT.md) - Hướng dẫn deploy frontend/backend riêng biệt
- [ENROLLMENT_SYSTEM.md](ENROLLMENT_SYSTEM.md) - Chi tiết hệ thống ghi danh khóa học
- [backend/scripts/](backend/scripts/) - SQL scripts tham khảo

---

## ❓ Hỏi Đáp

**Q: Database ở đâu?**  
A: Tại `backend/data/learning_online.sqlite` trên máy local. Khi deploy, cần backup file này hoặc sử dụng database system khác.

**Q: Làm sao để reset database?**  
A: Xóa file `backend/data/learning_online.sqlite`, server sẽ tự tạo mới lần tiếp theo start.

**Q: Frontend/Backend chạy cùng cổng được không?**  
A: Không. Backend cần port 3000, frontend cần port 5173. Nếu bị conflict, thay port ở lệnh run.

**Q: Cách thay đổi JWT_SECRET?**  
A: Sửa giá trị trong `backend/.env`. Mỗi instance server nên có secret khác nhau.

---

**Cập nhật lần cuối**: 15 tháng 4 năm 2026

---

Chúc bạn chạy thành công! 🎉
