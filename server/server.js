const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

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
const servicesRoutes = require("./routes/servicesRoutes");
const readingProgressRoutes = require("./routes/readingProgressRoutes");
const { getStudyRoomAvailability } = require("./controllers/servicesController");

const app = express();

// Request logging. "dev" is concise and color-coded for local; "combined" is
// the standard Apache log line — better for hosted log aggregation on Render.
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
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
app.use("/api/reading-progress", readingProgressRoutes);
app.get("/api/study-room-bookings/availability", getStudyRoomAvailability);
app.get("/api/services/study-rooms/availability", getStudyRoomAvailability);
app.use("/api", servicesRoutes);
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

// 404 for any unmatched route. Has to come after all the real routes.
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler. Anything thrown synchronously inside a handler,
// or passed to next(err), ends up here so we don't duplicate the same 500
// shape in every catch block. Stack traces are logged but never sent back.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.expose ? err.message : "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
