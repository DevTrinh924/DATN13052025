const Promotion = require("../models/Promotion");
const fs = require("fs");
const path = require("path");

// const getImageUrl = (filename) => {
//   if (!filename) return null;
//   return `/uploads/${filename}`;
// };
exports.applyPromotion = async (req, res) => {
  try {
    const { promoCode, subtotal } = req.body;
    const userId = req.user.id;

    // Kiểm tra mã khuyến mãi
    const promotion = await Promotion.getByCode(promoCode);
    if (!promotion) {
      return res.status(400).json({
        success: false,
        message: 'Mã khuyến mãi không hợp lệ'
      });
    }

    // Kiểm tra ngày hiệu lực
    const currentDate = new Date();
    if (currentDate < new Date(promotion.NgayBatDau) || currentDate > new Date(promotion.NgayKetThuc)) {
      return res.status(400).json({
        success: false,
        message: 'Mã khuyến mãi đã hết hạn'
      });
    }

    // Tính toán giảm giá
    const discountAmount = Math.round(subtotal * (promotion.PhanTramGiam / 100));

    res.status(200).json({
      success: true,
      discountAmount,
      promotionName: promotion.TenKhuyenMai,
      message: 'Áp dụng mã khuyến mãi thành công'
    });
  } catch (error) {
    console.error('Lỗi khi áp dụng khuyến mãi:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi áp dụng khuyến mãi'
    });
  }
};
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.getAll(req.query);
    res.status(200).json({
      success: true,
      data: promotions,
      message: "Lấy danh sách khuyến mãi thành công",
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách khuyến mãi",
    });
  }
};

exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.getById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khuyến mãi",
      });
    }
    
    res.status(200).json({
      success: true,
      data: promotion,
      message: "Lấy thông tin khuyến mãi thành công",
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin khuyến mãi",
    });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const promotionData = {
      ...req.body,
      hinh_TM: req.file ? req.file.filename : null
    };

    const newPromotion = await Promotion.create(promotionData);
    
    res.status(201).json({
      success: true,
      data: newPromotion,
      message: "Tạo khuyến mãi thành công"
    });
  } catch (error) {
    console.error("Lỗi khi tạo khuyến mãi:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi tạo khuyến mãi"
    });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const currentPromotion = await Promotion.getById(req.params.id);
    if (!currentPromotion) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khuyến mãi",
      });
    }

    // Kiểm tra và xử lý dữ liệu đầu vào
    const { 
      TenKhuyenMai, 
      MoTa, 
      PhanTramGiam, 
      MaVoucher,
      NgayBatDau, 
      NgayKetThuc, 
      DieuKienApDung, 
      TrangThai 
    } = req.body;

    if (!TenKhuyenMai || !NgayBatDau || !NgayKetThuc || !PhanTramGiam) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc"
      });
    }

    if (new Date(NgayBatDau) > new Date(NgayKetThuc)) {
      return res.status(400).json({
        success: false,
        message: "Ngày kết thúc phải sau ngày bắt đầu"
      });
    }

    // Xử lý hình ảnh
    let hinh_TM = currentPromotion.hinh_TM;
    if (req.file) {
      // Nếu có file mới upload
      hinh_TM = req.file.filename;
      
      // Xóa file ảnh cũ nếu có
      if (currentPromotion.hinh_TM) {
        const oldImagePath = path.join(__dirname, '..', '..', 'uploads', currentPromotion.hinh_TM);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else if (req.body.removeImage === 'true') {
      // Nếu yêu cầu xóa ảnh
      if (currentPromotion.hinh_TM) {
        const oldImagePath = path.join(__dirname, '..', '..', 'uploads', currentPromotion.hinh_TM);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      hinh_TM = null;
    }

    const promotionData = {
      TenKhuyenMai,
      MoTa: MoTa || null,
      hinh_TM,
      PhanTramGiam,
      MaVoucher: MaVoucher || null,
      NgayBatDau,
      NgayKetThuc,
      DieuKienApDung: DieuKienApDung || null,
      TrangThai: TrangThai || 'chua_bat_dau'
    };

    const updatedPromotion = await Promotion.update(req.params.id, promotionData);
    
    res.status(200).json({
      success: true,
      data: updatedPromotion,
      message: "Cập nhật khuyến mãi thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật khuyến mãi:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi cập nhật khuyến mãi",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    await Promotion.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Xóa khuyến mãi thành công",
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa khuyến mãi",
    });
  }
};