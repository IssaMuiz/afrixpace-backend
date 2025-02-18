import express from "express";
import { getUserNotifications } from "../controllers/notification-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

router.get("/", authMiddleware, getUserNotifications);

export default router;
