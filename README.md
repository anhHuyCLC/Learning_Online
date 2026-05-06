# 🎓 Nền Tảng Học Trực Tuyến (LMS) Tích Hợp Hệ Thống Gợi Ý Thông Minh

Đây là dự án Khóa Luận Tốt Nghiệp xây dựng một Hệ thống Quản lý Học tập (LMS - Learning Management System) toàn diện. Điểm nổi bật nhất của dự án là **Hệ thống Gợi ý Khóa học Lai (Hybrid Recommendation System)** dựa trên việc chấm điểm (Scoring) đa yếu tố và trích xuất đặc trưng người dùng/khóa học.

---

## 🌟 Tính Năng Nổi Bật

### 1. Hệ Thống Gợi Ý Khóa Học (Hybrid Recommendation Engine)
Được xây dựng với thuật toán phức tạp nhằm tối ưu hóa trải nghiệm học tập:
- **Trích xuất đặc trưng (Feature Extraction):** Tự động phân tích kỹ năng, tiến độ, và hành vi của học viên.
- **Tính điểm đa yếu tố (ML Scoring):** 
  - *Relevance (30%):* Độ phù hợp về kỹ năng và danh mục.
  - *Difficulty Match (20%):* Mức độ phù hợp giữa trình độ học viên và độ khó khóa học.
  - *Performance Potential (20%):* Tiềm năng hoàn thành dựa trên lịch sử học tập.
  - *Engagement (15%):* Đánh giá mức độ tương tác và thời gian cam kết.
  - *Popularity (15%):* Độ phổ biến và đánh giá từ cộng đồng.
- **A/B Testing & Feedback Loop:** Ghi nhận phản hồi (Click, Enroll, Rating) để tối ưu hóa và đánh giá mô hình phân phối nội dung.

### 2. Dành Cho Học Viên (Student)
- 📚 Khám phá và đăng ký hàng ngàn khóa học chất lượng.
- 🎥 Học tập qua video, quản lý tiến trình bài học trực quan.
- 📝 Tham gia làm bài kiểm tra (Quiz) để mở khóa bài học tiếp theo.
- 💳 Nạp tiền vào ví tự động 100% bằng mã QR ngân hàng (Tích hợp VietQR & Sepay Webhook).
- 🎯 Xem lộ trình học tập và các gợi ý khóa học được cá nhân hóa dựa trên sở thích (User Segment).

### 3. Dành Cho Giảng Viên (Teacher)
- 🛠 Tạo và quản lý nội dung khóa học, bài học, tài liệu.
- 📊 Bảng điều khiển (Dashboard) thống kê doanh thu, số lượng học viên, đánh giá.
- 👥 Theo dõi tiến độ học tập chi tiết của từng học viên trong lớp.

### 4. Dành Cho Quản Trị Viên (Admin)
- 📈 Thống kê toàn cảnh hệ thống (Tổng doanh thu, khóa học, người dùng).
- 👥 Quản lý người dùng, phân quyền (Admin, Teacher, Student).
- 🏷 Quản lý danh mục khóa học, phê duyệt giao dịch nạp tiền.

---

## 🛠 Công Nghệ Sử Dụng (Tech Stack)

### Frontend
- **Framework:** React.js + TypeScript
- **Build Tool:** Vite
- **State Management:** Redux Toolkit (Slices cho Auth, Courses, Enrollments, Quizzes...)
- **Routing:** React Router DOM
- **Styling:** CSS/CSS Modules

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL (sử dụng thư viện `mysql2/promise`)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **File Storage:** Xử lý upload file nội bộ với Multer (Static uploads)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu hệ thống
- Node.js (v16.x trở lên)
- MySQL Server đang chạy

### Bước 1: Cài đặt Database
1. Tạo một database mới trong MySQL (`lms_online_learning`).
2. Chạy file migrate để tạo các bảng liên quan đến hệ thống (đặc biệt là hệ thống gợi ý):
```bash
cd backend
npm run migrate # hoặc npx ts-node migrate.ts
```
*(Lưu ý: Hệ thống sẽ chạy script từ `scripts/create_recommendation_tables.sql` để khởi tạo database).*

