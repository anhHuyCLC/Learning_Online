
import express from 'express';
import { getQuiz, submitQuiz, getQuizByLesson, checkQuizStatus } from '../controllers/quizController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkQuizAccess } from '../middleware/quizAccessMiddleware';

const router = express.Router();

// Route to get a quiz by its lesson ID
router.get('/lesson/:lessonId', authMiddleware, checkQuizAccess, getQuizByLesson);

// Route to get a quiz by its ID
router.get('/:id', authMiddleware, getQuiz);

// Route to submit a quiz
router.post('/:id/submit', authMiddleware, submitQuiz);

router.get('/lesson/:lessonId/status', authMiddleware, checkQuizStatus);

export default router;
