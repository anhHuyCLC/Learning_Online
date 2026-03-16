import { createUser, findUserByEmail } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// interface ApiResponse {
//   success: boolean;
//   message?: string;
//   user?: any;
//   token?: string;
// }

export const login = async (req: any, res: any): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    const users = await findUserByEmail(email);

    if (users.length === 0) {
      res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác"
      });
      return;
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = generateToken(user.id, user.email, user.role);
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        user: userWithoutPassword,
        token
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác"
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

export const register = async (req: any, res: any): Promise<void> => {
  try {
    const { name, email, password }: RegisterRequest = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser.length > 0) {
      res.status(409).json({
        success: false,
        message: "Email đã tồn tại"
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "student";

    await createUser(name, email, hashedPassword, role);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công"
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};