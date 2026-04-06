import express from "express";
import { 
    getCourses, 
    getCourseById, 
    getLessonById, 
    createCourse, 
    updateCourse, 
    deleteCourse, 
    getTeacherCourses,
    createLesson, updateLesson, deleteLesson // Thêm lesson controllers
} from "../controllers/courseController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const courseRouter = express.Router();

// Get all courses - protected
courseRouter.get("/courses", authMiddleware, getCourses);

// Get course by ID - protected
courseRouter.get("/courses/:id", authMiddleware, getCourseById);

// Get lesson by ID - protected
courseRouter.get("/lessons/:lessonId", authMiddleware, getLessonById);

// Create course - protected
courseRouter.post("/courses", authMiddleware, createCourse);

// Update course - protected
courseRouter.put("/courses/:id", authMiddleware, updateCourse);

// Delete course - protected
courseRouter.delete("/courses/:id", authMiddleware, deleteCourse);

courseRouter.get("/teacher/courses", authMiddleware, getTeacherCourses);

// Lesson Management Routes (for teachers)
courseRouter.post("/courses/:courseId/lessons", authMiddleware, createLesson);
courseRouter.put("/lessons/:lessonId", authMiddleware, updateLesson);
courseRouter.delete("/lessons/:lessonId", authMiddleware, deleteLesson);


export default courseRouter;
