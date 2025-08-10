const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const productsRoutes = require("./routes/Products.routes");
const categoryRoutes = require("./routes/category.routes");
const clientRoutes = require("./routes/CIient.routes");
const orderRoutes = require("./routes/Order.routes");
const categorieNewRoutes = require("./routes/categorieNew.routes");
const listnewRoutes = require("./routes/listnew.routes");
const PromotionRoutes = require("./routes/Promotion.routes");
const Comment = require("./routes/Comment.routes");
const Cart = require("./routes/Cart.routes");
const Yeuthich = require("./routes/Yeuthich.routes");

require("dotenv").config();

const app = express();

// Middleware
// Cấu hình CORS chi tiết
app.use(
  cors({
    origin: "http://localhost:5173", // Địa chỉ frontend của bạn
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
const uploadsDir = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categorienew", categorieNewRoutes);
app.use("/api/listnew", listnewRoutes);
app.use("/api/promotions", PromotionRoutes);
app.use("/api/comment", Comment);
app.use("/api/cart", Cart);
app.use("/api/yeuthich", Yeuthich);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
