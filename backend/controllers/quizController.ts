import { Request, Response } from 'express';
import { findQuizById, findCorrectAnswers, saveQuizResult, findQuizByLessonId, getUserQuizStatus } from '../models/quizModel';

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: { id: number };
}

// Get a quiz by its ID, preparing it for a student to take
export const getQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const quizId = parseInt(req.params.id as string, 10);
    const quiz = await findQuizById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get quiz information by the lesson ID it belongs to
export const getQuizByLesson = async (req: AuthRequest, res: Response) => {
    try {
      const lessonId = parseInt(req.params.lessonId as string, 10);
      const quiz = await findQuizByLessonId(lessonId);
  
      if (!quiz) {
        // It's okay to not find a quiz, just return an empty object or null
        return res.status(200).json(null);
      }
  
      res.status(200).json(quiz);
    } catch (error) {
      console.error('Error fetching quiz by lesson:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

// Handle submission of a quiz, calculate score, and save the result
export const submitQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const quizId = parseInt(req.params.id as string, 10);
    const userId = req.user?.id;
    const userAnswers: { questionId: number, selectedOptionId: number }[] = req.body.answers;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!userAnswers || !Array.isArray(userAnswers)) {
        return res.status(400).json({ message: 'Invalid submission format' });
    }

    const correctAnswers = await findCorrectAnswers(quizId);
    
    let score = 0;
    const totalQuestions = correctAnswers.size;
    if (totalQuestions === 0) {
        return res.status(200).json({ score: 0, message: "Quiz has no questions.", results: {}, correctAnswers: {} });
    }

    userAnswers.forEach(answer => {
      if (correctAnswers.get(answer.questionId) === answer.selectedOptionId) {
        score++;
      }
    });

    const finalScore = (score / totalQuestions) * 100;

    await saveQuizResult(userId, quizId, finalScore);
    
    // Convert Map to object for JSON serialization
    const correctAnswersObj = Object.fromEntries(correctAnswers);

    res.status(200).json({
      message: 'Quiz submitted successfully!',
      score: finalScore,
      correctAnswers: correctAnswersObj,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkQuizStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const lessonId = parseInt(req.params.lessonId as string, 10);

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const PASSING_SCORE_THRESHOLD = 50; 

    const highestScore = await getUserQuizStatus(userId, lessonId);
    
    // Giả sử điểm >= 50 là qua môn (bạn có thể đổi thành 80 tùy logic dự án)
    const isPassed = highestScore !== null && highestScore >= PASSING_SCORE_THRESHOLD;

    res.status(200).json({
      hasAttempted: highestScore !== null,
      highestScore: highestScore,
      isPassed: isPassed
    });
  } catch (error) {
    console.error('Error checking quiz status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
