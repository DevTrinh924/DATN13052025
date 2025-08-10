const db = require('../config/db');

class Product {
  static async getAll() {
    const [rows] = await db.query(`
      SELECT sp.*, dm.TenDanMuc 
      FROM sanpham sp
      JOIN danhmucsanpham dm ON sp.MaDanMuc = dm.MaDanMuc
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(`
      SELECT sp.*, dm.TenDanMuc 
      FROM sanpham sp
      JOIN danhmucsanpham dm ON sp.MaDanMuc = dm.MaDanMuc
      WHERE sp.MaSanPham = ?
    `, [id]);
    return rows[0];
  }

static async create(productData) {
  const { 
    TenSanPham, 
    Gia, 
    Hinh, 
    SoLuong, 
    MoTaNgan, 
    Size, 
    PhanLoai = 'Unisex', // Thêm trường này, mặc định là Unisex
    ChatLieu, 
    NoiDungChiTiet, 
    MaDanMuc 
  } = productData;

  const [result] = await db.query(
    `INSERT INTO sanpham 
     (TenSanPham, Gia, Hinh, SoLuong, MoTaNgan, Size, PhanLoai, ChatLieu, NoiDungChiTiet, MaDanMuc) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [TenSanPham, Gia, Hinh, SoLuong, MoTaNgan, Size, PhanLoai, ChatLieu, NoiDungChiTiet, MaDanMuc]
  );
  
  return result.insertId;
}

static async update(id, productData) {
  const { 
    TenSanPham, 
    Gia, 
    Hinh, 
    SoLuong, 
    MoTaNgan, 
    Size, 
    PhanLoai = 'Unisex', // Thêm trường này, mặc định là Unisex
    ChatLieu, 
    NoiDungChiTiet, 
    MaDanMuc 
  } = productData;

  await db.query(
    `UPDATE sanpham SET 
      TenSanPham = ?, 
      Gia = ?, 
      ${Hinh !== undefined ? 'Hinh = ?,' : ''}
      SoLuong = ?, 
      MoTaNgan = ?, 
      Size = ?, 
      PhanLoai = ?,
      ChatLieu = ?, 
      NoiDungChiTiet = ?, 
      MaDanMuc = ?
     WHERE MaSanPham = ?`,
    [
      TenSanPham, 
      Gia,
      ...(Hinh !== undefined ? [Hinh] : []),
      SoLuong, 
      MoTaNgan, 
      Size, 
      PhanLoai,
      ChatLieu, 
      NoiDungChiTiet, 
      MaDanMuc, 
      id
    ].filter(x => x !== undefined)
  );
  
  return this.getById(id);
}

  static async delete(id) {
    await db.query('DELETE FROM sanpham WHERE MaSanPham = ?', [id]);
    return true;
  }

  static async getByCategory(categoryId) {
    const [rows] = await db.query(
      'SELECT * FROM sanpham WHERE MaDanMuc = ?',
      [categoryId]
    );
    return rows;
  }
}

module.exports = Product;