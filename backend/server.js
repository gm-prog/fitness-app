// Load .env from an explicit absolute path (this directory) so configuration is
// found no matter which working directory the process is started from.
require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");
const { handleError } = require("./utils/errorHandler");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODEL = process.env.HF_MODEL || "Qwen/Qwen3-4B-Instruct-2507";
const HF_PROVIDER = process.env.HF_PROVIDER || "auto";
const NODE_ENV = process.env.NODE_ENV || "development";

if (!MONGO_URI) {
  logger.error("MONGO_URI is required. Add it to your backend .env file.");
  process.exit(1);
}

if (!HUGGINGFACE_API_KEY) {
  logger.error(
    "HUGGINGFACE_API_KEY is required. Add it to your backend .env file. Create a token at https://huggingface.co/settings/tokens"
  );
  process.exit(1);
}

// Loaded only after configuration is validated, so startup failures report the
// missing variable cleanly instead of surfacing a router-level stack trace.
// Router modules also validate their own settings (e.g. HF_MAX_TOKENS), so a
// misconfiguration is reported as a one-line error rather than a stack trace.
let authRouter;
let profileRouter;
let aiRouter;

try {
  authRouter = require("./routers/auth");
  profileRouter = require("./routers/profiles");
  aiRouter = require("./routers/ai");
} catch (error) {
  logger.error(`Startup failed while loading routers: ${error.message}`);
  process.exit(1);
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

logger.info("Server Configuration", {
  port: PORT,
  env: NODE_ENV,
  allowedOrigins,
  aiProvider: "huggingface",
  hfModel: HF_MODEL,
  hfProvider: HF_PROVIDER,
  // the API key itself is never logged
});

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    logger.warn(`CORS blocked for origin: ${origin}`);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
  skip: (req) => req.path === "/health",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please try again later." },
});

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(globalLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "fitness-app-backend",
    environment: NODE_ENV,
    uptime: Math.round(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
    },
  });
});

app.use("/auth", authLimiter, authRouter);
app.use("/profiles", profileRouter);
app.use("/ai", aiLimiter, aiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    method: req.method,
  });
});

// Error handler middleware
app.use(handleError);

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    logger.info("Connected to MongoDB");

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});
