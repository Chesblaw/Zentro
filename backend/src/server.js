const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { connectDB } = require("./database/connection");
const newsRoutes = require("./routes/news");

const logger = require("./utils/logger");
const config = require("./config/environment");

dotenv.config();
connectDB();

const app = express();
const PORT = config.port || process.env.PORT || 3000;
const DEBUG = process.env.DEBUG === "true"; // enable for logging targets


app.use(helmet());
app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("combined"));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.use("/api/user", (req, res, next) => {
  const target = getNextTarget("USER");
  if (!target)
    return res.status(503).json({ message: "User service unavailable" });

  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { "^/api/user": "/" },
    onError: (err, req, res) => {
      console.error("User Proxy Error:", err);
      res.status(502).json({ message: "Bad Gateway - User Service" });
    },
  })(req, res, next);
});

app.use("/api/news", newsRoutes);
app.use('/api', require('./routes'));


const shutdown = () => {
  logger.info("Shutdown signal received. Cleaning up...");

  // Close MongoDB connection
  mongoose.connection.close(() => {
    logger.info("MongoDB connection closed.");

    // Close Redis connection
    closeRedisConnection()
      .then(() => {
        logger.info("All connections closed, exiting process.");
        process.exit(0);
      })
      .catch((err) => {
        logger.error("Error closing Redis connection:", err);
        process.exit(1);
      });
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(
    `🌐 Environment: ${process.env.NODE_ENV || config.nodeEnv || "development"}`
  );
  if (DEBUG) logger.info("🔍 Proxy debug mode is ON");
});

module.exports = app;