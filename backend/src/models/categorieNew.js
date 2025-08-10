const db = require('../config/db');

class CategoryNews {
  static async getAll() {
    const [rows] = await db.query(`
      SELECT 
        MaDanMucTT,
        TenDanMucTT
      FROM danhmuctintuc 
      ORDER BY MaDanMucTT ASC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(`
      SELECT 
        MaDanMucTT,
        TenDanMucTT
      FROM danhmuctintuc 
      WHERE MaDanMucTT = ?
    `, [id]);
    return rows[0];
  }

  static async create(TenDanMucTT) {
    const [result] = await db.query(
      'INSERT INTO danhmuctintuc (TenDanMucTT) VALUES (?)',
      [TenDanMucTT]
    );
    return { MaDanMucTT: result.insertId, TenDanMucTT };
  }

  static async update(id, TenDanMucTT) {
    await db.query(
      'UPDATE danhmuctintuc SET TenDanMucTT = ? WHERE MaDanMucTT = ?',
      [TenDanMucTT, id]
    );
    return { MaDanMucTT: id, TenDanMucTT };
  }

  static async delete(id) {
    await db.query('DELETE FROM danhmuctintuc WHERE MaDanMucTT = ?', [id]);
  }
}

module.exports = CategoryNews;