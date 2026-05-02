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
- Đồ án Khóa Luận Tốt Nghiệp - Năm 2025/2026.