const Category = require("../models/Categories");
const path = require("path");
const fs = require("fs");

const getImageUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    const categoriesWithImageUrl = categories.map((category) => ({
      ...category,
      hinh_dm: category.hinh_dm ? getImageUrl(req, category.hinh_dm) : null,
    }));

    res.status(200).json({ success: true, data: categoriesWithImageUrl });
  } catch (error) {
    console.error("Error getting all categories:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      data: { ...category, hinh_dm: category.hinh_dm ? getImageUrl(req, category.hinh_dm) : null },
    });
  } catch (error) {
    console.error(`Error getting category with id ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { TenDanMuc } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!TenDanMuc) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const id = await Category.create(TenDanMuc, image);
    const newCategory = await Category.getById(id);

    res.status(201).json({
      success: true,
      data: { ...newCategory, hinh_dm: newCategory.hinh_dm ? getImageUrl(req, newCategory.hinh_dm) : null },
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Error creating category", error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { TenDanMuc } = req.body;
    const image = req.file ? req.file.filename : null;

    const existingCategory = await Category.getById(id);
    if (!existingCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Delete old image if new image is uploaded
    if (image && existingCategory.hinh_dm) {
      const oldImagePath = path.join(__dirname, "../../uploads", existingCategory.hinh_dm);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await Category.update(id, TenDanMuc, image || existingCategory.hinh_dm);
    const updatedCategory = await Category.getById(id);

    res.status(200).json({
      success: true,
      data: { ...updatedCategory, hinh_dm: updatedCategory.hinh_dm ? getImageUrl(req, updatedCategory.hinh_dm) : null },
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCategory = await Category.getById(id);
    
    if (!existingCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Delete associated image
    if (existingCategory.hinh_dm) {
      const imagePath = path.join(__dirname, "../../uploads", existingCategory.hinh_dm);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Category.delete(id);
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};