import {listCourses} from "../models/courseModel";
import connectDB from "../config/db";


export const getCourses = async (req: any, res: any): Promise<void> => {
    try {
        const courses = await listCourses();
        res.status(200).json({
            success: true,
            message: "Lấy danh sách khóa học thành công",
            courses
        });
    } catch (error) {
        console.error("Get courses error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

export const getCourseById = async (req: any, res: any): Promise<void> => {
    try {
        const { id } = req.params;
        const db = await connectDB();
        const [courses]: any = await db.execute("SELECT courses.*, users.id AS teacher_id, users.name AS teacher_name FROM courses LEFT JOIN users ON courses.teacher_id = users.id WHERE courses.id = ?", [id]);
        
        if (courses.length === 0) {
            res.status(404).json({
                success: false,
                message: "Khóa học không tồn tại"
            });
            return;
        }

        const course = courses[0];

        // Fetch lessons for the course and check if a quiz exists for each lesson
        const [lessons]: any = await db.execute(
            `SELECT l.id, l.title, l.lesson_order, q.id IS NOT NULL AS has_quiz 
             FROM lessons l
             LEFT JOIN quizzes q ON l.id = q.lesson_id
             WHERE l.course_id = ?
             ORDER BY l.lesson_order`,
            [id]
        );

        course.lessons = lessons;
        
        res.status(200).json({
            success: true,
            message: "Lấy khóa học thành công",
            course: course
        });
    } catch (error) {
        console.error("Get course error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

export const createCourse = async (req: any, res: any): Promise<void> => {
    try {
        const { name, description, price, instructor_id } = req.body;
        
        if (!name || !description) {
            res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ thông tin"
            });
            return;
        }
        
        const db = await connectDB();
        await db.execute(
            "INSERT INTO courses (name, description, price, instructor_id, created_at) VALUES (?, ?, ?, ?, NOW())",
            [name, description, price || 0, instructor_id || null]
        );
        
        res.status(201).json({
            success: true,
            message: "Tạo khóa học thành công"
        });
    } catch (error) {
        console.error("Create course error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

export const updateCourse = async (req: any, res: any): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;
        
        const db = await connectDB();
        await db.execute(
            "UPDATE courses SET name = ?, description = ?, price = ? WHERE id = ?",
            [name, description, price, id]
        );
        
        res.status(200).json({
            success: true,
            message: "Cập nhật khóa học thành công"
        });
    } catch (error) {
        console.error("Update course error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

export const deleteCourse = async (req: any, res: any): Promise<void> => {
    try {
        const { id } = req.params;
        
        const db = await connectDB();
        await db.execute("DELETE FROM courses WHERE id = ?", [id]);
        
        res.status(200).json({
            success: true,
            message: "Xóa khóa học thành công"
        });
    } catch (error) {
        console.error("Delete course error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};