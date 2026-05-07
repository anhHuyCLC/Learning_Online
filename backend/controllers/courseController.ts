import { listCourses, listCoursesByTeacher } from "../models/courseModel";
import connectDB from "../config/db";
import fs from 'fs';
import path from 'path';


export const getCourses = async (req: any, res: any): Promise<void> => {
    try {
        const courses = await listCourses();
        
        res.status(200).json({
            success: true,
            message: "Lấy danh sách khóa học thành công",
            courses: courses
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
            `SELECT l.id, l.title, l.content, l.duration, l.lesson_order, l.video_url, q.id IS NOT NULL AS has_quiz 
             FROM lessons l
             LEFT JOIN quizzes q ON l.id = q.lesson_id
             WHERE l.course_id = ?
             ORDER BY l.lesson_order`,
            [id]
        );

        course.lessons = lessons;
        
        // 1. Lấy tổng số học viên đăng ký (student_count)
        const [enrollmentStats]: any = await db.execute(
            "SELECT COUNT(*) as student_count FROM enrollments WHERE course_id = ?", [id]
        );
        course.student_count = enrollmentStats[0].student_count || 0;

        // 2. Lấy điểm đánh giá trung bình và tổng số lượt đánh giá
        const [reviewStats]: any = await db.execute(
            "SELECT AVG(rating) as avg_rating, COUNT(id) as review_count FROM reviews WHERE course_id = ?", [id]
        );
        course.avg_rating = reviewStats[0].avg_rating ? Number(reviewStats[0].avg_rating).toFixed(1) : "0.0";
        course.review_count = reviewStats[0].review_count || 0;

        // 3. Lấy danh sách 10 đánh giá mới nhất để hiển thị
        const [reviews]: any = await db.execute(
            "SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.course_id = ? ORDER BY r.created_at DESC LIMIT 10", [id]
        );
        course.reviews = reviews;

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
        const { title, description, price, duration, detail_description, image, category_id } = req.body;
        const teacherId = req.user.id;
        const userRole = req.user.role;
    
        let imagePath = image || null; // Lấy URL từ form nếu có
        // Nếu có file được upload, ưu tiên sử dụng đường dẫn của file đó
        if (req.file) {
            // Đường dẫn tương đối để lưu vào DB và truy cập từ frontend
            imagePath = `/uploads/courses/${req.file.filename}`;
        }

        
        if (!title || !description) {
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
        
        // Ép kiểu an toàn các trường số để tránh lỗi MySQL Incorrect integer/decimal value
        const parsedPrice = price ? Number(price) : 0;
        const parsedDuration = duration ? Number(duration) : 0;
        const parsedCategoryId = (category_id && category_id !== "null" && category_id !== "undefined" && !isNaN(Number(category_id))) ? Number(category_id) : null;

        await db.execute(
            "INSERT INTO courses (title, description, detail_description, price, duration, teacher_id, category_id, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
            [title, description, detail_description || null, parsedPrice, parsedDuration, teacherId, parsedCategoryId, imagePath]
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
    const { title, description, price, duration, image, detail_description, category_id } = req.body;

    const userId = req.user.id;
    const userRole = req.user.role;

    const db = await connectDB();

    // Check course tồn tại
    const [courses]: any = await db.execute(
      "SELECT teacher_id, image FROM courses WHERE id = ?",
      [id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khóa học",
      });
    }

        const course = courses[0];

        // Check quyền
    if (course.teacher_id !== userId && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật khóa học này",
      });
    }

    // Xử lý ảnh
    let imagePath = course.image;

    // 1. Nếu có file mới được upload, cập nhật đường dẫn và xóa ảnh cũ
    if (req.file) {
      imagePath = `/uploads/courses/${req.file.filename}`;
      // Xóa ảnh cũ nếu có và là ảnh do hệ thống upload
      if (course.image && course.image.startsWith('/uploads')) {
        // path.resolve sẽ tạo đường dẫn tuyệt đối từ thư mục chạy server (backend root)
        const oldImageFilePath = path.resolve(course.image.substring(1));
        if (fs.existsSync(oldImageFilePath)) {
          fs.unlink(oldImageFilePath, (err) => {
            if (err) console.error("Lỗi khi xóa ảnh cũ:", err);
          });
        }
      }
    } 
    // 2. Nếu không có file mới, nhưng trường image là chuỗi rỗng/null, nghĩa là người dùng muốn xóa ảnh
    else if (image === '' || image === null || image === 'null' || image === 'undefined') {
      imagePath = null;
      if (course.image && course.image.startsWith('/uploads')) {
        const oldImageFilePath = path.resolve(course.image.substring(1));
        if (fs.existsSync(oldImageFilePath)) {
          fs.unlink(oldImageFilePath, (err) => {
            if (err) console.error("Lỗi khi xóa ảnh cũ:", err);
          });
        }
      }
    } else if (image) { // 3. Nếu không có file mới, nhưng có URL ảnh (có thể là URL cũ hoặc URL mới từ input text)
      imagePath = image;
    }

    // Update DB
    // Ép kiểu an toàn
    const parsedPrice = price ? Number(price) : 0;
    const parsedDuration = duration ? Number(duration) : 0;
    const parsedCategoryId = (category_id && category_id !== "null" && category_id !== "undefined" && !isNaN(Number(category_id))) ? Number(category_id) : null;

    await db.execute(
      "UPDATE courses SET title = ?, description = ?, price = ?, duration = ?, image = ?, detail_description = ?, category_id = ? WHERE id = ?",
      [title, description, parsedPrice, parsedDuration, imagePath, detail_description, parsedCategoryId, id]
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật khóa học thành công",
      course: {
        id,
        title,
        description,
        price,
        image: imagePath,
        detail_description,
        category_id
      },
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
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
            courses: courses 
        });
    } catch (error) {
        console.error("Get teacher courses error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};


export const createLesson = async (req: any, res: any) => {
    try {
        const { courseId } = req.params;
        const { title, video_url, content, duration } = req.body;
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
            "INSERT INTO lessons (course_id, title, video_url, content, duration, lesson_order) VALUES (?, ?, ?, ?, ?, ?)",
            [courseId, title, video_url || null, content || null, duration || null, lesson_order]
        );

        res.status(201).json({ success: true, data: { id: result.insertId, title, video_url, content, duration, lesson_order } });
    } catch (error) {
        console.error("Create lesson error:", error);
        res.status(500).json({ success: false, message: "Error creating lesson" });
    }
};

export const updateLesson = async (req: any, res: any) => {
    try {
        const { lessonId } = req.params;
        const { title, video_url, content, duration } = req.body;
        const teacherId = req.user.id;

        // Verify teacher owns the course this lesson belongs to
        const db = await connectDB();
        const [lessons]: any = await db.execute(`
            SELECT l.id FROM lessons l JOIN courses c ON l.course_id = c.id 
            WHERE l.id = ? AND c.teacher_id = ?`, [lessonId, teacherId]);
        if (lessons.length === 0) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await db.execute("UPDATE lessons SET title = ?, video_url = ?, content = ?, duration = ? WHERE id = ?", [title, video_url || null, content || null, duration || null, lessonId]);
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

export const createReview = async (req: any, res: any): Promise<void> => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ success: false, message: "Vui lòng chọn số sao từ 1 đến 5" });
            return;
        }

        const db = await connectDB();
        
        // Kiểm tra xem đã đăng ký chưa
        const [enrollments]: any = await db.execute(
            "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
            [userId, id]
        );
        if (enrollments.length === 0) {
            res.status(403).json({ success: false, message: "Bạn phải đăng ký khóa học mới được đánh giá" });
            return;
        }

        // Kiểm tra xem đã từng đánh giá chưa
        const [existingReviews]: any = await db.execute(
            "SELECT id FROM reviews WHERE user_id = ? AND course_id = ?",
            [userId, id]
        );

        if (existingReviews.length > 0) {
            await db.execute(
                "UPDATE reviews SET rating = ?, comment = ?, created_at = NOW() WHERE id = ?",
                [rating, comment || null, existingReviews[0].id]
            );
        } else {
            await db.execute(
                "INSERT INTO reviews (user_id, course_id, rating, comment) VALUES (?, ?, ?, ?)",
                [userId, id, rating, comment || null]
            );
        }

        res.status(201).json({ success: true, message: "Đánh giá thành công" });
    } catch (error) {
        console.error("Create review error:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
