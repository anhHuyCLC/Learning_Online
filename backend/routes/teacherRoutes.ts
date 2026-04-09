import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Giả sử bạn có middleware này
import { getTeacherDashboard, getMyCourseStudents, getMyCourseStatistics } from '../controllers/teacherController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', getTeacherDashboard);
router.get('/courses/:courseId/students', getMyCourseStudents);
router.get('/courses/:courseId/statistics', getMyCourseStatistics);

export default router;