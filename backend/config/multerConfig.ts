import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Đường dẫn lưu ảnh thumbnail của khóa học.
// Sử dụng path.resolve() để tạo đường dẫn tuyệt đối từ thư mục gốc của project (backend),
// tránh các vấn đề với thư mục `dist` khi build TypeScript.
const UPLOAD_DIR = path.resolve('uploads', 'courses');

// Đảm bảo thư mục uploads/courses tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Chỉ chấp nhận các loại file ảnh
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // Giới hạn 5MB

export default upload;