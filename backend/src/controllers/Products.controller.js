const Product = require("../models/Products");
const fs = require("fs");
const path = require("path");

// Hàm tạo URL ảnh đầy đủ
const getImageUrl = (filename) => {
  if (!filename) return null;
  return `/uploads/${filename}`; // Thêm '/uploads/' vào trước tên file
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    const productsWithImageUrl = products.map((product) => ({
      ...product,
      Hinh: product.Hinh ? getImageUrl(product.Hinh) : null,
    }));
    res.json(productsWithImageUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({
      ...product,
      Hinh: getImageUrl(product.Hinh),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      Hinh: req.file ? req.file.filename : null,
      PhanLoai: req.body.PhanLoai || 'Unisex' // Mặc định là Unisex nếu không có
    };

    const productId = await Product.create(productData);
    const newProduct = await Product.getById(productId);

    res.status(201).json({
      ...newProduct,
      Hinh: newProduct.Hinh ? getImageUrl(newProduct.Hinh) : null,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const oldProduct = await Product.getById(id);

    let productData = { 
      ...req.body,
      PhanLoai: req.body.PhanLoai || 'Unisex' // Mặc định là Unisex nếu không có
    };

    if (req.file) {
      productData.Hinh = req.file.filename;
      // Xóa ảnh cũ nếu có
      if (oldProduct.Hinh) {
        const oldImagePath = path.join(
          __dirname,
          "../../uploads",
          oldProduct.Hinh
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    await Product.update(id, productData);
    const updatedProduct = await Product.getById(id);

    res.json({
      ...updatedProduct,
      Hinh: getImageUrl(updatedProduct.Hinh),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Xóa ảnh nếu có
    if (product.Hinh) {
      const imagePath = path.join(__dirname, "../../uploads", product.Hinh);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.delete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.getByCategory(req.params.categoryId);
    const productsWithImageUrl = products.map((product) => ({
      ...product,
      Hinh: product.Hinh ? getImageUrl(product.Hinh) : null,
    }));
    res.json(productsWithImageUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
