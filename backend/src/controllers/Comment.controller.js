const Comment = require("../models/Comment");

exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.getAll();
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error getting all comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.approveComment = async (req, res) => {
  try {
    const { id } = req.params;
    await Comment.approve(id);
    res.status(200).json({ message: "Comment approved successfully" });
  } catch (error) {
    console.error(`Error approving comment with id ${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.createComment = async (req, res) => {
  try {
    const { SoSao, BinhLuan, MaSanPham } = req.body;
    // Lấy MaKhachHang từ thông tin người dùng đã đăng nhập
    const MaKhachHang = req.user.MaKhachHang;

    // Thêm validation cơ bản
    if (!SoSao || !BinhLuan || !MaSanPham) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin đánh giá" });
    }

    const commentId = await Comment.create({ 
      SoSao, 
      BinhLuan, 
      MaKhachHang, 
      MaSanPham 
    });

    res.status(201).json({ 
      success: true,
      message: "Đánh giá của bạn đã được gửi và chờ duyệt", 
      commentId 
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
};
exports.rejectComment = async (req, res) => {
  try {
    const { id } = req.params;
    await Comment.reject(id);
    res.status(200).json({ message: "Comment rejected successfully" });
  } catch (error) {
    console.error(`Error rejecting comment with id ${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await Comment.delete(id);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(`Error deleting comment with id ${id}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};