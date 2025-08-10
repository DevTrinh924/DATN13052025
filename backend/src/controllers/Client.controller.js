const Client = require('../models/Client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getImageUrl = (filename) => {
  if (!filename) return null;
  return `/uploads/${filename}`;
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.getAll();
    const clientsWithImageUrl = clients.map((client) => ({
      ...client,
      avatar: client.avatar ? getImageUrl(client.avatar) : null,
    }));
    res.json(clientsWithImageUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.getById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    res.json({
      ...client,
      avatar: getImageUrl(client.avatar),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { HoTen, Email, MatKhau, DiaChi, SoDienThoai, VaiTro } = req.body;
    let avatarFilename = req.file ? req.file.filename : '';

    const clientData = {
      HoTen,
      Email,
      MatKhau,
      DiaChi,
      SoDienThoai,
      VaiTro: VaiTro || 'user',
      avatar: avatarFilename
    };

    const id = await Client.create(clientData);
    res.status(201).json({ id, ...clientData, avatar: getImageUrl(avatarFilename) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const currentClient = await Client.getById(id);
    if (!currentClient) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    let avatarFilename = currentClient.avatar;
    if (req.file) {
      if (currentClient.avatar) {
        const oldImagePath = path.join(__dirname, '../../uploads', currentClient.avatar);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      avatarFilename = req.file.filename;
    }

    const clientData = {
      HoTen: req.body.HoTen || currentClient.HoTen,
      Email: req.body.Email || currentClient.Email,
      DiaChi: req.body.DiaChi || currentClient.DiaChi,
      SoDienThoai: req.body.SoDienThoai || currentClient.SoDienThoai,
      VaiTro: req.body.VaiTro || currentClient.VaiTro,
      avatar: avatarFilename
    };

    if (req.body.MatKhau) {
      clientData.MatKhau = req.body.MatKhau;
    }

    await Client.update(id, clientData);
    res.json({ id, ...clientData, avatar: getImageUrl(avatarFilename) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.getById(id);
    
    if (client && client.avatar) {
      const imagePath = path.join(__dirname, '../../uploads', client.avatar);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Client.delete(id);
    res.json({ message: 'Xóa khách hàng thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// fdgf
exports.login = async (req, res) => {
  try {
    const { Email, MatKhau } = req.body;
    const client = await Client.getByEmail(Email);
    
    if (!client) {
      return res.status(401).json({ success: false, message: 'Email không tồn tại' });
    }

    const isMatch = await bcrypt.compare(MatKhau, client.MatKhau);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { 
        MaKhachHang: client.MaKhachHang, 
        Email: client.Email, 
        VaiTro: client.VaiTro 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ 
      success: true, 
      token,
      user: {
        MaKhachHang: client.MaKhachHang,
        HoTen: client.HoTen,
        Email: client.Email,
        VaiTro: client.VaiTro,
        avatar: client.avatar ? `/uploads/${client.avatar}` : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { HoTen, Email, MatKhau, DiaChi, SoDienThoai } = req.body;
    
    const existingClient = await Client.getByEmail(Email);
    if (existingClient) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const clientData = {
      HoTen,
      Email,
      MatKhau,
      DiaChi: DiaChi || '',
      SoDienThoai: SoDienThoai || '',
      VaiTro: 'user',
      avatar: req.file ? req.file.filename : ''
    };

    const id = await Client.create(clientData);
    
    const token = jwt.sign(
      { 
        MaKhachHang: id, 
        Email: clientData.Email, 
        VaiTro: clientData.VaiTro 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      success: true, 
      token,
      user: {
        MaKhachHang: id,
        HoTen: clientData.HoTen,
        Email: clientData.Email,
        VaiTro: clientData.VaiTro,
        avatar: clientData.avatar ? `/uploads/${clientData.avatar}` : null
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const client = await Client.getById(req.user.MaKhachHang);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
      // Debug log
    console.log("Vai trò người dùng hiện tại:", client.VaiTro);
    res.json({
      success: true,
      user: {
        ...client,
        avatar: client.avatar ? `/uploads/${client.avatar}` : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};