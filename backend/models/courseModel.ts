import connectDB from "../config/db";

export const listCourses = async () => {
    const db: any = await connectDB();
    const [result]: any = await db.execute("SELECT courses.*,  users.id AS teacher_id,  users.name AS teacher_name,  users.email AS teacher_email FROM courses LEFT JOIN users ON courses.teacher_id = users.id");
    return result;
}
export const listCoursesByTeacher = async (teacherId: number) => {
    const db: any = await connectDB();
    const [result]: any = await db.execute(
        `SELECT c.*, 
                u.name AS teacher_name, 
                (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status != 'cancelled') as enrollment_count
         FROM courses c
         LEFT JOIN users u ON c.teacher_id = u.id 
         WHERE c.teacher_id = ?`, 
        [teacherId]
    );
    return result;
}