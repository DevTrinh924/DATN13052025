const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Client {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM khachhang');
    return rows;
  }
  static async getByEmail(email) {
    const [rows] = await db.query('SELECT * FROM khachhang WHERE Email = ?', [email]);
    return rows[0];
  }
  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM khachhang WHERE MaKhachHang = ?', [id]);
    return rows[0];
  }

  static async create(clientData) {
    const { HoTen, Email, MatKhau, DiaChi, SoDienThoai, VaiTro, avatar } = clientData;
    
    const hashedPassword = await bcrypt.hash(MatKhau, 10);
    
    const [result] = await db.query(
      'INSERT INTO khachhang (HoTen, Email, MatKhau, DiaChi, SoDienThoai, VaiTro, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [HoTen, Email, hashedPassword, DiaChi, SoDienThoai, VaiTro || 'user', avatar || '']
    );
    return result.insertId;
  }

  static async update(id, clientData) {
    const { HoTen, Email, MatKhau, DiaChi, SoDienThoai, VaiTro, avatar } = clientData;
    
    let updateQuery = 'UPDATE khachhang SET HoTen = ?, Email = ?, DiaChi = ?, SoDienThoai = ?, VaiTro = ?';
    const queryParams = [HoTen, Email, DiaChi, SoDienThoai, VaiTro];
    
    if (MatKhau) {
      const hashedPassword = await bcrypt.hash(MatKhau, 10);
      updateQuery += ', MatKhau = ?';
      queryParams.push(hashedPassword);
    }
    
    if (avatar) {
      updateQuery += ', avatar = ?';
      queryParams.push(avatar);
    }
    
    updateQuery += ' WHERE MaKhachHang = ?';
    queryParams.push(id);
    
    await db.query(updateQuery, queryParams);
  }

  static async delete(id) {
    await db.query('DELETE FROM khachhang WHERE MaKhachHang = ?', [id]);
  }
}

module.exports = Client;