const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const { validateEnvironment } = require("./config/env");
validateEnvironment();

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
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Request logging. "dev" is concise and color-coded for local; "combined" is
// the standard Apache log line — better for hosted log aggregation on Render.
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error("Origin is not allowed by CORS.");
      error.statusCode = 403;
      callback(error);
    }
  })
);
app.use(express.json());

const authRateLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Try again later." }
});

app.use("/api/auth", authRateLimiter, authRoutes);
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

app.get(["/health", "/api/health"], (req, res) => {
  res.json({ status: "ok", service: "library-api" });
});

app.get("/api/ready", async (req, res) => {
  try {
    await pool.query("SELECT 1 AS test");
    res.json({ status: "ready", database: "connected" });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(503).json({ status: "unavailable", database: "disconnected" });
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
