import connectDB from '../config/db';

export const getCommentsByLesson = async (lessonId: number) => {
    const pool: any = await connectDB();
    const [rows] = await pool.execute(`
        SELECT c.*, u.name as user_name, u.role 
        FROM lesson_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.lesson_id = ?
        ORDER BY c.created_at ASC
    `, [lessonId]);
    return rows;
};

export const createComment = async (lessonId: number, userId: number, parentId: number | null, content: string) => {
    const pool: any = await connectDB();
    const [result] = await pool.execute(`
        INSERT INTO lesson_comments (lesson_id, user_id, parent_id, content)
        VALUES (?, ?, ?, ?)
    `, [lessonId, userId, parentId, content]);
    return result.insertId;
};

export const getPendingQuestions = async (teacherId: number) => {
    const pool: any = await connectDB();
    const [rows] = await pool.execute(`
        SELECT c.*, u.name as user_name, l.title as lesson_title, cr.title as course_title
        FROM lesson_comments c
        JOIN users u ON c.user_id = u.id
        JOIN lessons l ON c.lesson_id = l.id
        JOIN courses cr ON l.course_id = cr.id
        WHERE cr.teacher_id = ? 
          AND c.parent_id IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM lesson_comments r 
              JOIN users ru ON r.user_id = ru.id 
              WHERE r.parent_id = c.id AND ru.role = 'teacher'
          )
        ORDER BY c.created_at DESC
    `, [teacherId]);
    return rows;
};

export const getCommentById = async (commentId: number) => {
    const pool: any = await connectDB();
    const [rows] = await pool.execute(`SELECT * FROM lesson_comments WHERE id = ?`, [commentId]);
    return rows[0];
};

export const deleteComment = async (commentId: number) => {
    const pool: any = await connectDB();
    await pool.execute(`DELETE FROM lesson_comments WHERE id = ?`, [commentId]);
};