import {
    getUserEnrollments,
    getEnrollmentByUserAndCourse,
    getAnyEnrollmentByUserAndCourse,
    createEnrollment,
    deleteEnrollment,
    reactivateEnrollment,
    reEnroll,
    getCourseEnrollmentCount,
    getAllEnrollments,
} from "../models/enrollmentModel";
import connectDB from '../config/db';
import Progress from "../models/lessonProgressModel";

// Get student's enrolled courses
export const getStudentEnrollments = async (req: any, res: any): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Yêu cầu xác thực"
            });
            return;
        }

        const enrollments = await getUserEnrollments(userId);
        
        res.status(200).json({
            success: true,
            message: "Lấy danh sách khóa học đã đăng ký thành công",
            enrollments
        });
    } catch (error) {
        console.error("Get enrollments error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Check if student is enrolled in course
export const checkEnrollment = async (req: any, res: any): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Yêu cầu xác thực"
            });
            return;
        }

        const enrollment = await getEnrollmentByUserAndCourse(userId, parseInt(courseId));
        
        res.status(200).json({
            success: true,
            isEnrolled: enrollment.length > 0,
            enrollment: enrollment[0] || null
        });
    } catch (error) {
        console.error("Check enrollment error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

export const enrollInCourse = async (req: any, res: any): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.body;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Yêu cầu xác thực" });
        }
        if (!courseId) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp ID khóa học" });
        }

        const existingEnrollment = await getAnyEnrollmentByUserAndCourse(userId, courseId);
        
        if (existingEnrollment && existingEnrollment.status === 'active') {
            return res.status(409).json({ success: false, message: "Bạn đã đăng ký khóa học này" });
        }
        const connection: any = await connectDB();
        try {
            await connection.beginTransaction();

            const [courseRows]: any = await connection.execute("SELECT price FROM courses WHERE id = ?", [courseId]);
            const coursePrice = courseRows.length > 0 ? (parseFloat(courseRows[0].price) || 0) : 0;

            if (coursePrice > 0) {
                const [userRows]: any = await connection.execute("SELECT balance FROM users WHERE id = ? FOR UPDATE", [userId]);
                const currentBalance = userRows.length > 0 ? (parseFloat(userRows[0].balance) || 0) : 0;

                if (currentBalance < coursePrice) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: "INSUFFICIENT_BALANCE" });
                }

                await connection.execute("UPDATE users SET balance = balance - ? WHERE id = ?", [coursePrice, userId]);

                await connection.execute(
                    "INSERT INTO transactions (user_id, amount, payment_method, status, created_at) VALUES (?, ?, 'course_purchase', 'completed', NOW())",
                    [userId, coursePrice]
                );
            }
            let enrollmentId;
            
            if (existingEnrollment && existingEnrollment.status === 'cancelled') {
 
                await connection.execute("DELETE FROM progress WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)", [userId, courseId]);
                await connection.execute("UPDATE enrollments SET status = 'active', progress = 0 WHERE user_id = ? AND course_id = ?", [userId, courseId]);
                enrollmentId = existingEnrollment.id;
            } else {
                const [insertResult]: any = await connection.execute("INSERT INTO enrollments (user_id, course_id, status) VALUES (?, ?, 'active')", [userId, courseId]);
                enrollmentId = insertResult.insertId;
            }
            await connection.commit();
            
            return res.status(201).json({
                success: true,
                message: "Đăng ký khóa học thành công",
                enrollmentId: enrollmentId
            });

        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            if (connection) connection.release();
        }

    } catch (error) {
        console.error("Enroll error:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

export const reEnrollInCourse = async (req: any, res: any): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Yêu cầu xác thực"
            });
            return;
        }

        if (!courseId) {
            res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID khóa học"
            });
            return;
        }

        await Progress.deleteProgressForCourse(userId, courseId);
        await reEnroll(userId, courseId);

        res.status(200).json({
            success: true,
            message: "Ghi danh lại khóa học thành công"
        });
    } catch (error) {
        console.error("Re-enroll error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

export const unenrollFromCourse = async (req: any, res: any): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Yêu cầu xác thực"
            });
            return;
        }

        const enrollment = await getEnrollmentByUserAndCourse(userId, parseInt(courseId));
        
        if (enrollment.length === 0) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy đăng ký"
            });
            return;
        }

        await deleteEnrollment(userId, parseInt(courseId));
        
        res.status(200).json({
            success: true,
            message: "Hủy đăng ký khóa học thành công"
        });
    } catch (error) {
        console.error("Unenroll error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};





// Get course enrollment count
export const getEnrollmentCount = async (req: any, res: any): Promise<void> => {
    try {
        const { courseId } = req.params;
        
        const count = await getCourseEnrollmentCount(parseInt(courseId));
        
        res.status(200).json({
            success: true,
            message: "Lấy số lượng đăng ký thành công",
            count
        });
    } catch (error) {
        console.error("Get enrollment count error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Admin: Get all enrollments (admin only)
export const getAllEnrollmentsAdmin = async (req: any, res: any): Promise<void> => {
    try {
        const userRole = req.user?.role;
        
        if (userRole !== 'admin') {
            res.status(403).json({
                success: false,
                message: "Chỉ admin mới có quyền truy cập"
            });
            return;
        }

        const enrollments = await getAllEnrollments();
        
        res.status(200).json({
            success: true,
            message: "Lấy danh sách đăng ký thành công",
            enrollments
        });
    } catch (error) {
        console.error("Get all enrollments error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};
