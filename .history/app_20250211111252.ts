import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import compression from "compression";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

//routes

//Global error handler

app.use((err: any, req: any, res: any, next: any) => {
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

export default app;
