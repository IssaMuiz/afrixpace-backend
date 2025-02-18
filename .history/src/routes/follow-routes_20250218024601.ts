import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import { followUser } from "../controllers/follow-controller";
import { unFollowUser } from "../controllers/follow-controller";

const router = express.Router();

router.post("/follow", authMiddleware, followUser);
router.post("/unfollow", authMiddleware, unFollowUser);

export default router;
