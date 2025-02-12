import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import compression from "compression";
import connectDB from "./config/db";
import authRoutes from "./routes/auth-routes";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

//routes
app.use("/api/auth", authRoutes);

//Global error handler

app.use((err: any, req: any, res: any, next: any) => {
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

export default app;
