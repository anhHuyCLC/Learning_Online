import { Request, Response } from 'express';
import connectDB from '../config/db';

export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const connection: any = await connectDB();
        const [rows] = await connection.execute(`
            SELECT t.id, t.amount, t.type, t.status, t.created_at as date, u.name as user 
            FROM transactions t 
            JOIN users u ON t.user_id = u.id 
            ORDER BY t.created_at DESC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Lỗi getAllTransactions:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy lịch sử giao dịch" });
    }
};

export const getTransactionStats = async (req: Request, res: Response) => {
    try {
        const connection: any = await connectDB();
        const [successRows]: any = await connection.execute(`SELECT SUM(amount) as total FROM transactions WHERE status IN ('success', 'completed')`);
        const [pendingRows]: any = await connection.execute(`SELECT SUM(amount) as total FROM transactions WHERE status = 'pending'`);
        
        res.status(200).json({ 
            success: true, 
            data: {
                totalSuccess: successRows[0].total || 0,
                totalPending: pendingRows[0].total || 0
            }
        });
    } catch (error) {
        console.error("Lỗi getTransactionStats:", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy thống kê giao dịch" });
    }
};