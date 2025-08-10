const db = require('../config/db');

class Category {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM danhmucsanpham');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM danhmucsanpham WHERE MaDanMuc = ?', [id]);
    return rows[0];
  }

  static async create(TenDanMuc, hinh_dm) {
    const [result] = await db.query(
      'INSERT INTO danhmucsanpham (TenDanMuc, hinh_dm) VALUES (?, ?)',
      [TenDanMuc, hinh_dm]
    );
    return result.insertId;
  }

  static async update(id, TenDanMuc, hinh_dm) {
    await db.query(
      'UPDATE danhmucsanpham SET TenDanMuc = ?, hinh_dm = ? WHERE MaDanMuc = ?',
      [TenDanMuc, hinh_dm, id]
    );
  }

  static async delete(id) {
    await db.query('DELETE FROM danhmucsanpham WHERE MaDanMuc = ?', [id]);
  }
}

module.exports = Category;