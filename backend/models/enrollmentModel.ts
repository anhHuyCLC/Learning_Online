import connectDB from "../config/db";

const db = await connectDB();

// Get all enrollments for a user
export const getUserEnrollments = async (userId: number) => {
    const [result]: any = await db.execute(
        `WITH ProgressCTE AS (
            SELECT
                e.id as enrollment_id,
                COALESCE(
                    ROUND( -- Thêm ROUND vào đây
                        (
                            SELECT COUNT(DISTINCT p.lesson_id)
                            FROM progress p
                            INNER JOIN lessons l ON p.lesson_id = l.id
                            WHERE p.user_id = e.user_id AND l.course_id = e.course_id AND p.completed = 1
                        ) * 100.0 / NULLIF((SELECT COUNT(*) FROM lessons WHERE course_id = e.course_id), 0),
                    0), -- Làm tròn 0 chữ số thập phân
                0) as calculated_progress
            FROM enrollments e
        )
        SELECT
            e.id,
            e.user_id,
            e.course_id,
            e.enrolled_at,
            c.id as course_id,
            COALESCE(c.title, c.name) as course_name,
            c.description as course_description,
            c.price as course_price,
            c.image as course_image,
            c.teacher_id,
            u.name as teacher_name,
            pcte.calculated_progress as progress,
            CASE
                WHEN pcte.calculated_progress >= 100 THEN 'completed'
                ELSE e.status
            END as status
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON c.teacher_id = u.id
        JOIN ProgressCTE pcte ON pcte.enrollment_id = e.id
        WHERE e.user_id = ? AND e.status != 'cancelled'
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
export const createEnrollment = async (
    userId: number,
    courseId: number,
    connection: { execute: (sql: string, params?: any[]) => Promise<any> } = db
) => {
    const [result]: any = await connection.execute(
        `INSERT INTO enrollments (user_id, course_id, enrolled_at, status) 
        VALUES (?, ?, CURRENT_TIMESTAMP, 'active')`,
        [userId, courseId]
    );
    return result;
};

// Re-activate cancelled enrollment (for re-enrollment)
export const reactivateEnrollment = async (userId: number, courseId: number) => {
    const [result]: any = await db.execute(
        `UPDATE enrollments SET status = 'active', enrolled_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND course_id = ? AND status = 'cancelled'`,
        [userId, courseId]
    );
    return result;
};

// Re-enroll in a course
export const reEnroll = async (userId: number, courseId: number) => {
    const [result]: any = await db.execute(
        `UPDATE enrollments SET status = 'active', enrolled_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND course_id = ?`,
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





// Get all enrollments for admin view
export const getAllEnrollments = async () => {
    const [result]: any = await db.execute(
        `WITH ProgressCTE AS (
            SELECT
                e.id as enrollment_id,
                COALESCE(
                    (
                        SELECT COUNT(DISTINCT p.lesson_id)
                        FROM progress p
                        INNER JOIN lessons l ON p.lesson_id = l.id
                        WHERE p.user_id = e.user_id AND l.course_id = e.course_id AND p.completed = 1
                    ) * 100.0 / NULLIF((SELECT COUNT(*) FROM lessons WHERE course_id = e.course_id), 0),
                0) as calculated_progress
            FROM enrollments e
        )
        SELECT 
            e.id,
            e.user_id,
            e.course_id,
            e.enrolled_at,
            u.name as user_name,
            u.email as user_email,
            COALESCE(c.title, c.name) as course_name,
            pcte.calculated_progress as progress,
            CASE
                WHEN pcte.calculated_progress >= 100 THEN 'completed'
                ELSE e.status
            END as status
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        JOIN courses c ON e.course_id = c.id
        JOIN ProgressCTE pcte ON pcte.enrollment_id = e.id
        ORDER BY e.enrolled_at DESC`
    );
    return result;
};
