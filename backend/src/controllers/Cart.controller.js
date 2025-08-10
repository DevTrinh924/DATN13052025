const Cart = require("../models/Cart");
const db = require("../config/db"); // Thêm dòng này

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.MaKhachHang;
    const cartItems = await Cart.getByUserId(userId);
    res.json({
      success: true,
      data: cartItems
    });
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.MaKhachHang;
    const { productId, quantity = 1, size } = req.body; // Nhận các trường này từ request
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sản phẩm'
      });
    }

    const result = await Cart.addItem(userId, productId, quantity, size);
    const cartItems = await Cart.getByUserId(userId);
    
    res.status(201).json({
      success: true,
      data: cartItems,
      message: 'Đã thêm sản phẩm vào giỏ hàng'
    });
  } catch (error) {
    console.error('Lỗi khi thêm vào giỏ hàng:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.MaKhachHang;
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng không hợp lệ'
      });
    }

    await Cart.updateItem(id, quantity);
    const cartItems = await Cart.getByUserId(userId);
    
    res.json({
      success: true,
      data: cartItems,
      message: 'Đã cập nhật giỏ hàng'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.MaKhachHang;
    const { id } = req.params;
    
    await Cart.removeItem(id);
    const cartItems = await Cart.getByUserId(userId);
    
    res.json({
      success: true,
      data: cartItems,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.MaKhachHang;
    await Cart.clearCart(userId);
    res.json({ 
      success: true,
      message: "Đã xóa toàn bộ giỏ hàng" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.user.MaKhachHang;
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM giohang WHERE MaKhachHang = ?',
      [userId]
    );
    res.json({
      success: true,
      count: result[0].count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};