import express from "express";
import { login, register } from "../controllers/authController.js";
import { validateLoginInput, validateRegisterInput } from "../middleware/validation.js";
import { authMiddleware as protect } from "../middleware/authMiddleware.js"; 
import { topUpBalance, UpdateProfile, getAllUsers, updateUserRole, deleteUser } from "../controllers/userController.js"; 

const userRouter = express.Router();

// Các API công khai và người dùng cơ bản
userRouter.post("/login", validateLoginInput, login);
userRouter.post("/register", validateRegisterInput, register);
userRouter.post("/top-up", protect, topUpBalance);
userRouter.put("/update-user", protect, UpdateProfile);

// Các API Quản trị viên (Nên thêm adminMiddleware để kiểm tra quyền Admin nếu bạn có)
userRouter.get("/", protect, getAllUsers);
userRouter.put("/:id/role", protect, updateUserRole);
userRouter.delete("/:id", protect, deleteUser);

export default userRouter;