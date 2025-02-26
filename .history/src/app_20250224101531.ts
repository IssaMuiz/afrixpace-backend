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
import MongoStore from "connect-mongo";
import session from "express-session";
import authRoutes from "./routes/auth-routes";
import postRoutes from "./routes/post-routes";
import commentRoutes from "./routes/comment-routes";
import followRoutes from "./routes/follow-routes";
import notificationRoutes from "./routes/notification-routes";
import searchRoutes from "./routes/search-routes";
import { apiLimiter } from "./middlewares/rate-limiter-middleware";

dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(compression());
app.use(morgan("dev"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use((req, res, next) => {
  (req as any).io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

//secure session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use("/api", apiLimiter);

//routes
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/", followRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/search", searchRoutes);

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
