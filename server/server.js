require("dotenv").config();
const mongoose = require("mongoose");
const createApp = require("./createApp");

const app = createApp();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URI_1 = process.env.CLIENT_URI_1;
const SESSION_SECRET = process.env.SESSION_SECRET;

// --- Environment Validation ---
const requiredEnvVars = {
  MONGO_URI,
  CLIENT_URI_1,
  SESSION_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
};

// Email variables are required only in production
if (process.env.NODE_ENV === "production") {
  requiredEnvVars.EMAIL_USER = process.env.EMAIL_USER;
  requiredEnvVars.EMAIL_HOST = process.env.EMAIL_HOST;
  requiredEnvVars.EMAIL_PORT = process.env.EMAIL_PORT;
  requiredEnvVars.EMAIL_PASS = process.env.EMAIL_PASS;
}

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingVars.join(", "));
  process.exit(1);
}

// --- Database Connection ---
const connectWithRetry = async (retries = 5, interval = 5000) => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: "majority",
    });
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `⚠️ MongoDB connection failed. Retrying in ${interval / 1000} seconds... (${retries} retries left)`
      );
      setTimeout(() => connectWithRetry(retries - 1, interval), interval);
    } else {
      console.error("❌ MongoDB connection failed after retries:", error);
      process.exit(1);
    }
  }
};

connectWithRetry();

// --- Graceful Shutdown ---
const shutdown = async () => {
  console.log("🛑 Received shutdown signal");
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
