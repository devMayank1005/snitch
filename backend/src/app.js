import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import cors from "cors";
const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
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
app.use("/api/auth", authRouter);
export { app };
