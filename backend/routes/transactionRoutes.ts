import express from 'express';
import { createTopUpTransaction, checkTransactionStatus, sepayWebhook } from '../controllers/transactionController';
import { authMiddleware as protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create-topup', protect, createTopUpTransaction);
router.get('/status/:orderCode', protect, checkTransactionStatus);
router.post('/sepay-webhook', sepayWebhook);
export default router;
