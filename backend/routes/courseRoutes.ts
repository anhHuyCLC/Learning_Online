import express from "express";
import { 
    getCourses, 
    getCourseById, 
    getLessonById, 
    createCourse, 
    updateCourse, 
    deleteCourse, 
    getTeacherCourses,
    createLesson, updateLesson, deleteLesson,
    createReview
} from "../controllers/courseController.js";
import upload from "../config/multerConfig.js"; // Import Multer config
import { authMiddleware } from "../middleware/authMiddleware.js";

const courseRouter = express.Router();

// Get all courses - protected
courseRouter.get("/courses", getCourses);

// Get course by ID - protected
courseRouter.get("/courses/:id", getCourseById);

// Get lesson by ID - protected
courseRouter.get("/lessons/:lessonId", authMiddleware, getLessonById);

// Create course - protected
courseRouter.post("/courses", authMiddleware, upload.single('image'), createCourse); // Thêm upload.single('image')

// Update course - protected
courseRouter.put("/courses/:id", authMiddleware, upload.single('image'), updateCourse); // Thêm upload.single('image')

// Delete course - protected
courseRouter.delete("/courses/:id", authMiddleware, deleteCourse);

// Review course - protected
courseRouter.post("/courses/:id/reviews", authMiddleware, createReview);

courseRouter.get("/teacher/courses", authMiddleware, getTeacherCourses);

// Lesson Management Routes (for teachers)
courseRouter.post("/courses/:courseId/lessons", authMiddleware, createLesson);
courseRouter.put("/lessons/:lessonId", authMiddleware, updateLesson);
courseRouter.delete("/lessons/:lessonId", authMiddleware, deleteLesson);


export default courseRouter;
