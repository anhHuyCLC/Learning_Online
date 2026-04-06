import { verifyToken } from "../utils/jwt";

export const authMiddleware = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

export const isTeacher = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === "teacher") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Teacher role required."
    });
  }
};

export const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required."
    });
  }
};
