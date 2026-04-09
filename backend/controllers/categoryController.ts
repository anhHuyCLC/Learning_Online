import { Request, Response } from 'express';
import connectDB from '../config/db';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const connection: any = await connectDB();
        const [rows] = await connection.execute(`
            SELECT c.id, c.name, c.description, c.status, COUNT(co.id) as courseCount 
            FROM categories c 
            LEFT JOIN courses co ON c.id = co.category_id 
            GROUP BY c.id
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Lỗi getCategories:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh mục" });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, description, status } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Tên danh mục là bắt buộc" });
        
        const connection: any = await connectDB();
        await connection.execute(
            "INSERT INTO categories (name, description, status) VALUES (?, ?, ?)",
            [name, description || '', status || 'active']
        );
        res.status(201).json({ success: true, message: "Thêm danh mục thành công" });
    } catch (error) {
        console.error("Lỗi createCategory:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi thêm danh mục" });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;
        
        const connection: any = await connectDB();
        await connection.execute(
            "UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ?",
            [name, description, status, id]
        );
        res.status(200).json({ success: true, message: "Cập nhật danh mục thành công" });
    } catch (error) {
        console.error("Lỗi updateCategory:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật danh mục" });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const connection: any = await connectDB();
        
        // Kiểm tra xem danh mục có đang chứa khóa học nào không
        const [courses]: any = await connection.execute("SELECT id FROM courses WHERE category_id = ?", [id]);
        if (courses.length > 0) {
            return res.status(400).json({ success: false, message: "Không thể xóa danh mục đang có khóa học" });
        }

        await connection.execute("DELETE FROM categories WHERE id = ?", [id]);
        res.status(200).json({ success: true, message: "Xóa danh mục thành công" });
    } catch (error) {
        console.error("Lỗi deleteCategory:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa danh mục" });
    }
};