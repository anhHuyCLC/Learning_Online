import { listCourses, listCoursesByTeacher } from "../models/courseModel";
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
            `SELECT l.id, l.title, l.lesson_order, l.video_url, q.id IS NOT NULL AS has_quiz 
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
        const { name, description, price } = req.body;
        const teacherId = req.user.id;
        const userRole = req.user.role;
        const imagePath = req.file ? `/${req.file.path.replace(/\\/g, "/")}` : null;
        
        if (!name || !description) {
            res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ thông tin"
            });
            return;
        }

        if (userRole !== 'teacher' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Chỉ giáo viên hoặc admin mới có thể tạo khóa học"
            });
        }
        
        const db = await connectDB();
        await db.execute(
            "INSERT INTO courses (name, description, price, teacher_id, image, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
            [name, description, price || 0, teacherId, imagePath]
        );

        const [newCourse]: any = await db.execute("SELECT * FROM courses WHERE id = LAST_INSERT_ID()");
        
        res.status(201).json({
            success: true,
            message: "Tạo khóa học thành công",
            course: newCourse[0]
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
        const userId = req.user.id;
        const userRole = req.user.role;
        const imagePath = req.file ? `/${req.file.path.replace(/\\/g, "/")}` : null;
        
        const db = await connectDB();

        // Xác minh quyền sở hữu hoặc vai trò admin
        const [courses]: any = await db.execute("SELECT teacher_id FROM courses WHERE id = ?", [id]);
        if (courses.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
        }

        const course = courses[0];
        if (course.teacher_id !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền cập nhật khóa học này"
            });
        }

        // Build the query dynamically
        let query = "UPDATE courses SET name = ?, description = ?, price = ?";
        const params: (string | number | null)[] = [name, description, price];

        if (imagePath) {
            query += ", image = ?";
            params.push(imagePath);
        }

        query += " WHERE id = ?";
        params.push(id);

        await db.execute(query, params);
        
        res.status(200).json({
            success: true,
            message: "Cập nhật khóa học thành công",
            course: { id, name, description, price, image: imagePath || course.image }
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
        const userId = req.user.id;
        const userRole = req.user.role;
        
        const db = await connectDB();

        // Xác minh quyền sở hữu hoặc vai trò admin
        const [courses]: any = await db.execute("SELECT teacher_id FROM courses WHERE id = ?", [id]);
        if (courses.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
        }

        const course = courses[0];
        if (course.teacher_id !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xóa khóa học này"
            });
        }

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

export const getLessonById = async (req: any, res: any): Promise<void> => {
    try {
        const { lessonId } = req.params;
        const db = await connectDB();
        const [lessons]: any = await db.execute("SELECT * FROM lessons WHERE id = ?", [lessonId]);

        if (lessons.length === 0) {
            res.status(404).json({
                success: false,
                message: "Bài học không tồn tại"
            });
            return;
        }

        const lesson = lessons[0];

        res.status(200).json({
            success: true,
            message: "Lấy bài học thành công",
            lesson: lesson
        });
    } catch (error) {
        console.error("Get lesson error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

export const getTeacherCourses = async (req: any, res: any): Promise<void> => {
    try {
        // req.user được middleware authMiddleware giải mã từ token
        const teacherId = req.user.id; 

        if (!teacherId) {
            res.status(401).json({
                success: false,
                message: "Không tìm thấy thông tin giảng viên từ token"
            });
            return;
        }

        const courses = await listCoursesByTeacher(teacherId);
        res.status(200).json({
            success: true,
            message: "Lấy danh sách khóa học của giảng viên thành công",
            courses // Hoặc tùy cấu trúc trả về bạn mong muốn
        });
    } catch (error) {
        console.error("Get teacher courses error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// --- Lesson Management ---

export const createLesson = async (req: any, res: any) => {
    try {
        const { courseId } = req.params;
        const { title, video_url } = req.body;
        const teacherId = req.user.id;

        // Verify teacher owns the course
        const db = await connectDB();
        const [courses]: any = await db.execute("SELECT id FROM courses WHERE id = ? AND teacher_id = ?", [courseId, teacherId]);
        if (courses.length === 0) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Get the next lesson order
        const [orderRows]: any = await db.execute("SELECT MAX(lesson_order) as max_order FROM lessons WHERE course_id = ?", [courseId]);
        const lesson_order = (orderRows[0].max_order || 0) + 1;

        const [result]: any = await db.execute(
            "INSERT INTO lessons (course_id, title, video_url, lesson_order) VALUES (?, ?, ?, ?)",
            [courseId, title, video_url, lesson_order]
        );

        res.status(201).json({ success: true, data: { id: result.insertId, title, video_url, lesson_order } });
    } catch (error) {
        console.error("Create lesson error:", error);
        res.status(500).json({ success: false, message: "Error creating lesson" });
    }
};

export const updateLesson = async (req: any, res: any) => {
    try {
        const { lessonId } = req.params;
        const { title, video_url } = req.body;
        const teacherId = req.user.id;

        // Verify teacher owns the course this lesson belongs to
        const db = await connectDB();
        const [lessons]: any = await db.execute(`
            SELECT l.id FROM lessons l JOIN courses c ON l.course_id = c.id 
            WHERE l.id = ? AND c.teacher_id = ?`, [lessonId, teacherId]);
        if (lessons.length === 0) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await db.execute("UPDATE lessons SET title = ?, video_url = ? WHERE id = ?", [title, video_url, lessonId]);
        res.json({ success: true, message: "Lesson updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating lesson" });
    }
};

export const deleteLesson = async (req: any, res: any) => {
    try {
        const { lessonId } = req.params;
        const teacherId = req.user.id;

        // Verify teacher owns the course this lesson belongs to
        const db = await connectDB();
        const [lessons]: any = await db.execute(`
            SELECT l.id FROM lessons l JOIN courses c ON l.course_id = c.id 
            WHERE l.id = ? AND c.teacher_id = ?`, [lessonId, teacherId]);
        if (lessons.length === 0) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await db.execute("DELETE FROM lessons WHERE id = ?", [lessonId]);
        res.json({ success: true, message: "Lesson deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting lesson" });
    }
};
