const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

require("dotenv").config();

const pool = require("./config/db");
const swaggerSpec = require("./swaggerSpec");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const booksRoutes = require("./routes/booksRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");
const loansRoutes = require("./routes/loansRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/loans", loansRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS test");
    res.json({
      message: "Database connected successfully",
      result: rows
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      message: "Database connection failed",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
