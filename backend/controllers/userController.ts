import { Request, Response } from 'express';
import connectDB from '../config/db'; // Giả định đường dẫn tới file config db của bạn

// Hàm này sẽ xử lý logic nạp tiền vào tài khoản người dùng
export const topUpBalance = async (req: Request, res: Response) => {
    const { amount } = req.body;
    // Lấy userId từ đối tượng req.user, được thêm vào bởi middleware xác thực (protect)
    const userId = (req as any).user.id; 

    // 1. Xác thực đầu vào
    // Đảm bảo số tiền là hợp lệ (số, dương, và lớn hơn một ngưỡng tối thiểu nào đó)
    if (!amount || typeof amount !== 'number' || amount <= 1000) { 
        return res.status(400).json({ success: false, message: "Số tiền nạp không hợp lệ. Số tiền tối thiểu là 1,000 VNĐ." });
    }

    const connection: any = await connectDB();

    try {
        // 2. Bắt đầu một transaction để đảm bảo tính toàn vẹn dữ liệu
        // Nếu có lỗi xảy ra ở bất kỳ bước nào, tất cả các thay đổi sẽ được hoàn tác.
        await connection.beginTransaction();

        // 3. Cập nhật số dư cho người dùng
        // Sử dụng "FOR UPDATE" để khóa hàng dữ liệu của người dùng, tránh race condition
        await connection.execute(
            "UPDATE users SET balance = balance + ? WHERE id = ?",
            [amount, userId]
        );

        // 4. (Khuyến khích) Ghi lại lịch sử giao dịch
        // Điều này giúp bạn có một bản ghi chi tiết về tất cả các giao dịch nạp tiền
        await connection.execute(
            "INSERT INTO transactions (user_id, amount, type, status) VALUES (?, ?, 'top-up', 'completed')",
            [userId, amount]
        );

        // 5. Lấy số dư mới của người dùng để trả về cho client
        const [userRows]: any = await connection.execute("SELECT balance FROM users WHERE id = ?", [userId]);
        const newBalance = userRows[0].balance;

        // 6. Hoàn tất transaction
        await connection.commit();

        // 7. Trả về kết quả thành công
        res.status(200).json({
            success: true,
            message: "Nạp tiền thành công.",
            newBalance: newBalance
        });

    } catch (error) {
        // Nếu có lỗi, hoàn tác transaction và trả về lỗi server
        await connection.rollback(); 
        console.error("Lỗi khi nạp tiền:", error);
        res.status(500).json({ success: false, message: "Đã xảy ra lỗi trong quá trình nạp tiền." });
    }
};