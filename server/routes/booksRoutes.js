const express = require("express");
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require("../controllers/booksController");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.post("/", authMiddleware, adminOnly, createBook);
router.put("/:id", authMiddleware, adminOnly, updateBook);
router.delete("/:id", authMiddleware, adminOnly, deleteBook);

module.exports = router;