### Bước 2: Cài đặt và cấu hình Backend
1. Di chuyển vào thư mục backend và cài đặt dependencies:
```bash
cd backend
npm install
```
2. Tạo file `.env` trong thư mục `backend` với nội dung sau:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lms_database
JWT_SECRET=your_jwt_secret_key

# Sepay & VietQR Configuration
BANK_ID=970422
ACCOUNT_NO=your_account_number
ACCOUNT_NAME=YOUR_NAME
SEPAY_WEBHOOK_SECRET=your_sepay_secret
```
3. Khởi động server:
```bash
npm run dev
```

### Bước 3: Cài đặt và cấu hình Frontend
1. Di chuyển vào thư mục frontend và cài đặt dependencies:
```bash
cd frontend
npm install
```
2. Tạo file `.env` trong thư mục `frontend` (nếu cần cấu hình URL API):
```env
VITE_API_URL=http://localhost:3000
```
3. Khởi động ứng dụng React:
```bash
npm run dev
```

---

## 📂 Kiến Trúc Mã Nguồn (Tham khảo)

```text
KLTN/Web/
├── backend/
│   ├── controllers/      # Xử lý logic Request/Response (Course, Auth, Recommend, Payment...)
│   ├── models/           # Truy vấn Database MySQL
│   ├── routes/           # Định tuyến API
│   ├── services/         # Chứa lõi thuật toán Machine Learning & Scoring cho hệ thống gợi ý
│   │   └── recommendation/ # HybridScoring, FeatureExtraction, HybridFeedback...
│   └── config/           # Cấu hình Database
├── frontend/
│   ├── src/
│   │   ├── app/          # Redux store configuration
│   │   ├── components/   # Các UI Component dùng chung (Card, Header, Modal...)
│   │   ├── features/     # Redux Slices (Logic quản lý trạng thái)
│   │   ├── pages/        # Các trang UI (Home, Dashboard, CourseDetail, Lesson...)
│   │   └── styles/       # CSS Files
└── README.md
```

---

## 📌 API Webhook Thanh Toán (Sepay)
Dự án sử dụng Sepay để lắng nghe giao dịch chuyển khoản. Khi có học viên quét mã QR thanh toán với nội dung `LMS{timestamp}`, webhook sẽ được gọi về `POST /api/transactions/sepay-webhook` để tự động cộng tiền vào ví người dùng.

---

## ✍️ Tác giả

- Được phát triển và thiết kế bởi **[Trịnh Duy Huy]**.

---

# 🚀 Hướng Dẫn Deploy Lên EC2 (Production)

Hướng dẫn này mặc định server là Ubuntu EC2. Backend Express/TypeScript chạy port `3000`, frontend Vite build ra static file và được Nginx serve qua HTTPS.

---

## 1. Chuẩn Bị EC2

Mở Security Group cho EC2:

- `22` để SSH
- `80` để Certbot xác thực domain
- `443` để chạy HTTPS
- `3000` chỉ cần mở nếu muốn test backend trực tiếp, còn bình thường Nginx sẽ proxy vào port này

SSH vào EC2:

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Cập nhật package và cài tool cần thiết:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl nginx mysql-client
```

---

## 2. Cài Node.js, npm và PM2

Khuyến nghị dùng Node.js 22 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Cài PM2 để giữ backend chạy nền:

```bash
sudo npm install -g pm2
pm2 -v
```

---

## 3. Pull Code Từ GitHub

```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/Learning_Online deploy
cd deploy
```

Lần sau update code:

```bash
cd /home/ubuntu/deploy
git pull
```

---

## 4. Cấu Hình Database & Test Login DB

Thông tin cần có:
- Host, User, Password, Database name
- Port mặc định: `3306`

Test kết nối DB từ EC2:

```bash
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME
```

Sau khi vào MySQL shell, kiểm tra:

```sql
SELECT DATABASE();
SHOW TABLES;
SELECT id, email, role FROM users LIMIT 5;
```

Nếu `SHOW TABLES;` trả về `Empty set` hoặc lệnh select báo lỗi, import schema:

```bash
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME < /home/ubuntu/deploy/backend/lms_online_learning.sql
```

Kiểm tra lại:

```sql
SHOW TABLES;
SELECT id, email, role FROM users LIMIT 5;
```

Tài khoản seed để test login:

```
admin@test.com / 123456
teacher@test.com / 123456
student@test.com / 123456
```

---

## 5. Cấu Hình Backend `.env`

