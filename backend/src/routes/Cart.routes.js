const express = require('express');
const router = express.Router();
const CartController = require('../controllers/Cart.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/',authMiddleware, CartController.getCart);
router.post('/',authMiddleware, CartController.addToCart);
router.put('/:id',authMiddleware, CartController.updateCartItem);
router.delete('/:id',authMiddleware, CartController.removeFromCart);
router.delete('/',authMiddleware, CartController.clearCart);
// routes/Cart.routes.js
router.get('/count', authMiddleware, CartController.getCartCount);
module.exports = router;