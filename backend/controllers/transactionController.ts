import { Request, Response } from 'express';
import connectDB from '../config/db';
import { PoolConnection } from 'mysql2/promise';

interface AuthRequest extends Request {
    user?: { id: number; email: string; role: string };
}

export const createTopUpTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { amount } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Người dùng không được xác thực' });
        }
        if (!amount || amount < 10000) { 
            return res.status(400).json({ message: 'Số tiền không hợp lệ. Tối thiểu là 10,000 VND.' });
        }

        const orderCode = `LMS${Date.now()}`;
        const connection = await connectDB();

        // Đã sửa: Bỏ cột 'type', lưu orderCode vào 'payment_method' theo đúng DB của bạn
        await connection.execute(
            `INSERT INTO transactions 
            (user_id, amount, status, payment_method, created_at) 
            VALUES (?, ?, 'pending', ?, NOW())`,
            [userId, amount, orderCode]
        );

        const BANK_ID = process.env.BANK_ID || '970422';
        const ACCOUNT_NO = process.env.ACCOUNT_NO || '0862187105';
        const ACCOUNT_NAME = process.env.ACCOUNT_NAME || 'TRINH DUY HUY';

        const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(orderCode)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

        res.status(200).json({ success: true, orderCode, qrUrl });
    } catch (error) {
        console.error('Lỗi khi tạo giao dịch:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo giao dịch' });
    }
};

export const checkTransactionStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { orderCode } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Người dùng không được xác thực' });
        }

        const connection = await connectDB();
        
        // Đã sửa: Truy vấn bằng cột payment_method
        const [rows]: any = await connection.execute(
            `SELECT status 
             FROM transactions 
             WHERE payment_method = ? AND user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [orderCode, userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
        }

        // status ở đây sẽ là 'completed' chứ không phải 'success' theo cấu trúc ENUM của DB
        const { status } = rows[0];
        let newBalance = null;

        // Nếu 'completed', lấy số dư mới
        if (status === 'completed') {
            const [userRows]: any = await connection.execute(
                "SELECT balance FROM users WHERE id = ?",
                [userId]
            );

            if (userRows.length > 0) {
                newBalance = userRows[0].balance;
            }
        }

        const frontendStatus = status === 'completed' ? 'success' : status;
        
        res.status(200).json({ status: frontendStatus, newBalance });

    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái:', error);
        res.status(500).json({ message: 'Lỗi server khi kiểm tra trạng thái' });
    }
};

export const sepayWebhook = async (req: Request, res: Response) => {
    const API_KEY = process.env.SEPAY_WEBHOOK_SECRET;
    const authHeader = req.headers['authorization'];

    if (!API_KEY) {
        console.error('❌ Thiếu SEPAY_WEBHOOK_SECRET');
        return res.sendStatus(200);
    }

    if (authHeader !== `Apikey ${API_KEY}`) {
        console.warn('❌ Unauthorized webhook');
        return res.status(401).send('Unauthorized');
    }

    const connection = (await connectDB()) as unknown as PoolConnection;

    try {
        const { transferAmount, content } = req.body;
        const match = content?.match(/LMS\d+/);
        
        if (!match) {
            console.log('⚠️ Không tìm thấy orderCode trong content');
            return res.sendStatus(200);
        }

        const orderCode = match[0];

        await connection.beginTransaction();

        // Đã sửa: Tìm order bằng cột payment_method
        const [rows]: any = await connection.execute(
            `SELECT * FROM transactions WHERE payment_method = ? FOR UPDATE`,
            [orderCode]
        );

        if (!rows || rows.length === 0) {
            console.log(`⚠️ Không tìm thấy transaction: ${orderCode}`);
            await connection.rollback();
            return res.sendStatus(200);
        }

        const tx = rows[0];

        if (tx.status !== 'pending') {
            console.log('⚠️ Transaction đã được xử lý trước đó');
            await connection.rollback();
            return res.sendStatus(200);
        }

        if (transferAmount < tx.amount) {
            console.log(`⚠️ Số tiền không đủ: ${transferAmount} < ${tx.amount}`);
            await connection.rollback();
            return res.sendStatus(200);
        }

        // Đã sửa: Dùng 'completed' theo đúng chuẩn ENUM
        await connection.execute(
            `UPDATE transactions SET status = 'completed' WHERE id = ?`,
            [tx.id]
        );

        await connection.execute(
            `UPDATE users SET balance = balance + ? WHERE id = ?`,
            [tx.amount, tx.user_id]
        );

        await connection.commit();
        console.log(`✅ Nạp tiền thành công: ${orderCode} | User: ${tx.user_id}`);
        return res.sendStatus(200);

    } catch (error) {
        console.error('❌ Lỗi webhook:', error);
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error('Lỗi khi rollback:', rollbackError);
        }
        return res.sendStatus(200); 
    } finally {
        connection.release();
    }
};

export const cancelTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { orderCode } = req.body;
        const userId = req.user?.id;

        if (!userId || !orderCode) {
            return res.status(400).json({ message: 'Yêu cầu không hợp lệ' });
        }

        const connection = await connectDB();
        
        const [result]: any = await connection.execute(
            `UPDATE transactions SET status = 'failed' 
             WHERE payment_method = ? AND user_id = ? AND status = 'pending'`,
            [orderCode, userId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Giao dịch đã được hủy' });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch đang chờ' });
        }
    } catch (error) {
        console.error('Lỗi khi hủy giao dịch:', error);
        res.status(500).json({ message: 'Lỗi server khi hủy giao dịch' });
    }
};

export const getAdminTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const connection = await connectDB();

        // Đếm tổng số lượng giao dịch
        const [countResult]: any = await connection.execute('SELECT COUNT(*) as total FROM transactions');
        const total = countResult[0].total;

        // JOIN với bảng users để lấy tên người dùng (name)
        const [rows]: any = await connection.query(
            `SELECT t.id, t.amount, t.status, t.payment_method, t.created_at, u.name as user_name 
             FROM transactions t
             LEFT JOIN users u ON t.user_id = u.id
             ORDER BY t.created_at DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        res.status(200).json({
            success: true,
            data: rows,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách giao dịch:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const getAdminTransactionStats = async (req: AuthRequest, res: Response) => {
    try {
        const connection = await connectDB();

        const [rows]: any = await connection.execute(
            `SELECT 
                COUNT(id) as totalTransactions,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalDeposited,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as totalPending
             FROM transactions`
        );

        res.status(200).json({ success: true, stats: rows[0] });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};