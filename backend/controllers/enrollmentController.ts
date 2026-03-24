import {
    getUserEnrollments,
    getEnrollmentByUserAndCourse,
    getAnyEnrollmentByUserAndCourse,
    createEnrollment,
    deleteEnrollment,
    reactivateEnrollment,
    getCourseEnrollmentCount,
    updateEnrollmentProgress,
    completeEnrollment,
    getAllEnrollments,
} from "../models/enrollmentModel";

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

// Enroll student in course
export const enrollInCourse = async (req: any, res: any): Promise<void> => {
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

        // Check if any enrollment exists (regardless of status)
        const existingEnrollment = await getAnyEnrollmentByUserAndCourse(userId, courseId);
        
        if (existingEnrollment) {
            if (existingEnrollment.status === 'active') {
                res.status(409).json({
                    success: false,
                    message: "Bạn đã đăng ký khóa học này"
                });
                return;
            } else if (existingEnrollment.status === 'cancelled') {
                // Re-activate cancelled enrollment
                await reactivateEnrollment(userId, courseId);
                res.status(201).json({
                    success: true,
                    message: "Đăng ký khóa học thành công",
                    enrollmentId: existingEnrollment.id
                });
                return;
            }
        }

        const result = await createEnrollment(userId, courseId);
        
        res.status(201).json({
            success: true,
            message: "Đăng ký khóa học thành công",
            enrollmentId: result.insertId
        });
    } catch (error) {
        console.error("Enroll error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Unenroll student from course
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

// Update enrollment progress
export const updateProgress = async (req: any, res: any): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { courseId, progress } = req.body;
        
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Yêu cầu xác thực"
            });
            return;
        }

        if (!courseId || progress === undefined || progress < 0 || progress > 100) {
            res.status(400).json({
                success: false,
                message: "Thông tin không hợp lệ"
            });
            return;
        }

        const enrollment = await getEnrollmentByUserAndCourse(userId, courseId);
        
        if (enrollment.length === 0) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy đăng ký"
            });
            return;
        }

        await updateEnrollmentProgress(userId, courseId);
        
        res.status(200).json({
            success: true,
            message: "Cập nhật tiến độ thành công"
        });
    } catch (error) {
        console.error("Update progress error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Complete enrollment
export const complete = async (req: any, res: any): Promise<void> => {
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

        const enrollment = await getEnrollmentByUserAndCourse(userId, courseId);
        
        if (enrollment.length === 0) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy đăng ký"
            });
            return;
        }

        await completeEnrollment(userId, courseId);
        
        res.status(200).json({
            success: true,
            message: "Hoàn thành khóa học thành công"
        });
    } catch (error) {
        console.error("Complete enrollment error:", error);
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

