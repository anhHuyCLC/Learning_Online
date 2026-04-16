import connectDB from "../config/db";

// Find a quiz by its ID, including questions and options (without correct answers)
export const findQuizById = async (quizId: number) => {
  const db: any = await connectDB();
  const [quizResult]: any = await db.execute(
    "SELECT id, title FROM quizzes WHERE id = ?",
    [quizId]
  );
  const quiz = quizResult[0];

  if (!quiz) {
    return null;
  }

  const [questions]: any = await db.execute(
    "SELECT id, content FROM questions WHERE quiz_id = ?",
    [quizId]
  );

  for (const question of questions) {
    const [options]: any = await db.execute(
      "SELECT id, content FROM question_options WHERE question_id = ?",
      [question.id]
    );
    question.options = options;
  }

  quiz.questions = questions;
  return quiz;
};

// Find the correct answers for a given quiz to calculate the score
export const findCorrectAnswers = async (quizId: number) => {
  const db: any = await connectDB();
  const [answers]: any = await db.execute(`
    SELECT q.id as question_id, qo.id as correct_option_id
    FROM questions q
    JOIN question_options qo ON q.id = qo.question_id
    WHERE q.quiz_id = ? AND qo.is_correct = 1
  `, [quizId]);
  
  // Convert array of objects to a map for easy lookup
  const answerMap = new Map<number, number>();
  answers.forEach((row: { question_id: number; correct_option_id: number }) => {
    answerMap.set(row.question_id, row.correct_option_id);
  });

  return answerMap;
};

// Save a user's quiz result to the database
export const saveQuizResult = async (userId: number, quizId: number, score: number) => {
  const db: any = await connectDB();
  const [result] = await db.execute(
    "INSERT INTO user_quiz_results (user_id, quiz_id, score, taken_at) VALUES (?, ?, ?, ?)",
    [userId, quizId, score, new Date()]
  );
  return result;
};

// Find a quiz associated with a lesson, including its questions and options
export const findQuizByLessonId = async (lessonId: number) => {
  const db: any = await connectDB();
  const [quizRows]: any = await db.execute(
    'SELECT id, title, lesson_id FROM quizzes WHERE lesson_id = ?',
    [lessonId]
  );

  const quiz = quizRows[0];

  if (!quiz) {
    return null;
  }

  const [questions]: any = await db.execute(
    'SELECT id, content, question_type FROM questions WHERE quiz_id = ?',
    [quiz.id]
  );

  for (const question of questions) {
    const [options]: any = await db.execute(
      'SELECT id, content FROM question_options WHERE question_id = ?',
      [question.id]
    );
    question.options = options;
  }

  quiz.questions = questions;
  return quiz;
};

export const getUserQuizStatus = async (userId: number, lessonId: number) => {
  const db: any = await connectDB();
  const [rows]: any = await db.execute(`
    SELECT MAX(uqr.score) as highest_score
    FROM user_quiz_results uqr
    JOIN quizzes q ON uqr.quiz_id = q.id
    WHERE uqr.user_id = ? AND q.lesson_id = ?
  `, [userId, lessonId]);
  
  return rows[0]?.highest_score ?? null;
};
