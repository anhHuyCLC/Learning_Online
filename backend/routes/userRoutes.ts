import express from "express";
import { login, register } from "../controllers/authController";
import { validateLoginInput, validateRegisterInput } from "../middleware/validation";
import { authMiddleware as protect } from "../middleware/authMiddleware"; 
import { topUpBalance, UpdateProfile, getAllUsers, updateUserRole, deleteUser } from "../controllers/userController"; 

const userRouter = express.Router();

userRouter.post("/login", validateLoginInput, login);
userRouter.post("/register", validateRegisterInput, register);
userRouter.post("/top-up", protect, topUpBalance);
userRouter.put("/update-user", protect, UpdateProfile);

userRouter.get("/", protect, getAllUsers);
userRouter.put("/:id/role", protect, updateUserRole);
userRouter.delete("/:id", protect, deleteUser);

export default userRouter;