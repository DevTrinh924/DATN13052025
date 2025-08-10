const News = require("../models/Listnew");
const fs = require("fs");
const path = require("path");

const getImageUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

exports.getAllListnew = async (req, res) => {
  try {
    const news = await News.getAll();
    const newsWithImageUrl = news.map((item) => ({
      ...item,
      Hinh: item.Hinh ? getImageUrl(req, item.Hinh) : null
    }));
    res.json({ success: true, data: newsWithImageUrl });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tin tức:', error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi lấy danh sách tin tức" });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const news = await News.getById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tin tức" });
    }
    
    res.json({ 
      success: true,
      data: {
        ...news,
        Hinh: news.Hinh ? getImageUrl(req, news.Hinh) : null
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy tin tức theo ID:', error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

exports.createNews = async (req, res) => {
  try {
    if (!req.body.TieuDe || !req.body.MaDanMucTT) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const newsData = {
      TieuDe: req.body.TieuDe,
      MoTaNgan: req.body.MoTaNgan || '',
      Hinh: req.file ? req.file.filename : null,
      NoiDungChiTiet: req.body.NoiDungChiTiet || '',
      MaDanMucTT: req.body.MaDanMucTT
    };

    const newsId = await News.create(newsData);
    const newNews = await News.getById(newsId);

    res.status(201).json({
      success: true,
      data: {
        ...newNews,
        Hinh: newNews.Hinh ? getImageUrl(req, newNews.Hinh) : null
      }
    });
  } catch (error) {
    console.error('Lỗi khi tạo tin tức mới:', error);
    res.status(400).json({ success: false, message: "Lỗi khi tạo tin tức mới" });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const oldNews = await News.getById(id);

    if (!oldNews) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tin tức" });
    }

    let newsData = {
      TieuDe: req.body.TieuDe,
      MoTaNgan: req.body.MoTaNgan || oldNews.MoTaNgan,
      NoiDungChiTiet: req.body.NoiDungChiTiet || oldNews.NoiDungChiTiet,
      MaDanMucTT: req.body.MaDanMucTT || oldNews.MaDanMucTT,
      Hinh: oldNews.Hinh
    };

    if (req.file) {
      newsData.Hinh = req.file.filename;
      if (oldNews.Hinh) {
        const oldImagePath = path.join(__dirname, "../../uploads", oldNews.Hinh);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    await News.update(id, newsData);
    const updatedNews = await News.getById(id);

    res.json({
      success: true,
      data: {
        ...updatedNews,
        Hinh: updatedNews.Hinh ? getImageUrl(req, updatedNews.Hinh) : null
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật tin tức:', error);
    res.status(400).json({ success: false, message: "Lỗi khi cập nhật tin tức" });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const news = await News.getById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tin tức" });
    }

    if (news.Hinh) {
      const imagePath = path.join(__dirname, "../../uploads", news.Hinh);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await News.delete(req.params.id);
    res.json({ success: true, message: "Xóa tin tức thành công" });
  } catch (error) {
    console.error('Lỗi khi xóa tin tức:', error);
    res.status(500).json({ success: false, message: "Lỗi khi xóa tin tức" });
  }
};

exports.getNewsByCategory = async (req, res) => {
  try {
    const news = await News.getByCategory(req.params.categoryId);
    const newsWithImageUrl = news.map((item) => ({
      ...item,
      Hinh: item.Hinh ? getImageUrl(req, item.Hinh) : null
    }));
    res.json({ success: true, data: newsWithImageUrl });
  } catch (error) {
    console.error('Lỗi khi lấy tin theo danh mục:', error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy tin theo danh mục" });
  }
};