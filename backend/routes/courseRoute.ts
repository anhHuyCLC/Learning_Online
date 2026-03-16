import express from "express";
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse } from "../controllers/courseController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const courseRouter = express.Router();

// Get all courses - protected
courseRouter.get("/courses", authMiddleware, getCourses);

// Get course by ID - protected
courseRouter.get("/courses/:id", authMiddleware, getCourseById);

// Create course - protected
courseRouter.post("/courses", authMiddleware, createCourse);

// Update course - protected
courseRouter.put("/courses/:id", authMiddleware, updateCourse);

// Delete course - protected
courseRouter.delete("/courses/:id", authMiddleware, deleteCourse);

export default courseRouter;
