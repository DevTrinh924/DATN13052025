// backend/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jewelry_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: process.env.DB_PORT || 3306
});
// Kiểm tra kết nối database
const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log('Kết nối database thành công!');
    connection.release();
  } catch (error) {
    console.error('Lỗi kết nối database:', error.message);
    process.exit(1); // Thoát ứng dụng nếu không kết nối được
  }
};

testConnection();

module.exports = db;