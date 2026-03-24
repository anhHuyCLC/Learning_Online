
import express from 'express';
import { getQuiz, submitQuiz, getQuizByLesson } from '../controllers/quizController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Route to get a quiz by its lesson ID
router.get('/lesson/:lessonId', authMiddleware, getQuizByLesson);

// Route to get a quiz by its ID
router.get('/:id', authMiddleware, getQuiz);

// Route to submit a quiz
router.post('/:id/submit', authMiddleware, submitQuiz);

export default router;
