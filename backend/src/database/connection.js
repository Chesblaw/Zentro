// src/database/connection.js
const mongoose = require("mongoose");

let isConnected = false; // Prevent multiple connections (especially during dev with nodemon)

const connectDB = async () => {
  if (isConnected) {
    console.log("📦 Database already connected. Skipping new connection.");
    return;
  }

  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error("❌ Missing MONGO_URI in .env");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);

  try {
    console.log("⏳ Connecting to MongoDB...");

    const connection = await mongoose.connect(mongoURI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    });

    isConnected = true;

    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
    console.log(`📚 Database: ${connection.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);

    // Retry logic (optional)
    setTimeout(() => {
      console.log("🔄 Retrying MongoDB connection...");
      connectDB();
    }, 5000); // Retry every 5 seconds
  }
};

// Graceful Shutdown
const disconnectDB = async () => {
  if (!isConnected) return;

  try {
    await mongoose.connection.close();
    console.log("🔌 MongoDB disconnected gracefully.");
  } catch (err) {
    console.error("❌ Error during MongoDB disconnect:", err);
  }
};

process.on("SIGINT", disconnectDB);
process.on("SIGTERM", disconnectDB);

module.exports = { connectDB, disconnectDB };
