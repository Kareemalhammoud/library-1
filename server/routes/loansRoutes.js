const express = require("express");
const { getActiveLoans, createLoan } = require("../controllers/loansController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getActiveLoans);
router.post("/", createLoan);

module.exports = router;
