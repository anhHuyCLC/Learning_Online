import { Request, Response } from 'express';
import connectDB from '../config/db'; 
import bcrypt from 'bcrypt';

export const topUpBalance = async (req: Request, res: Response) => {
    const { amount } = req.body;
    const userId = (req as any).user.id; 

    if (!amount || typeof amount !== 'number' || amount <= 1000) { 
        return res.status(400).json({ success: false, message: "Số tiền nạp không hợp lệ. Số tiền tối thiểu là 1,000 VNĐ." });
    }

    const connection: any = await connectDB();

    try {
        await connection.beginTransaction();
        await connection.execute(
            "UPDATE users SET balance = balance + ? WHERE id = ?",
            [amount, userId]
        );
        await connection.execute(
            "INSERT INTO transactions (user_id, amount, type, status) VALUES (?, ?, 'top-up', 'completed')",
            [userId, amount]
        );
        const [userRows]: any = await connection.execute("SELECT balance FROM users WHERE id = ?", [userId]);
        const newBalance = userRows[0].balance;
        await connection.commit();

        // 7. Trả về kết quả thành công
        res.status(200).json({
            success: true,
            message: "Nạp tiền thành công.",
            newBalance: newBalance
        });

    } catch (error) {
        await connection.rollback(); 
        console.error("Lỗi khi nạp tiền:", error);
        res.status(500).json({ success: false, message: "Đã xảy ra lỗi trong quá trình nạp tiền." });
    }
};
export const UpdateProfile = async (req: Request, res: Response) => {
    const {name, currentPassword, password} = req.body;
    const userId = (req as any).user.id; 
    const connection: any = await connectDB();
    try {
        if (password) {
            // Kiểm tra xem người dùng có truyền mật khẩu hiện tại lên không
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu hiện tại để thay đổi mật khẩu." });
            }
            
            // Lấy thông tin user hiện tại từ DB để lấy chuỗi hash
            const [userRows]: any = await connection.execute("SELECT password FROM users WHERE id = ?", [userId]);
            if (userRows.length === 0) {
                return res.status(404).json({ success: false, message: "Người dùng không tồn tại." });
            }
            
            // So sánh mật khẩu
            const isMatch = await bcrypt.compare(currentPassword, userRows[0].password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Mật khẩu hiện tại không đúng." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.execute(
                "UPDATE users SET name = ?, password = ? WHERE id = ?",
                [name, hashedPassword, userId]
            );
        } else {
            await connection.execute(
                "UPDATE users SET name = ? WHERE id = ?",
                [name, userId]
            );
        }
        res.status(200).json({ success: true, message: "Cập nhật thông tin thành công" });
    }catch (error){
        console.error("Lỗi khi cập nhật thông tin:", error);
        res.status(500).json({ success: false, message: "Đã xảy ra lỗi trong quá trình cập nhật thông tin." });
    
    }
};

// --- CÁC API DÀNH CHO ADMIN ---

// Lấy danh sách tất cả người dùng
export const getAllUsers = async (req: Request, res: Response) => {
    const connection: any = await connectDB();
    try {
        // Loại bỏ trường password để bảo mật
        const [users] = await connection.execute(
            "SELECT id, name, email, role, balance, avatar, created_at FROM users ORDER BY created_at DESC"
        );
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh sách người dùng." });
    }
};

// Cập nhật vai trò người dùng (Admin, Teacher, Student)
export const updateUserRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    const connection: any = await connectDB();
    try {
        await connection.execute(
            "UPDATE users SET role = ? WHERE id = ?",
            [role, id]
        );
        res.status(200).json({ success: true, message: "Cập nhật vai trò người dùng thành công." });
    } catch (error) {
        console.error("Lỗi khi cập nhật vai trò:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật vai trò." });
    }
};

// Xóa người dùng
export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const connection: any = await connectDB();
    try {
        await connection.execute("DELETE FROM users WHERE id = ?", [id]);
        res.status(200).json({ success: true, message: "Xóa người dùng thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa người dùng. Có thể người dùng này đang ràng buộc với dữ liệu khóa học/giao dịch." });
    }
};