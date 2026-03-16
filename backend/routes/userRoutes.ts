import express from "express";
import { login, register } from "../controllers/authController.js";
import { validateLoginInput, validateRegisterInput } from "../middleware/validation.js";

const userRouter = express.Router();

userRouter.post("/login", validateLoginInput, login);
userRouter.post("/register", validateRegisterInput, register);

export default userRouter;