const db = require('../config/db');

class Cart {
  static async getByUserId(userId) {
    try {
      const [rows] = await db.query(`
        SELECT 
          gh.*, 
          sp.TenSanPham, 
          sp.Gia, 
          sp.Hinh,
          sp.MaDanMuc
        FROM giohang gh
        JOIN sanpham sp ON gh.MaSanPham = sp.MaSanPham
        WHERE gh.MaKhachHang = ?
        ORDER BY gh.CreatedAt DESC
      `, [userId]);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      throw error;
    }
  }


static async addItem(userId, productId, quantity, size) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Kiểm tra sản phẩm có tồn tại không
    const [product] = await conn.query(
      'SELECT * FROM sanpham WHERE MaSanPham = ?',
      [productId]
    );
    
    if (!product.length) {
      throw new Error('Sản phẩm không tồn tại');
    }

    // Kiểm tra số lượng tồn kho
    if (product[0].SoLuong < quantity) {
      throw new Error('Số lượng sản phẩm không đủ');
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const [existing] = await conn.query(
      'SELECT * FROM giohang WHERE MaKhachHang = ? AND MaSanPham = ? AND Size = ?',
      [userId, productId, size]
    );

    if (existing.length > 0) {
      // Nếu đã có thì cập nhật số lượng
      const newQuantity = existing[0].SoLuong + quantity;
      
      // Kiểm tra lại số lượng tồn kho
      if (product[0].SoLuong < newQuantity) {
        throw new Error('Số lượng sản phẩm không đủ');
      }

      await conn.query(
        'UPDATE giohang SET SoLuong = ? WHERE MaGioHang = ?',
        [newQuantity, existing[0].MaGioHang]
      );
    } else {
      // Nếu chưa có thì thêm mới
      await conn.query(
        'INSERT INTO giohang (MaKhachHang, MaSanPham, SoLuong, Size, Hinh) VALUES (?, ?, ?, ?, ?)',
        [userId, productId, quantity, size, product[0].Hinh]
      );
    }

    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    console.error('Lỗi khi thêm vào giỏ hàng:', error);
    throw error;
  } finally {
    conn.release();
  }
}
  static async updateItem(cartId, quantity) {
    // Kiểm tra số lượng hợp lệ
    if (quantity < 1) {
      throw new Error('Số lượng phải lớn hơn 0');
    }

    // Lấy thông tin sản phẩm trong giỏ hàng
    const [cartItem] = await db.query(
      'SELECT gh.*, sp.SoLuong as stock FROM giohang gh JOIN sanpham sp ON gh.MaSanPham = sp.MaSanPham WHERE gh.MaGioHang = ?',
      [cartId]
    );

    if (!cartItem.length) {
      throw new Error('Sản phẩm không tồn tại trong giỏ hàng');
    }

    // Kiểm tra số lượng tồn kho
    if (cartItem[0].stock < quantity) {
      throw new Error('Số lượng sản phẩm không đủ');
    }

    await db.query(
      'UPDATE giohang SET SoLuong = ? WHERE MaGioHang = ?',
      [quantity, cartId]
    );
    return true;
  }

  static async removeItem(cartId) {
    const [result] = await db.query('DELETE FROM giohang WHERE MaGioHang = ?', [cartId]);
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
    }
    return true;
  }

  static async clearCart(userId) {
    await db.query('DELETE FROM giohang WHERE MaKhachHang = ?', [userId]);
    return true;
  }
}

module.exports = Cart;