const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/Categories.controller");
const upload = require("../utils/upload");

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", upload.single("hinh_dm"), categoryController.createCategory);
router.put("/:id", upload.single("hinh_dm"), categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;