// backend/controllers/Yeuthich.controller.js
const db = require('../config/db'); // Thêm dòng này
const Yeuthich = require("../models/Yeuthich");

exports.getAllFavorites = async (req, res) => {
  try {
    const favorites = await Yeuthich.getAll();
    res.status(200).json({ data: favorites });
  } catch (error) {
    console.error("Error getting all favorites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getFavoriteById = async (req, res) => {
  try {
    const { id } = req.params;
    const [maKhachHang, maSanPham] = id.split('-').map(Number);
    
    const favorite = await Yeuthich.getById({ 
      MaKhachHang: maKhachHang, 
      MaSanPham: maSanPham 
    });
    
    if (!favorite) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    
    res.status(200).json(favorite);
  } catch (error) {
    console.error("Error getting favorite by id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { MaKhachHang, MaSanPham } = req.body;
    await Yeuthich.create({ MaKhachHang, MaSanPham });
    res.status(201).json({ message: "Favorite added successfully" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteFavorite = async (req, res) => {
  try {
    const { MaSanPham } = req.params;
    const MaKhachHang = req.user.MaKhachHang; // Get from token
    
    // Check if exists before deleting
    const exists = await Yeuthich.checkExisting({ 
      MaKhachHang: Number(MaKhachHang), 
      MaSanPham: Number(MaSanPham) 
    });
    
    if (!exists && req.user.VaiTro !== 'admin') {
      return res.status(403).json({ error: "Không có quyền xóa yêu thích này" });
    }
    
    await Yeuthich.delete({ 
      MaKhachHang: Number(MaKhachHang), 
      MaSanPham: Number(MaSanPham) 
    });
    res.status(200).json({ message: "Favorite deleted successfully" });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { MaKhachHang, MaSanPham } = req.body;
    
    // Check if already in wishlist
    const exists = await Yeuthich.checkExisting({ MaKhachHang, MaSanPham });
    if (exists) {
      return res.status(400).json({ error: "Product already in wishlist" });
    }

    await Yeuthich.create({ MaKhachHang, MaSanPham });
    res.status(201).json({ message: "Product added to wishlist successfully" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Thêm hàm controller này
// Thay đổi hàm getPopularFavorites
exports.getPopularFavorites = async (req, res) => {
  try {
    // Thêm logic phân quyền nếu cần
    const popularFavorites = await Yeuthich.getPopularFavorites();
    res.status(200).json(popularFavorites);
  } catch (error) {
    console.error("Error getting popular favorites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};