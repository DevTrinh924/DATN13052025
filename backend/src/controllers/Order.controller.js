const Order = require('../models/Order');

// Lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const { status, fromDate, toDate, paymentStatus, customerName } = req.query;
    
    const orders = await Order.searchOrders({
      status,
      fromDate,
      toDate,
      paymentStatus,
      customerName
    });
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('LỖI KHI LẤY ĐƠN HÀNG:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderById = async (req, res) => {
  try {
    console.log('Fetching order details for ID:', req.params.id);
    const order = await Order.getById(req.params.id);
    if (!order) {
      console.log('Order not found for ID:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng' 
      });
    }
    
    const details = await Order.getOrderDetails(req.params.id);
    console.log('Order details:', details);
    
    res.json({ 
      success: true,
      data: {
        ...order,
        chiTiet: details || [] // Đảm bảo luôn trả về mảng
      }
    });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy thông tin đơn hàng',
      error: error.message
    });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;
    
    // Đổi từ 'da _xac_nhan' thành 'da_xac_nhan'
    if (!['cho_xac_nhan','da_xac_nhan', 'dang_giao', 'da_giao', 'da_huy'].includes(newStatus)) {
      return res.status(400).json({ 
        success: false,
        message: 'Trạng thái không hợp lệ' 
      });
    }
    
    await Order.updateStatus(id, newStatus);
    res.json({ 
      success: true,
      message: 'Cập nhật trạng thái thành công' 
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      success: false,
      message: 'Lỗi khi cập nhật trạng thái' 
    });
  }
};

// Lấy thống kê đơn hàng
exports.getOrderStatistics = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const stats = await Order.getOrderStatistics({ fromDate, toDate });
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy thống kê' 
    });
  }
};
//Thêm controller xóa đơn hàng// Trong Order.controller.js
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    const deleted = await Order.deleteOrder(req.params.id);
    if (!deleted) {
      return res.status(400).json({ 
        success: false, 
        message: 'Xóa đơn hàng không thành công' 
      });
    }

    res.json({ 
      success: true,
      message: 'Xóa đơn hàng thành công' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa đơn hàng',
      error: error.message 
    });
  }
};
// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { 
      customerId, 
      items, 
      paymentMethod, 
      shippingAddress, 
      totalAmount,
      TenNguoiNhan,
      SoDienThoaiNhan,
      MaKhuyenMai 
    } = req.body;
    
    if (!customerId || !items || !paymentMethod || !shippingAddress || !totalAmount || !TenNguoiNhan || !SoDienThoaiNhan) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    const newOrder = await Order.create({
      customerId,
      items,
      paymentMethod,
      shippingAddress,
      totalAmount,
      TenNguoiNhan,
      SoDienThoaiNhan,
      MaKhuyenMai: MaKhuyenMai || null
    });

    res.status(201).json({
      success: true,
      data: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};
