import { Request, Response } from 'express';
import connectDB from '../config/db';

export const createTopUpTransaction = async (req: Request, res: Response) => {
    try {
        const { amount } = req.body;
        const userId = (req as any).user.id;

        const orderCode = `LMS${Date.now()}`;
        const connection: any = await connectDB();

        await connection.execute(
            `INSERT INTO transactions 
            (user_id, amount, status, payment_method, created_at) 
            VALUES (?, ?, 'pending', ?, NOW())`,
            [userId, amount, orderCode]
        );

        const qrUrl = `https://img.vietqr.io/image/970422-0862187105-compact2.png?amount=${amount}&addInfo=${orderCode}&accountName=TRINH DUY HUY`;

        res.status(200).json({ success: true, orderCode, qrUrl });
    } catch (error) {
        console.error('Lỗi khi tạo giao dịch:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo giao dịch' });
    }
};

export const checkTransactionStatus = async (req: Request, res: Response) => {
    try {
        const { orderCode } = req.params;
        const userId = (req as any).user.id;

        const connection: any = await connectDB();

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

        const status = rows[0].status;
        let newBalance = null;

        // Nếu thành công thì lấy balance
        if (status === 'success') {
            const [userRows]: any = await connection.execute(
                "SELECT balance FROM users WHERE id = ?",
                [userId]
            );

            if (userRows.length > 0) {
                newBalance = userRows[0].balance;
            }
        }

        res.status(200).json({ status, newBalance });

    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái:', error);
        res.status(500).json({ message: 'Lỗi server khi kiểm tra trạng thái' });
    }
};
export const sepayWebhook = async (req: Request, res: Response) => {
    const connection: any = await connectDB();

    try {
        const { transferAmount, content } = req.body;

        const orderCodeMatch = content?.match(/LMS\d+/);
        if (!orderCodeMatch) {
            return res.status(200).json({ success: true });
        }

        const orderCode = orderCodeMatch[0];

        const [txRows]: any = await connection.execute(
            `SELECT * FROM transactions 
             WHERE payment_method = ? AND status = 'pending' 
             LIMIT 1`,
            [orderCode]
        );

        if (!txRows || txRows.length === 0) {
            return res.status(200).json({ success: true });
        }

        const tx = txRows[0];

        if (transferAmount >= tx.amount) {
            await connection.beginTransaction();

            // Update trạng thái
            await connection.execute(
                `UPDATE transactions 
                 SET status = 'success' 
                 WHERE payment_method = ?`,
                [orderCode]
            );

            await connection.execute(
                `UPDATE users 
                 SET balance = balance + ? 
                 WHERE id = ?`,
                [tx.amount, tx.user_id] 
            );

            await connection.commit();
        }

        res.status(200).json({ success: true });

    } catch (error) {
        await connection.rollback();
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook xử lý thất bại' });
    }
};