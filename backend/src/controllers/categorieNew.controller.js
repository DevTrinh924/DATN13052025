const CategoryNews = require('../models/categorieNew');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryNews.getAll();
    
    res.status(200).json({
      success: true,
      data: categories,
      message: 'Lấy danh sách thành công'
    });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách'
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await CategoryNews.getById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy danh mục' 
      });
    }

    res.status(200).json({
      success: true,
      data: category,
      message: 'Lấy thông tin thành công'
    });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin'
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { TenDanMucTT } = req.body;
    
    if (!TenDanMucTT || TenDanMucTT.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Tên danh mục không được để trống' 
      });
    }

    const newCategory = await CategoryNews.create(TenDanMucTT);
    
    res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Tạo danh mục thành công'
    });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo danh mục'
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { TenDanMucTT } = req.body;

    if (!TenDanMucTT || TenDanMucTT.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Tên danh mục không được để trống' 
      });
    }

    const updatedCategory = await CategoryNews.update(id, TenDanMucTT);
    
    res.status(200).json({
      success: true,
      data: updatedCategory,
      message: 'Cập nhật thành công'
    });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật'
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await CategoryNews.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa danh mục'
    });
  }
};
exports.addFavorite = async (req, res) => {
  try {
    const { MaKhachHang, MaSanPham } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!MaKhachHang || !MaSanPham) {
      return res.status(400).json({ error: "Thiếu thông tin yêu cầu" });
    }

    const result = await Yeuthich.add({ MaKhachHang, MaSanPham });
    res.status(201).json({ message: "Đã thêm vào yêu thích", data: result });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
