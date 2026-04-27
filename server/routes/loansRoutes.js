const express = require("express");
const { getActiveLoans, createLoan, returnLoan } = require("../controllers/loansController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getActiveLoans);
router.post("/", createLoan);
router.post("/:id/return", returnLoan);

module.exports = router;
