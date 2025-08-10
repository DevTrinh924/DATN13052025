const express = require('express');
const router = express.Router();
const productsController = require('../controllers/Products.controller');
const upload = require('../utils/upload');

// Sửa: Thêm middleware upload vào các route cần thiết
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductById);
router.post('/', upload.single('Hinh'), productsController.createProduct); // Thêm middleware
router.put('/:id', upload.single('Hinh'), productsController.updateProduct); // Thêm middleware
router.delete('/:id', productsController.deleteProduct);
router.get('/category/:categoryId', productsController.getProductsByCategory);

module.exports = router;