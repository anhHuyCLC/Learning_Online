import { Request, Response } from "express";
import connectDB from "../config/db";

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const db = await connectDB();

    const [usersRows]: any = await db.execute("SELECT COUNT(*) as total FROM users");
    const totalUsers = usersRows[0].total;

    const [coursesRows]: any = await db.execute("SELECT COUNT(*) as total FROM courses");
    const totalCourses = coursesRows[0].total;

    const [revenueRows]: any = await db.execute(`
      SELECT SUM(c.price) as total
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.status IN ('active', 'completed')
    `);
   
    const totalRevenue = Number(revenueRows[0].total) || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalRevenue
      }
    });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu Admin Dashboard:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi máy chủ khi lấy thống kê bảng điều khiển" 
    });
  }
};

// Get all users (for admin)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const db = await connectDB();
    const [users]: any = await db.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// Update a user's role (for admin)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ success: false, message: "User ID and role are required" });
    }
    const validRoles = ['admin', 'teacher', 'student'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    const db = await connectDB();
    await db.execute("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    
    res.json({ success: true, message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ success: false, message: "Error updating user role" });
  }
};

// Delete a user (for admin)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = await connectDB();
    // Lưu ý: ON DELETE CASCADE trong schema của DB là rất quan trọng ở đây.
    // Schema trong ENROLLMENT_SETUP.md đã có ON DELETE CASCADE, rất tốt!
    await db.execute("DELETE FROM users WHERE id = ?", [userId]);
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

// Get all courses for admin view
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const db = await connectDB();
    const [courses]: any = await db.execute(`
      SELECT c.*, u.name as teacher_name 
      FROM courses c 
      LEFT JOIN users u ON c.teacher_id = u.id 
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error("Error fetching all courses for admin:", error);
    res.status(500).json({ success: false, message: "Error fetching courses" });
  }
};

// --- Category Management ---

export const getCategories = async (req: Request, res: Response) => {
  try {
    const db = await connectDB();
    const [categories]: any = await db.execute("SELECT * FROM categories ORDER BY name ASC");
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching categories" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    const db = await connectDB();
    const [result]: any = await db.execute("INSERT INTO categories (name) VALUES (?)", [name]);
    res.status(201).json({ success: true, data: { id: result.insertId, name } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating category" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    const db = await connectDB();
    await db.execute("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
    res.json({ success: true, message: "Category updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating category" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
    await db.execute("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting category" });
  }
};
