const db = require('../config/db');

class Order {
  static async getAll() {
    const [rows] = await db.query(`
      SELECT 
        dh.*, 
        kh.HoTen AS TenKhachHang, 
        kh.SoDienThoai,
        kh.Email
      FROM donhang dh
      JOIN khachhang kh ON dh.MaKhachHang = kh.MaKhachHang
      ORDER BY dh.NgayDat DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(`
      SELECT 
        dh.*, 
        kh.HoTen AS TenKhachHang, 
        kh.SoDienThoai, 
        kh.Email
      FROM donhang dh
      JOIN khachhang kh ON dh.MaKhachHang = kh.MaKhachHang
      WHERE dh.MaDonHang = ?
    `, [id]);
    return rows[0];
  }

  static async getOrderDetails(orderId) {
    try {
      const [rows] = await db.query(`
        SELECT 
          ctdh.*, 
          sp.TenSanPham, 
          sp.Hinh
        FROM chitietdonhang ctdh
        JOIN sanpham sp ON ctdh.MaSanPham = sp.MaSanPham
        WHERE ctdh.MaDonHang = ?
      `, [orderId]);
      return rows;
    } catch (error) {
      console.error('Error in getOrderDetails:', error);
      throw error;
    }
  }

  static async updateStatus(id, newStatus) {
    await db.query(
      'UPDATE donhang SET TrangThai = ? WHERE MaDonHang = ?', 
      [newStatus, id]
    );
    return true;
  }

  static async searchOrders({ status, fromDate, toDate, paymentStatus, customerName }) {
    let query = `
      SELECT 
        dh.*, 
        kh.HoTen AS TenKhachHang,
        kh.SoDienThoai
      FROM donhang dh
      JOIN khachhang kh ON dh.MaKhachHang = kh.MaKhachHang
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND dh.TrangThai = ?';
      params.push(status);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query += ' AND dh.TrangThaiThanhToan = ?';
      params.push(paymentStatus);
    }

    if (fromDate) {
      query += ' AND dh.NgayDat >= ?';
      params.push(fromDate);
    }

    if (toDate) {
      query += ' AND dh.NgayDat <= ?';
      params.push(toDate);
    }

    if (customerName) {
      query += ' AND kh.HoTen LIKE ?';
      params.push(`%${customerName}%`);
    }

    query += ' ORDER BY dh.NgayDat DESC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async deleteOrder(id) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      
      await conn.query('DELETE FROM chitietdonhang WHERE MaDonHang = ?', [id]);
      
      const [result] = await conn.query('DELETE FROM donhang WHERE MaDonHang = ?', [id]);
      
      await conn.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async create({ customerId, items, paymentMethod, shippingAddress, totalAmount, TenNguoiNhan, SoDienThoaiNhan, MaKhuyenMai }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      
      const [orderResult] = await conn.query(
        `INSERT INTO donhang 
        (MaKhachHang, PhuongThucThanhToan, DiaChiGiaoHang, TongTien, TenNguoiNhan, SoDienThoaiNhan, MaKhuyenMai, NgayDat, TrangThai, TrangThaiThanhToan) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'cho_xac_nhan', 'chua_thanh_toan')`,
        [customerId, paymentMethod, shippingAddress, totalAmount, TenNguoiNhan, SoDienThoaiNhan, MaKhuyenMai || null]
      );
      
      const orderId = orderResult.insertId;
      
      for (const item of items) {
        await conn.query(
          'INSERT INTO chitietdonhang (MaDonHang, MaSanPham, SoLuong, GiaTien, Size, Hinh) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, item.productId, item.quantity, item.price, item.size, item.Hinh || '']
        );
      }
      
      await conn.commit();
      return await this.getById(orderId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async getOrderStatistics({ fromDate, toDate, year, quarter }) {
    try {
      let query = `
        SELECT 
          COUNT(dh.MaDonHang) as totalOrders,
          SUM(dh.TongTien) as totalRevenue
        FROM donhang dh
        WHERE 1=1
      `;
      const params = [];

      if (fromDate) {
        query += ' AND dh.NgayDat >= ?';
        params.push(fromDate);
      }

      if (toDate) {
        query += ' AND dh.NgayDat <= ?';
        params.push(toDate);
      }

      const [stats] = await db.query(query, params);

      // Thống kê doanh thu theo tháng
      let monthlyRevenueQuery = `
        SELECT 
          DATE_FORMAT(dh.NgayDat, '%Y-%m') as month,
          SUM(dh.TongTien) as revenue
        FROM donhang dh
        WHERE YEAR(dh.NgayDat) = ?
        GROUP BY DATE_FORMAT(dh.NgayDat, '%Y-%m')
      `;
      const monthlyParams = [year || new Date().getFullYear()];
      const [monthlyRevenue] = await db.query(monthlyRevenueQuery, monthlyParams);

      // Thống kê sản phẩm bán chạy
      let topProductsQuery = `
        SELECT 
          sp.TenSanPham as name,
          SUM(ctdh.SoLuong) as count
        FROM chitietdonhang ctdh
        JOIN sanpham sp ON ctdh.MaSanPham = sp.MaSanPham
        JOIN donhang dh ON ctdh.MaDonHang = dh.MaDonHang
        WHERE 1=1
      `;
      const topProductsParams = [];

      if (quarter) {
        const quarterMonths = {
          '1': ['01', '02', '03'],
          '2': ['04', '05', '06'],
          '3': ['07', '08', '09'],
          '4': ['10', '11', '12'],
        };
        topProductsQuery += ` AND MONTH(dh.NgayDat) IN (${quarterMonths[quarter].map(() => '?').join(',')})`;
        topProductsParams.push(...quarterMonths[quarter]);
      }

      topProductsQuery += ' GROUP BY sp.MaSanPham ORDER BY count DESC LIMIT 5';
      const [topProducts] = await db.query(topProductsQuery, topProductsParams);

      return {
        totalRevenue: stats[0].totalRevenue || 0,
        totalOrders: stats[0].totalOrders || 0,
        monthlyRevenue: monthlyRevenue.reduce((acc, row) => {
          acc[row.month] = row.revenue;
          return acc;
        }, {}),
        topProducts: topProducts.map((row) => ({
          name: row.name,
          count: row.count,
        })),
      };
    } catch (error) {
      console.error('Lỗi khi lấy thống kê đơn hàng:', error);
      throw error;
    }
  }
}

module.exports = Order;