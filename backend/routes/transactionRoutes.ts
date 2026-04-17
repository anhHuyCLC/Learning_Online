import express from 'express';
import { 
    createTopUpTransaction, 
    checkTransactionStatus, 
    sepayWebhook, 
    cancelTransaction,
    getAdminTransactions, 
    getAdminTransactionStats
} from '../controllers/transactionController';
import { authMiddleware as protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', protect, getAdminTransactionStats);

router.get('/', protect, getAdminTransactions);

router.post('/create-topup', protect, createTopUpTransaction);
router.get('/status/:orderCode', protect, checkTransactionStatus);
router.post('/cancel', protect, cancelTransaction);

router.post('/sepay-webhook', sepayWebhook);

export default router;