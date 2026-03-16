import connectDB from "../config/db";

const db = await connectDB();

export const listCourses = async () => {
    const [result]: any = await db.execute("SELECT courses.*,  users.id AS teacher_id,  users.name AS teacher_name,  users.email AS teacher_email FROM courses LEFT JOIN users ON courses.teacher_id = users.id");
    return result;
}