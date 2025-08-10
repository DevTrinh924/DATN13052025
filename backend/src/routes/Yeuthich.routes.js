const express = require("express");
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const YeuthichController = require("../controllers/Yeuthich.controller");

router.get("/", authMiddleware, YeuthichController.getAllFavorites);
router.post("/", authMiddleware, YeuthichController.addFavorite);
router.get("/:id", authMiddleware, YeuthichController.getFavoriteById);
router.post("/add", authMiddleware, YeuthichController.addToWishlist);
// Update the delete route to use a more standard RESTful approach
router.delete("/product/:MaSanPham", authMiddleware, YeuthichController.deleteFavorite);
router.get("/popular", YeuthichController.getPopularFavorites);

module.exports = router;