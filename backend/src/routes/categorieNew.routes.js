const express = require('express');
const router = express.Router();
const controller = require('../controllers/categorieNew.controller');

// GET /api/categorienew - Lấy tất cả danh mục
router.get('/', controller.getAllCategories);

// GET /api/categorienew/:id - Lấy danh mục theo ID
router.get('/:id', controller.getCategoryById);

// POST /api/categorienew - Tạo danh mục mới
router.post('/', controller.createCategory);

// PUT /api/categorienew/:id - Cập nhật danh mục
router.put('/:id', controller.updateCategory);

// DELETE /api/categorienew/:id - Xóa danh mục
router.delete('/:id', controller.deleteCategory);

module.exports = router;