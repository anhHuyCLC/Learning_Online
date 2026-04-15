import connectDB from '../config/db';

const db = await connectDB();


const Progress = {
  markAsCompleted: async (userId: number, lessonId: number) => {
    const sql = `
      INSERT INTO progress (user_id, lesson_id, completed, completion_percentage, completed_at)
      VALUES (?, ?, 1, 100.00, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, lesson_id) DO UPDATE SET
        completed = 1,
        completion_percentage = 100.00,
        completed_at = CURRENT_TIMESTAMP
    `;
    try {
      const [result] = await db.execute(sql, [userId, lessonId]);
      return result;
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      throw error;
    }
  },

  isLessonCompleted: async (userId: number, lessonId: number): Promise<boolean> => {
    const sql = 'SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND lesson_id = ? AND completed = 1';
    try {
      const [rows] = await db.execute(sql, [userId, lessonId]) as any[];
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking lesson completion:', error);
      throw error;
    }
  },

  getProgressForCourse: async (userId: number, courseId: number) => {
    const sql = `
      SELECT p.lesson_id 
      FROM progress p
      JOIN lessons l ON p.lesson_id = l.id
      WHERE p.user_id = ? AND l.course_id = ?
    `;
    try {
      const [rows] = await db.execute(sql, [userId, courseId]);
      return rows;
    } catch (error) {
      console.error('Error getting course progress:', error);
      throw error;
    }
  },

  deleteProgressForCourse: async (userId: number, courseId: number) => {
    const sql = `
      DELETE FROM progress
      WHERE user_id = ?
        AND lesson_id IN (
          SELECT id FROM lessons WHERE course_id = ?
        )
    `;
    try {
      const [result] = await db.execute(sql, [userId, courseId]);
      return result;
    } catch (error) {
      console.error('Error deleting course progress:', error);
      throw error;
    }
  }
};

export default Progress;

