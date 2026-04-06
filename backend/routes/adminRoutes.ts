import express from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { 
    getAdminDashboard, 
    getAllUsers, 
    updateUserRole, 
    deleteUser,
    getAllCourses,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authMiddleware, isAdmin);

// Dashboard
router.get("/dashboard", getAdminDashboard);

// User Management
router.get("/users", getAllUsers);
router.put("/users/role", updateUserRole);
router.delete("/users/:userId", deleteUser);

// Course Management
router.get("/courses", getAllCourses);

// Category Management
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
