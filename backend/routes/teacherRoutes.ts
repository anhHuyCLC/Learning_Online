import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Giả sử bạn có middleware này
import { getTeacherDashboard, getMyCourseStudents, getMyCourseStatistics } from '../controllers/teacherController.js';

const router = express.Router();

// Tất cả các route trong file này đều yêu cầu đăng nhập
router.use(authMiddleware);

// Các route này gọi đến các hàm trong teacherController đã tạo ở bước trước
router.get('/dashboard', getTeacherDashboard);
router.get('/courses/:courseId/students', getMyCourseStudents);
router.get('/courses/:courseId/statistics', getMyCourseStatistics);

export default router;