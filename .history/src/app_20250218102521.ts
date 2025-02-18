import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import compression from "compression";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import authRoutes from "./routes/auth-routes";
import postRoutes from "./routes/post-routes";
import commentRoutes from "./routes/comment-routes";
import followRoutes from "./routes/follow-routes";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(compression());
app.use(morgan("dev"));
app.use((req, res, next) => {
  (req as any).io = io;
  next();
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/", followRoutes);

//Global error handler

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal server error" });
  }
);

export default app;
