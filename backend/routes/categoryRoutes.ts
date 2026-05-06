import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
// import { protect, admin } from '../middleware/authMiddleware'; // Hãy uncomment middleware này để bảo mật route

const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(createCategory); 

router.route('/:id')
    .put(updateCategory)
    .delete(deleteCategory);

export default router;