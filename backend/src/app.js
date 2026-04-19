import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import cors from "cors";

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.use(cookieParser());

// Morgan logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/auth", authRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Centralized error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { error: error.toString() }),
  });
});

export { app };
