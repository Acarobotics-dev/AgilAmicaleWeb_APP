const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

/**
 * Builds the Express application (middleware + routes). Does not listen or connect mongoose.
 */
function createApp() {
  const CLIENT_URI_1 = process.env.CLIENT_URI_1;
  const CLIENT_URI_2 = process.env.CLIENT_URI_2;
  const ALLOWED_ORIGINS = [CLIENT_URI_1, CLIENT_URI_2].filter(Boolean);
  const MONGO_URI = process.env.MONGO_URI;
  const SESSION_SECRET = process.env.SESSION_SECRET;

  const app = express();

  app.use(helmet());
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Cross-Origin-Resource-Policy"],
      credentials: true,
    })
  );

  app.use("/uploads", express.static("uploads", {
    setHeaders: (res) => {
      const origin = res.req.headers.origin;
      if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
      res.setHeader("Cache-Control", "public, max-age=31536000");
    },
  }));

  app.use((req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  });

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  const sessionConfig = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
      autoRemove: "interval",
      autoRemoveInterval: 60,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  };

  if (process.env.NODE_ENV === "development") {
    sessionConfig.cookie.secure = false;
  }

  app.use(session(sessionConfig));

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

  app.get("/", (req, res) => {
    const mongoose = require("mongoose");
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  });

  const errorHandler = require("./middleware/errorHandling");
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
