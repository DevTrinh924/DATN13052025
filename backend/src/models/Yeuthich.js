const db = require('../config/db');

class Yeuthich {
  static async getAll() {
    const [rows] = await db.query(`
      SELECT yt.*, sp.TenSanPham, sp.Gia, sp.Hinh AS SanPhamHinh, sp.Size, sp.ChatLieu, sp.NoiDungChiTiet,
             dm.TenDanMuc, kh.HoTen, kh.avatar AS KhachHangAvatar 
      FROM yeuthich yt
      JOIN sanpham sp ON yt.MaSanPham = sp.MaSanPham
      JOIN danhmucsanpham dm ON sp.MaDanMuc = dm.MaDanMuc
      JOIN khachhang kh ON yt.MaKhachHang = kh.MaKhachHang
      ORDER BY yt.NgayThem DESC
    `);
    return rows;
  }

  static async getById({ MaKhachHang, MaSanPham }) {
    const [rows] = await db.query(`
      SELECT yt.*, 
             sp.TenSanPham, sp.Gia, sp.Hinh AS SanPhamHinh, sp.Size, sp.ChatLieu, sp.NoiDungChiTiet,
             dm.TenDanMuc, 
             kh.HoTen, kh.avatar AS KhachHangAvatar
      FROM yeuthich yt
      JOIN sanpham sp ON yt.MaSanPham = sp.MaSanPham
      JOIN danhmucsanpham dm ON sp.MaDanMuc = dm.MaDanMuc
      JOIN khachhang kh ON yt.MaKhachHang = kh.MaKhachHang
      WHERE yt.MaKhachHang = ? AND yt.MaSanPham = ?
    `, [MaKhachHang, MaSanPham]);
    return rows[0];
  }

  static async create({ MaKhachHang, MaSanPham }) {
    await db.query(
      'INSERT INTO yeuthich (MaKhachHang, MaSanPham, NgayThem) VALUES (?, ?, NOW())',
      [MaKhachHang, MaSanPham]
    );
  }

static async delete({ MaKhachHang, MaSanPham }) {
  await db.query(
    'DELETE FROM yeuthich WHERE MaKhachHang = ? AND MaSanPham = ?',
    [MaKhachHang, MaSanPham]
  );
}

static async checkExisting({ MaKhachHang, MaSanPham }) {
  const [rows] = await db.query(
    'SELECT * FROM yeuthich WHERE MaKhachHang = ? AND MaSanPham = ?',
    [MaKhachHang, MaSanPham]
  );
  return rows.length > 0;
}
static async getPopularFavorites() {
  const [rows] = await db.query(`
    SELECT 
      sp.MaSanPham,
      sp.TenSanPham,
      sp.Gia,
      sp.Hinh,
      sp.MoTaNgan,
      sp.Size,
      sp.ChatLieu,
      sp.NoiDungChiTiet,
      sp.MaDanMuc,
      dm.TenDanMuc,
      COUNT(yt.MaSanPham) as SoLuongYeuThich
    FROM yeuthich yt
    JOIN sanpham sp ON yt.MaSanPham = sp.MaSanPham
    JOIN danhmucsanpham dm ON sp.MaDanMuc = dm.MaDanMuc
    GROUP BY yt.MaSanPham
    ORDER BY SoLuongYeuThich DESC
    LIMIT 6
  `);
  return rows;
}
}

module.exports = Yeuthich;