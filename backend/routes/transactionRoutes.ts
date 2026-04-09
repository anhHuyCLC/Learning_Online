import express from 'express';
import { getAllTransactions, getTransactionStats } from '../controllers/transactionController';
// import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getAllTransactions);
router.get('/stats', getTransactionStats);

export default router;