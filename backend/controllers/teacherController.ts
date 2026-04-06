import { Request, Response } from "express";
import connectDB from "../config/db";

export const getTeacherDashboard = async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const db = await connectDB();

    // 1. Total courses
    const [coursesRows]: any = await db.execute(
      "SELECT COUNT(*) as total FROM courses WHERE teacher_id = ?",
      [teacherId]
    );
    const totalCourses = coursesRows[0].total;

    // 2. Total students enrolled in teacher's courses
    // We assume an enrollments table with course_id and courses has teacher_id
    const [studentsRows]: any = await db.execute(`
      SELECT COUNT(DISTINCT e.user_id) as total 
      FROM enrollments e 
      JOIN courses c ON e.course_id = c.id 
      WHERE c.teacher_id = ?
    `, [teacherId]);
    const totalStudents = studentsRows[0].total;

    // 3. Total revenue (calculated from teacher's completed enrollments)
    const [revenueRows]: any = await db.execute(`
      SELECT SUM(c.price) as total 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.teacher_id = ? AND e.status = 'completed'
    `, [teacherId]);
    const totalRevenue = revenueRows[0].total || 0;

    res.json({
      success: true,
      data: {
        totalCourses,
        totalStudents,
        totalRevenue
      }
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Error fetching dashboard data" });
  }
};

// Get students enrolled in a specific course owned by the teacher
export const getMyCourseStudents = async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const db = await connectDB();

    // Đầu tiên, xác minh giáo viên sở hữu khóa học
    const [courseCheck]: any = await db.execute(
      "SELECT id FROM courses WHERE id = ? AND teacher_id = ?",
      [courseId, teacherId]
    );

    if (courseCheck.length === 0) {
      return res.status(403).json({ success: false, message: "You are not authorized to view students for this course." });
    }

    // Lấy danh sách học viên đã đăng ký
    const [students]: any = await db.execute(`
      SELECT u.id, u.name, u.email, e.enrolled_at, e.progress, e.status
      FROM users u
      JOIN enrollments e ON u.id = e.user_id
      WHERE e.course_id = ? AND e.status != 'cancelled'
      ORDER BY e.enrolled_at DESC
    `, [courseId]);

    res.json({ success: true, data: students });

  } catch (error) {
    console.error("Error fetching course students:", error);
    res.status(500).json({ success: false, message: "Error fetching course students" });
  }
};

// Get detailed statistics for a course owned by the teacher
export const getMyCourseStatistics = async (req: any, res: Response) => {
    try {
        const teacherId = req.user.id;
        const { courseId } = req.params;
        const db = await connectDB();

        // Xác minh quyền sở hữu của giáo viên
        const [courseCheck]: any = await db.execute(
            "SELECT id FROM courses WHERE id = ? AND teacher_id = ?",
            [courseId, teacherId]
        );

        if (courseCheck.length === 0) {
            return res.status(403).json({ success: false, message: "You are not authorized to view stats for this course." });
        }

        const [stats]: any = await db.execute(`
            SELECT
                COUNT(id) as totalEnrollments,
                (SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(id)) * 100 as completionRate,
                AVG(CASE WHEN status = 'active' THEN progress ELSE NULL END) as averageProgress
            FROM enrollments
            WHERE course_id = ?
        `, [courseId]);

        res.json({ success: true, data: stats[0] });
    } catch (error) {
        console.error("Error fetching course statistics:", error);
        res.status(500).json({ success: false, message: "Error fetching course statistics" });
    }
};
