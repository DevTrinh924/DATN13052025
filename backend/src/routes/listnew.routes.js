const express = require('express');
const router = express.Router();
const listnewController = require('../controllers/listnew.controller');
const upload = require('../utils/upload');

// Get all news
router.get('/', listnewController.getAllListnew);

// Get news by ID
router.get('/:id', listnewController.getNewsById);

// Create new news
router.post('/', upload.single('Hinh'), listnewController.createNews);

// Update news
router.put('/:id', upload.single('Hinh'), listnewController.updateNews);

// Delete news
router.delete('/:id', listnewController.deleteNews);

// Get news by category
router.get('/category/:categoryId', listnewController.getNewsByCategory);

module.exports = router;