const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Không có token, truy cập bị từ chối' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Debug log
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Token không hợp lệ' 
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.VaiTro !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Truy cập bị từ chối, yêu cầu quyền admin' 
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };