import { Router } from 'express';
import { updateLessonProgress, getLessonProgressForCourse } from '../controllers/lessonProgressController';
import { authMiddleware as protect} from '../middleware/authMiddleware';

const router = Router();

// @route   POST /api/progress
// @desc    Mark a lesson as completed for the logged-in user
// @access  Private
router.post('/', protect, updateLessonProgress);

// @route   GET /api/progress/:courseId
// @desc    Get the completed lessons for a user in a specific course
// @access  Private
router.get('/:courseId', protect, getLessonProgressForCourse);

export default router;
