const db = require('../config/db');

class News {
  static async getAll() {
    const [rows] = await db.query(`
      SELECT t.*, d.TenDanMucTT
      FROM tintuc t
      JOIN danhmuctintuc d ON t.MaDanMucTT = d.MaDanMucTT
      ORDER BY t.MaTinTuc DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(`
      SELECT t.*, d.TenDanMucTT
      FROM tintuc t
      JOIN danhmuctintuc d ON t.MaDanMucTT = d.MaDanMucTT
      WHERE t.MaTinTuc = ?
    `, [id]);
    return rows[0];
  }

  static async create(newsData) {
    const { 
      TieuDe, 
      MoTaNgan, 
      Hinh, 
      NoiDungChiTiet, 
      MaDanMucTT
    } = newsData;

    const [result] = await db.query(
      `INSERT INTO tintuc 
       (TieuDe, MoTaNgan, Hinh, NoiDungChiTiet, MaDanMucTT) 
       VALUES (?, ?, ?, ?, ?)`,
      [TieuDe, MoTaNgan, Hinh || null, NoiDungChiTiet, MaDanMucTT]
    );
    
    return result.insertId;
  }

  static async update(id, newsData) {
    const { 
      TieuDe, 
      MoTaNgan, 
      Hinh, 
      NoiDungChiTiet, 
      MaDanMucTT
    } = newsData;

    const queryParts = [];
    const queryParams = [];
    
    queryParts.push('TieuDe = ?');
    queryParams.push(TieuDe);
    
    queryParts.push('MoTaNgan = ?');
    queryParams.push(MoTaNgan);
    
    if (Hinh !== undefined) {
      queryParts.push('Hinh = ?');
      queryParams.push(Hinh);
    }
    
    queryParts.push('NoiDungChiTiet = ?');
    queryParams.push(NoiDungChiTiet);
    
    queryParts.push('MaDanMucTT = ?');
    queryParams.push(MaDanMucTT);
    
    queryParams.push(id);
    
    const query = `UPDATE tintuc SET ${queryParts.join(', ')} WHERE MaTinTuc = ?`;
    
    await db.query(query, queryParams);
    
    return this.getById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM tintuc WHERE MaTinTuc = ?', [id]);
    return true;
  }

  static async getByCategory(categoryId) {
    const [rows] = await db.query(
      'SELECT t.*, d.TenDanMucTT FROM tintuc t JOIN danhmuctintuc d ON t.MaDanMucTT = d.MaDanMucTT WHERE t.MaDanMucTT = ? ORDER BY t.MaTinTuc DESC',
      [categoryId]
    );
    return rows;
  }
}

module.exports = News;