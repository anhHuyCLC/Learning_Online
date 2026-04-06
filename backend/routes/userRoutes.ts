import express from "express";
import { login, register } from "../controllers/authController.js";
import { validateLoginInput, validateRegisterInput } from "../middleware/validation.js";
import { authMiddleware as protect } from "../middleware/authMiddleware.js"; // Đảm bảo bạn có middleware này
import { topUpBalance } from "../controllers/userController.js"; // Import controller mới

const userRouter = express.Router();

userRouter.post("/login", validateLoginInput, login);
userRouter.post("/register", validateRegisterInput, register);
userRouter.post("/top-up", protect, topUpBalance); // Thêm route nạp tiền

export default userRouter;