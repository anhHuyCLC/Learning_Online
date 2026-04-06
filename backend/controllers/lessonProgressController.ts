import { Request, Response } from 'express';
import LessonProgress from '../models/lessonProgressModel';

// We can extend the Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

export const updateLessonProgress = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { lessonId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (lessonId === undefined) {
    return res.status(400).json({ message: 'lessonId is required' });
  }

  try {
    // The model function now correctly uses the userId from the authenticated session
    await LessonProgress.markAsCompleted(userId, lessonId);
    res.status(200).json({ message: 'Lesson progress updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating lesson progress', error });
  }
};

export const getLessonProgressForCourse = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { courseId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const progress: any = await LessonProgress.getProgressForCourse(userId, Number(courseId));
    const completedLessonIds = Array.isArray(progress) ? progress.map((p: { lesson_id: number }) => p.lesson_id) : [];
    res.status(200).json(completedLessonIds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user progress', error });
  }
};
