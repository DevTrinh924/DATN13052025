const db = require('../config/db');

class Promotion {
  static async getAll(filters = {}) {
    let query = `SELECT * FROM khuyenmai`;
    const params = [];
    
    // Xử lý các bộ lọc
    const conditions = [];
    if (filters.search) {
      conditions.push(`TenKhuyenMai LIKE ?`);
      params.push(`%${filters.search}%`);
    }
    if (filters.status) {
      conditions.push(`TrangThai = ?`);
      params.push(filters.status);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
    
    // Xử lý sắp xếp
    if (filters.sort) {
      switch (filters.sort) {
        case 'newest':
          query += ` ORDER BY NgayBatDau DESC`;
          break;
        case 'oldest':
          query += ` ORDER BY NgayBatDau ASC`;
          break;
        case 'start_date':
          query += ` ORDER BY NgayBatDau`;
          break;
        case 'end_date':
          query += ` ORDER BY NgayKetThuc`;
          break;
      }
    }
    
    const [rows] = await db.query(query, params);
    return rows;
  }

static async getById(id) {
  const [rows] = await db.query(
    'SELECT * FROM khuyenmai WHERE MaKhuyenMai = ?',
    [id]
  );
  return rows[0];
}
static async create(promotionData) {
  const {   
    TenKhuyenMai, 
    MoTa, 
    hinh_TM, 
    PhanTramGiam, 
    MaVoucher,
    NgayBatDau, 
    NgayKetThuc, 
    DieuKienApDung, 
    TrangThai
  } = promotionData;
  
  const [result] = await db.query(
    `INSERT INTO khuyenmai 
    (TenKhuyenMai, MoTa, hinh_TM, PhanTramGiam, MaVoucher, NgayBatDau, NgayKetThuc, DieuKienApDung, TrangThai) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      TenKhuyenMai, 
      MoTa || null, 
      hinh_TM || null, 
      PhanTramGiam, 
      MaVoucher || null, 
      NgayBatDau, 
      NgayKetThuc, 
      DieuKienApDung || null, 
      TrangThai || 'chua_bat_dau'
    ]
  );
  
  return this.getById(result.insertId);
}
  static async update(id, promotionData) {
    const { 
      TenKhuyenMai, 
      MoTa, 
      hinh_TM, 
      PhanTramGiam, 
      MaVoucher,
      NgayBatDau, 
      NgayKetThuc, 
      DieuKienApDung, 
      TrangThai
    } = promotionData;
    
    await db.query(
      `UPDATE khuyenmai SET 
        TenKhuyenMai = ?, 
        MoTa = ?, 
        hinh_TM = ?, 
        PhanTramGiam = ?, 
        MaVoucher = ?,
        NgayBatDau = ?, 
        NgayKetThuc = ?, 
        DieuKienApDung = ?, 
        TrangThai = ?
      WHERE MaKhuyenMai = ?`,
      [TenKhuyenMai, MoTa, hinh_TM, PhanTramGiam, MaVoucher, NgayBatDau, NgayKetThuc, DieuKienApDung, TrangThai,id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    // Xóa các quan hệ trước
    await db.query(`DELETE FROM danhmuc_khuyenmai WHERE MaKhuyenMai = ?`, [id]);
    await db.query(`DELETE FROM sanpham_khuyenmai WHERE MaKhuyenMai = ?`, [id]);
    
    // Sau đó xóa khuyến mãi
    await db.query(`DELETE FROM khuyenmai WHERE MaKhuyenMai = ?`, [id]);
    return true;
  }
  static async getByCode(code) {
  const [rows] = await db.query(
    'SELECT * FROM khuyenmai WHERE MaVoucher = ?',
    [code]
  );
  return rows[0];
}
}

module.exports = Promotion;