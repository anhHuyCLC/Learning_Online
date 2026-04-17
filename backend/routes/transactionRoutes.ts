import express from 'express';
import { 
    createTopUpTransaction, 
    checkTransactionStatus, 
    sepayWebhook, 
    cancelTransaction,
    getUserTransactions,  
    getTransactionStats   
} from '../controllers/transactionController';
import { authMiddleware as protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getUserTransactions);         
router.get('/stats', protect, getTransactionStats);    

router.post('/create-topup', protect, createTopUpTransaction);
router.get('/status/:orderCode', protect, checkTransactionStatus);
router.post('/cancel', protect, cancelTransaction);
router.post('/sepay-webhook', sepayWebhook);

export default router;