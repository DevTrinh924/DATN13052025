const express = require("express");
const router = express.Router();
const commentController = require("../controllers/Comment.controller");
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post("/", authMiddleware, commentController.createComment); // Thêm dòng này
router.get("/", commentController.getAllComments);
router.put("/:id/approve", commentController.approveComment);
router.put("/:id/reject", commentController.rejectComment);
router.delete("/:id", commentController.deleteComment);

module.exports = router;