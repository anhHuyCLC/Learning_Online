import express from "express";
import {
    getStudentEnrollments,
    checkEnrollment,
    enrollInCourse,
    unenrollFromCourse,
    updateProgress,
    complete,
    getEnrollmentCount,
    getAllEnrollmentsAdmin,
} from "../controllers/enrollmentController";
import { authMiddleware } from "../middleware/authMiddleware";

const enrollmentRouter = express.Router();

// Get student's enrolled courses - protected
enrollmentRouter.get("/student/enrollments", authMiddleware, getStudentEnrollments);

// Check if student is enrolled in specific course - protected
enrollmentRouter.get("/courses/:courseId/check-enrollment", authMiddleware, checkEnrollment);

// Enroll in course - protected
enrollmentRouter.post("/enrollments", authMiddleware, enrollInCourse);

// Unenroll from course - protected
enrollmentRouter.delete("/enrollments/:courseId", authMiddleware, unenrollFromCourse);

// Update enrollment progress - protected
enrollmentRouter.put("/enrollments/progress", authMiddleware, updateProgress);

// Complete course - protected
enrollmentRouter.post("/enrollments/complete", authMiddleware, complete);

// Get enrollment count for course - public
enrollmentRouter.get("/courses/:courseId/enrollment-count", getEnrollmentCount);

// Admin: Get all enrollments - admin only
enrollmentRouter.get("/admin/enrollments", authMiddleware, getAllEnrollmentsAdmin);


export default enrollmentRouter;
