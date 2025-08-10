const express = require('express');
const router = express.Router();
const PromotionController = require('../controllers/Promotion.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../utils/upload');

router.get('/', authMiddleware,PromotionController.getAllPromotions);
router.get('/:id', authMiddleware, PromotionController.getPromotionById);
router.post('/', authMiddleware, upload.single('hinh_TM'), PromotionController.createPromotion);

router.post('/apply', authMiddleware, PromotionController.applyPromotion); // Thêm route mới
router.put('/:id', authMiddleware, upload.single('hinh_TM'), PromotionController.updatePromotion);
router.delete('/:id', authMiddleware,PromotionController.deletePromotion);

module.exports = router;