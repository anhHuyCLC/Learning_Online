import express from 'express';
import { getLessonComments, postLessonComment, getTeacherPendingQuestions, removeComment } from '../controllers/commentController';
import { authMiddleware } from '../middleware/authMiddleware'; 

const router = express.Router();

// Lấy danh sách bình luận của bài học (Học viên & Giáo viên)
router.get('/lessons/:id/comments', authMiddleware, getLessonComments);

// Gửi bình luận / câu hỏi mới (Học viên & Giáo viên)
router.post('/lessons/:id/comments', authMiddleware, postLessonComment);

// Lấy danh sách câu hỏi đang chờ trả lời (Chỉ dành cho Giáo viên)
router.get('/teacher/pending-questions', authMiddleware, getTeacherPendingQuestions);

// Xóa bình luận
router.delete('/comments/:id', authMiddleware, removeComment);

export default router;