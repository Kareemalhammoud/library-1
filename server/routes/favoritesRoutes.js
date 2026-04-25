const express = require("express");
const {
  getFavorites,
  addFavorite,
  removeFavorite
} = require("../controllers/favoritesController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Every favorites route is authenticated — favorites belong to a specific user.
router.use(authMiddleware);

router.get("/", getFavorites);
router.post("/:bookId", addFavorite);
router.delete("/:bookId", removeFavorite);

module.exports = router;