```bash
cd /home/ubuntu/deploy/backend
nano .env
```

Nội dung:

```env
DB_HOST=iac-clc-test-mysql.cp0wkgkcmma8.ap-southeast-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=Trinhduyhuy123
DB_NAME=appdb
PORT=3000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
SEPAY_WEBHOOK_SECRET=trinhduyhuy-secret-key-19604
```

---

## 6. Cài Thư Viện Backend & Chạy Migration

```bash
cd /home/ubuntu/deploy/backend
npm ci
```

**Bắt buộc chạy migration lần đầu** để tạo các bảng recommendation + comment:

```bash
npx tsx migrate.ts
```

Kiểm tra không có lỗi TypeScript:

```bash
npx tsc --noEmit
```

Test chạy thử:

```bash
npx tsx app.ts
```

Nếu thấy `Server running on port 3000` là OK. Dừng `Ctrl + C`, rồi chạy bằng PM2:

```bash
pm2 start "npx tsx app.ts" --name learning-online-backend
pm2 save
pm2 startup
```

Lệnh `pm2 startup` sẽ in ra một lệnh `sudo ...`, copy lệnh đó chạy thêm một lần.

Kiểm tra backend:

```bash
curl http://localhost:3000/api/courses
pm2 logs learning-online-backend
```

---

## 7. Cấu Hình Nginx Backend-Only (awsv2)

```bash
sudo nano /etc/nginx/sites-available/learning-online-backend
```

Nội dung (thay `BACKEND_DOMAIN` bằng domain thật):

```nginx
server {
    listen 80;
    server_name BACKEND_DOMAIN;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Bật site và reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/learning-online-backend /etc/nginx/sites-enabled/learning-online-backend
sudo nginx -t
sudo systemctl reload nginx
```

Test domain HTTP trước khi xin cert:

```bash
curl http://BACKEND_DOMAIN/api/courses
```

Xin SSL cert:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d BACKEND_DOMAIN
sudo certbot renew --dry-run
```

---

## 8. Cấu Hình Frontend `.env` & Build (awsfe)

```bash
cd /home/ubuntu/deploy/frontend
nano .env
```

Nội dung:

```env
VITE_API_URL=https://khaihoanltd.com.vn
```

Cài thư viện và build:

```bash
npm ci
npm run build
```

Kết quả build nằm ở `frontend/dist`.

---

## 9. Cấu Hình Nginx Frontend + Backend Chung Domain (awsfe)

```bash
sudo nano /etc/nginx/sites-available/learning-online
```

Nội dung (thay `YOUR_DOMAIN`):

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN;

    client_max_body_size 20m;

    root /home/ubuntu/deploy/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Bật site:

```bash
sudo ln -s /etc/nginx/sites-available/learning-online /etc/nginx/sites-enabled/learning-online
sudo nginx -t
sudo systemctl reload nginx
```

Xin SSL cert:

```bash
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

---

## 10. Kiểm Tra Sau Deploy

Kiểm tra frontend:

```bash
curl https://YOUR_DOMAIN
```

Kiểm tra API:

```bash
curl https://YOUR_DOMAIN/api/courses
```

Test login:

```bash
curl -X POST https://YOUR_DOMAIN/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'
```

---

## 11. Deploy Update Lần Sau

```bash
cd /home/ubuntu/deploy
git pull

# Backend
cd backend
npm ci
npx tsc --noEmit
pm2 restart learning-online-backend

# Frontend (nếu awsfe)
cd ../frontend
npm ci
npm run build
sudo systemctl reload nginx
```

---

## 12. Debug Nhanh

```bash
# Backend
pm2 status
pm2 logs learning-online-backend
curl http://localhost:3000/api/courses

# Nginx
sudo nginx -t
sudo systemctl status nginx
sudo tail -n 100 /var/log/nginx/error.log

# Port
sudo ss -tulpn | grep -E ':80|:443|:3000'

# DB
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME

# Nếu 502 Bad Gateway
pm2 delete learning-online-backend
cd /home/ubuntu/deploy/backend
pm2 start ./node_modules/.bin/tsx --name learning-online-backend -- app.ts
pm2 save
curl http://127.0.0.1:3000/api/courses
```
- Đồ án Khóa Luận Tốt Nghiệp - Năm 2025/2026.