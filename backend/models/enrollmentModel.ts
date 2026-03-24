import connectDB from "../config/db";

const db = await connectDB();

// Get all enrollments for a user
export const getUserEnrollments = async (userId: number) => {
    const [result]: any = await db.execute(
        `SELECT 
            e.id,
            e.user_id,
            e.course_id,
            e.enrolled_at,
            e.progress,
            e.status,
            c.id as course_id,
            c.title as course_name,
            c.description as course_description,
            c.price as course_price,
            c.image as course_image,
            c.teacher_id,
            u.name as teacher_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON c.teacher_id = u.id
        WHERE e.user_id = ? AND e.status = 'active'
        ORDER BY e.enrolled_at DESC`,
        [userId]
    );
    return result;
};

// Get enrollment by user and course (any status)
export const getAnyEnrollmentByUserAndCourse = async (userId: number, courseId: number) => {
    const [result]: any = await db.execute(
        `SELECT * FROM enrollments 
        WHERE user_id = ? AND course_id = ?
        ORDER BY id DESC LIMIT 1`,
        [userId, courseId]
    );
    return result[0] || null;
};

// Get enrollment by user and course (active only)
export const getEnrollmentByUserAndCourse = async (userId: number, courseId: number) => {
    const [result]: any = await db.execute(
        `SELECT * FROM enrollments 
        WHERE user_id = ? AND course_id = ? AND status = 'active'`,
        [userId, courseId]
    );
    return result;
};

// Create enrollment
export const createEnrollment = async (userId: number, courseId: number) => {
    const [result]: any = await db.execute(
        `INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, status) 
        VALUES (?, ?, NOW(), 0, 'active')`,
        [userId, courseId]
    );
    return result;
};

// Re-activate cancelled enrollment (for re-enrollment)
export const reactivateEnrollment = async (userId: number, courseId: number) => {
    const [result]: any = await db.execute(
        `UPDATE enrollments SET status = 'active', progress = 0, enrolled_at = NOW()
        WHERE user_id = ? AND course_id = ? AND status = 'cancelled'`,
        [userId, courseId]
    );
    return result;
};

// Delete enrollment
export const deleteEnrollment = async (userId: number, courseId: number) => {
    const [result]: any = await db.execute(
        `UPDATE enrollments SET status = 'cancelled' 
        WHERE user_id = ? AND course_id = ?`,
        [userId, courseId]
    );
    return result;
};

// Get enrollment count for a course
export const getCourseEnrollmentCount = async (courseId: number) => {
    const [result]: any = await db.execute(
        `SELECT COUNT(*) as count FROM enrollments 
        WHERE course_id = ? AND status = 'active'`,
        [courseId]
    );
    return result[0]?.count || 0;
};

// Update enrollment progress
export const updateEnrollmentProgress = async (
    userId: number,
    courseId: number,
) => {
    const [result]: any = await db.execute(
        `UPDATE enrollments e
        JOIN (
            SELECT 
                p.user_id, 
                l.course_id,
                (SUM(p.completed) * 100.0 / total_stats.total_lessons) AS calculated_progress
            FROM progress p
            JOIN lessons l ON p.lesson_id = l.id
            JOIN (
                SELECT course_id, COUNT(*) AS total_lessons
                FROM lessons
                WHERE course_id = ?
            ) total_stats ON l.course_id = total_stats.course_id
            WHERE p.user_id = ? AND l.course_id = ?
            GROUP BY p.user_id, l.course_id
        ) AS summary ON e.user_id = summary.user_id AND e.course_id = summary.course_id
        SET 
            e.progress = summary.calculated_progress,
            e.status = CASE WHEN summary.calculated_progress >= 100 THEN 'completed' ELSE 'active' END
        WHERE e.user_id = ? AND e.course_id = ? AND e.status != 'cancelled'`,
        [courseId, userId, courseId, userId, courseId]
    );
    return result;
};

// Mark course as completed
export const completeEnrollment = async (userId: number, courseId: number) => {
    const [result]: any = await db.execute(
        `UPDATE enrollments SET progress = 100, status = 'completed' 
        WHERE user_id = ? AND course_id = ?`,
        [userId, courseId]
    );
    return result;
};

// Get all enrollments for admin view
export const getAllEnrollments = async () => {
    const [result]: any = await db.execute(
        `SELECT 
            e.id,
            e.user_id,
            e.course_id,
            e.enrolled_at,
            e.progress,
            e.status,
            u.name as user_name,
            u.email as user_email,
            c.name as course_name
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enrolled_at DESC`
    );
    return result;
};
