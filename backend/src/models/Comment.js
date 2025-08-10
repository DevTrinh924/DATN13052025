const db = require("../config/db");

class Comment {
  static async getAll() {
    const [rows] = await db.query(`
      SELECT dg.*, sp.TenSanPham, kh.HoTen, kh.avatar 
      FROM danhgia dg
      JOIN sanpham sp ON dg.MaSanPham = sp.MaSanPham
      JOIN khachhang kh ON dg.MaKhachHang = kh.MaKhachHang
    `);
    return rows;
  }

  static async approve(id) {
    await db.query(
      'UPDATE danhgia SET TrangThai = "da_duyet" WHERE MaDanhGia = ?',
      [id]
    );
  }
  static async create(commentData) {
    const { SoSao, BinhLuan, MaKhachHang, MaSanPham } = commentData;

    // Thêm kiểm tra hợp lệ
    if (!MaKhachHang || !MaSanPham) {
      throw new Error("Thiếu thông tin bắt buộc");
    }

    const [result] = await db.query(
      'INSERT INTO danhgia (SoSao, BinhLuan, NgayDanhGia, MaKhachHang, MaSanPham, TrangThai) VALUES (?, ?, CURDATE(), ?, ?, "cho_duyet")',
      [SoSao, BinhLuan, MaKhachHang, MaSanPham]
    );
    return result.insertId;
  }
  static async reject(id) {
    await db.query(
      'UPDATE danhgia SET TrangThai = "tu_choi" WHERE MaDanhGia = ?',
      [id]
    );
  }

  static async delete(id) {
    await db.query("DELETE FROM danhgia WHERE MaDanhGia = ?", [id]);
  }
}

module.exports = Comment;
