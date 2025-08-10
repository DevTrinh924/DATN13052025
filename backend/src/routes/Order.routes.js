const express = require('express');
const router = express.Router();
const orderController = require('../controllers/Order.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
router.post('/', authMiddleware, orderController.createOrder);
// Lấy tất cả đơn hàng với bộ lọc
router.get('/', orderController.getAllOrders);
// Lấy thông tin chi tiết đơn hàng
router.get('/:id', orderController.getOrderById);
// Cập nhật trạng thái đơn hàng
router.put('/:id/status', orderController.updateOrderStatus);
// Lấy thống kê đơn hàng
router.get('/stats/summary', orderController.getOrderStatistics);
router.delete('/:id', orderController.deleteOrder); 
module.exports = router;