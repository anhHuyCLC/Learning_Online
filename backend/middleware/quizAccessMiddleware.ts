import { Request, Response, NextFunction } from 'express';
import Progress from '../models/lessonProgressModel';

interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export const checkQuizAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const lessonId = parseInt(req.params.lessonId as string, 10);

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (isNaN(lessonId)) {
    return res.status(400).json({ message: 'Invalid lesson ID' });
  }

  try {
    const isCompleted = await Progress.isLessonCompleted(userId, lessonId);
    if (isCompleted) {
      return next(); // Lesson is completed, allow access to quiz
    } else {
      return res.status(403).json({ message: 'You must complete the lesson before taking the quiz.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error checking quiz access', error });
  }
};
