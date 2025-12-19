require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Parse CLIENT_URI as a comma-separated list
const CLIENT_URIS = process.env.CLIENT_URI
  ? process.env.CLIENT_URI.split(",").map(uri => uri.trim())
  : [];

const SESSION_SECRET = process.env.SESSION_SECRET;

// --- Environment Validation ---
const requiredEnvVars = {
  MONGO_URI,
  CLIENT_URI: process.env.CLIENT_URI,
  SESSION_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
};

// Email variables are required only in production
if (process.env.NODE_ENV === "production") {
  requiredEnvVars.EMAIL_USER = process.env.EMAIL_USER;
  requiredEnvVars.EMAIL_HOST = process.env.EMAIL_HOST;
  requiredEnvVars.EMAIL_PORT = process.env.EMAIL_PORT;
  requiredEnvVars.EMAIL_PASS = process.env.EMAIL_PASS;
  // Note: Twilio SMS variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
  // are optional. If missing, SMS features will be gracefully disabled via smsService.js
  // which logs warnings and skips notifications without causing startup failures.
}

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingVars.join(", "));
  process.exit(1);
}

// --- Security Middleware ---
app.use(helmet());
app.set("trust proxy", 1);

// --- CORS Configuration ---
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (CLIENT_URIS.includes(origin)) {
      return callback(null, true);
    }
    // Log disallowed origin and return false instead of throwing error
    console.warn(`⚠️ CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Cross-Origin-Resource-Policy"],
  credentials: true,
}));

// Static file headers
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path, stat) => {
    const origin = res.req.headers.origin;
    if (origin && CLIENT_URIS.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    res.set("Access-Control-Expose-Headers", "Content-Disposition");
    res.set("Cache-Control", "public, max-age=31536000");
  }
}));

// Extra security headers
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// --- Application Middleware ---
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// --- Session Configuration ---
const sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    collectionName: "sessions",
    ttl: 24 * 60 * 60,
    autoRemove: "interval",
    autoRemoveInterval: 60
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    // Use 'lax' for local development, 'none' only when secure is true (HTTPS/production)
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
};

if (process.env.NODE_ENV === "development") {
  sessionConfig.cookie.secure = false;
}

app.use(session(sessionConfig));

// --- Routes ---
const authRoutes = require("./routes/auth-routes/index");
const responsibleHouseRoutes = require("./routes/responsible-routes/houses-routes");
const responsibleHotelRoutes = require("./routes/responsible-routes/hotels-routes");
const responsibleEventsRoutes = require("./routes/responsible-routes/events-routes");
const responsibleConventionRoutes = require("./routes/responsible-routes/conventions-routes");
const responsibleBookingRoutes = require("./routes/responsible-routes/booking-routes");
const userContactRoutes = require("./routes/contact-routes");

app.use("/auth", authRoutes);
app.use("/responsible/house", responsibleHouseRoutes);
app.use("/responsible/hotel", responsibleHotelRoutes);
app.use("/responsible/events", responsibleEventsRoutes);
app.use("/responsible/convention", responsibleConventionRoutes);
app.use("/responsible/booking", responsibleBookingRoutes);
app.use("/api/contact", userContactRoutes);

// --- Health Check ---
app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// --- Global Error Handling ---
const errorHandler = require("./middleware/errorHandling");
app.use(errorHandler);

// --- Database Connection ---
const connectWithRetry = async (retries = 5, interval = 5000) => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: "majority"
    });
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Allowed Origins: ${CLIENT_URIS.join(", ")}`);
    });
  } catch (error) {
    if (retries > 0) {
      console.warn(`⚠️ MongoDB connection failed. Retrying in ${interval / 1000} seconds... (${retries} retries left)`);
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
